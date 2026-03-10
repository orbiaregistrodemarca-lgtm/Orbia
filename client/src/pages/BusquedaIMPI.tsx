import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrbiaMascot } from '@/components/mascot/OrbiaMascot';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ArrowRight, ArrowLeft, Loader2, CheckCircle, 
  AlertTriangle, AlertCircle, FileText, RefreshCw, XCircle,
  ChevronDown, ChevronUp, ExternalLink, Shield, ShieldAlert, ShieldCheck, ShieldX,
  Clock, Construction
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const WEBHOOK_URL = 'https://n8n.srv1175451.hstgr.cloud/webhook/buscar-impi';

interface MarcaEncontrada {
  denominacion: string;
  expediente: string;
  registro: string;
  titular: string;
  clase: string;
  clases?: number[];
  clases_en_conflicto?: number[];
  estado: string;
  tipo: string;
  vigente?: boolean;
  similitud?: number;
  fecha_vencimiento?: string;
  link_impi?: string;
  imagen_url?: string;
}

interface AnalisisConflictos {
  nivel_riesgo: 'ALTO' | 'MEDIO' | 'BAJO' | 'NINGUNO';
  score: number;
  resumen: string;
  detalle: string;
  recomendaciones: string[];
  puede_continuar: boolean;
}

interface ResultadoBusqueda {
  total_marcas_encontradas: number;
  marcas_vigentes?: number;
  marca_exacta_existe: boolean;
  marcas_similares: MarcaEncontrada[];
  marcas_en_conflicto?: MarcaEncontrada[];
  otras_marcas?: MarcaEncontrada[];
  conflictos_en_tus_clases?: number;
}

interface BusquedaResponse {
  analisis: AnalisisConflictos;
  resultado_busqueda: ResultadoBusqueda;
}

type PageState = 'loading' | 'success' | 'error';

const COMING_SOON = true;

export default function BusquedaIMPI() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [pageState, setPageState] = useState<PageState>('loading');
  const [progreso, setProgreso] = useState(0);
  const [resultado, setResultado] = useState<BusquedaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [estudioId, setEstudioId] = useState('');
  const [showOtrasMarcas, setShowOtrasMarcas] = useState(false);
  const [nombreMarca, setNombreMarca] = useState('');
  const [claseNiza, setClaseNiza] = useState<number>(0);

  useEffect(() => {
    if (COMING_SOON) return;

    const storedResult = localStorage.getItem('orbia_last_result');
    
    if (!storedResult) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Primero debes clasificar tu marca",
      });
      setLocation('/clasificar');
      return;
    }

    try {
      const parsedResult = JSON.parse(storedResult);
      setEstudioId(parsedResult.id || '');
      setNombreMarca(parsedResult.nombre_marca || '');
      setClaseNiza(parsedResult.clase_niza || 0);
      
      buscarEnIMPI(parsedResult.id, parsedResult.nombre_marca, parsedResult.clase_niza);
    } catch (e) {
      console.error('Error loading data:', e);
      setError('Error al cargar los datos');
      setPageState('error');
    }
  }, []);

  const buscarEnIMPI = async (id: string, nombre: string, clase: number) => {
    setPageState('loading');
    setError(null);
    setProgreso(10);

    const progresoInterval = setInterval(() => {
      setProgreso(prev => Math.min(prev + 8, 90));
    }, 1000);

    try {
      const storedResult = localStorage.getItem('orbia_last_result');
      let todasLasClases: number[] = [clase];
      if (storedResult) {
        try {
          const estudio = JSON.parse(storedResult);
          if (estudio.clase_secundaria_1_numero) todasLasClases.push(estudio.clase_secundaria_1_numero);
          if (estudio.clase_secundaria_2_numero) todasLasClases.push(estudio.clase_secundaria_2_numero);
          if (estudio.clase_secundaria_3_numero) todasLasClases.push(estudio.clase_secundaria_3_numero);
        } catch {}
      }

      console.log('📤 Buscando en IMPI:', { estudio_id: id, nombre_marca: nombre, clase_niza: clase, todas_las_clases: todasLasClases });
      
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudio_id: id,
          nombre_marca: nombre,
          clase_niza: clase,
          todas_las_clases: todasLasClases
        })
      });

      clearInterval(progresoInterval);
      setProgreso(100);

      console.log('📥 Status:', response.status, response.statusText);
      
      const responseText = await response.text();
      console.log('📥 Respuesta raw:', responseText);
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }

      if (!responseText || responseText.trim() === '') {
        throw new Error('El webhook no devolvió datos. Verifica que el workflow en n8n tenga un nodo "Respond to Webhook" configurado.');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parseando JSON:', parseError);
        throw new Error('El webhook devolvió una respuesta inválida. Respuesta: ' + responseText.substring(0, 100));
      }
      
      const parsedData = Array.isArray(data) ? data[0] : data;
      console.log('📥 Respuesta IMPI:', parsedData);
      
      if (!parsedData || !parsedData.analisis) {
        throw new Error('El webhook no devolvió el formato esperado. Falta el campo "analisis".');
      }
      
      setResultado(parsedData);
      setPageState('success');
      
      localStorage.setItem('orbia_busqueda_impi', JSON.stringify(parsedData));
      
    } catch (err) {
      clearInterval(progresoInterval);
      console.error('❌ Error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setPageState('error');
    }
  };

  const handleRetry = () => {
    buscarEnIMPI(estudioId, nombreMarca, claseNiza);
  };

  const handleContinue = () => {
    setLocation('/logo');
  };

  const handleChangeName = () => {
    setLocation('/clasificar');
  };

  const getMascotState = () => {
    if (pageState === 'loading') return 'thinking';
    if (pageState === 'error') return 'worried';
    if (!resultado?.analisis) return 'idle';
    if (resultado?.analisis.nivel_riesgo === 'ALTO') return 'worried';
    if (resultado?.analisis.nivel_riesgo === 'NINGUNO') return 'happy';
    return 'idle';
  };

  const getBannerConfig = (nivel: string) => {
    switch (nivel) {
      case 'NINGUNO':
      case 'BAJO':
        return {
          bg: 'bg-emerald-900/20 border-emerald-700',
          text: 'text-emerald-300',
          subtext: 'text-emerald-400',
          icon: <ShieldCheck className="w-7 h-7 text-emerald-500" />,
          title: 'Puedes registrar esta marca',
          badgeBg: 'bg-emerald-900/30 text-emerald-300 border-emerald-700',
        };
      case 'MEDIO':
        return {
          bg: 'bg-amber-900/20 border-amber-700',
          text: 'text-amber-300',
          subtext: 'text-amber-400',
          icon: <ShieldAlert className="w-7 h-7 text-amber-500" />,
          title: 'Procede con precaucion',
          badgeBg: 'bg-amber-900/30 text-amber-300 border-amber-700',
        };
      case 'ALTO':
        return {
          bg: 'bg-red-900/20 border-red-700',
          text: 'text-red-300',
          subtext: 'text-red-400',
          icon: <ShieldX className="w-7 h-7 text-red-500" />,
          title: 'Conflicto detectado',
          badgeBg: 'bg-red-900/30 text-red-300 border-red-700',
        };
      default:
        return {
          bg: 'bg-muted/50 border-border',
          text: 'text-white',
          subtext: 'text-muted-foreground',
          icon: <Shield className="w-7 h-7 text-muted-foreground" />,
          title: 'Resultado de busqueda',
          badgeBg: 'bg-muted/50 text-muted-foreground border-border',
        };
    }
  };

  const renderLoading = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-center">
        <OrbiaMascot state="thinking" size="lg" />
      </div>

      <Card>
        <CardContent className="pt-8 pb-8 text-center">
          <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-bold text-white mb-2">
            Buscando en el registro IMPI
          </h2>
          <p className="text-muted-foreground mb-4">
            Verificando "<span className="font-semibold text-primary">{nombreMarca}</span>" en la base de datos oficial...
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Esto puede tomar 10-20 segundos
          </p>
          
          <div className="max-w-md mx-auto">
            <Progress value={progreso} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">{progreso}%</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderError = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-center">
        <OrbiaMascot state="worried" size="lg" />
      </div>

      <Card className="border-red-700 bg-red-900/20">
        <CardContent className="pt-8 pb-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-300 mb-2">
            Error en la busqueda
          </h2>
          <p className="text-red-400 mb-6">{error}</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleRetry} data-testid="button-retry">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
            <Button variant="outline" onClick={handleContinue} data-testid="button-skip">
              Continuar sin verificar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderMarca = (marca: MarcaEncontrada, index: number, isConflict: boolean = false) => (
    <div 
      key={index}
      className={`border rounded-xl p-4 transition-all ${isConflict ? 'bg-red-900/10 border-red-700/50 shadow-sm' : 'bg-card border-border hover:border-primary/30'}`}
      data-testid={`marca-encontrada-${index}`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-white text-base">{marca.denominacion || 'Sin nombre'}</p>
            {isConflict && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5 shrink-0" data-testid={`badge-tu-clase-${index}`}>
                Tu clase
              </Badge>
            )}
          </div>
          <div className="space-y-0.5">
            <p className="text-sm text-muted-foreground">
              Exp: {marca.expediente || 'N/A'} {marca.registro ? `| Reg: ${marca.registro}` : ''}
            </p>
            {marca.titular && (
              <p className="text-sm text-muted-foreground truncate">
                Titular: {marca.titular}
              </p>
            )}
            {marca.clases_en_conflicto && marca.clases_en_conflicto.length > 0 && (
              <p className="text-sm font-semibold text-red-400 mt-1">
                Conflicto en clase {marca.clases_en_conflicto.join(', ')}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {marca.similitud != null && (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                Similitud: {marca.similitud}%
              </span>
            )}
            {marca.fecha_vencimiento && (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                Vence: {marca.fecha_vencimiento}
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0 space-y-1.5">
          <Badge variant={marca.vigente === false ? 'outline' : 'secondary'} className={marca.vigente === false ? 'opacity-60' : ''}>
            {marca.clases ? `Clases: ${marca.clases.join(', ')}` : `Clase ${marca.clase || 'N/A'}`}
          </Badge>
          <p className={`text-xs ${marca.vigente ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
            {marca.estado || 'Estado desconocido'}
          </p>
          {marca.link_impi && (
            <a 
              href={marca.link_impi} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 hover:underline font-medium"
              data-testid={`link-expediente-${index}`}
            >
              Ver expediente <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
      {marca.imagen_url && (
        <img src={marca.imagen_url} alt={marca.denominacion} className="mt-3 max-h-16 object-contain rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      )}
    </div>
  );

  const renderSuccess = () => {
    if (!resultado) return null;
    
    const { analisis, resultado_busqueda } = resultado;
    const banner = getBannerConfig(analisis.nivel_riesgo);
    const marcasConflicto = resultado_busqueda.marcas_en_conflicto || [];
    const marcasOtras = resultado_busqueda.otras_marcas || [];
    const marcasFallback = (!marcasConflicto.length && !marcasOtras.length) ? (resultado_busqueda.marcas_similares || []) : [];
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-5"
      >
        <div className="flex justify-center">
          <OrbiaMascot state={getMascotState()} size="lg" />
        </div>

        <div className={`rounded-2xl border-2 p-5 ${banner.bg}`} data-testid="banner-riesgo">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              {banner.icon}
            </div>
            <div className="flex-1">
              <h2 className={`text-xl font-bold ${banner.text}`} data-testid="text-banner-title">
                {analisis.nivel_riesgo === 'NINGUNO' || analisis.nivel_riesgo === 'BAJO' ? '✅' : analisis.nivel_riesgo === 'MEDIO' ? '⚠️' : '❌'}{' '}
                {banner.title}
              </h2>
              <p className={`text-sm mt-1 ${banner.subtext}`}>
                {analisis.resumen}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold ${banner.badgeBg}`}>
                Score: {analisis.score}/100
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {resultado_busqueda.total_marcas_encontradas} marca(s) encontrada(s)
              </p>
              {resultado_busqueda.marca_exacta_existe && (
                <p className="text-xs font-bold text-red-600 mt-0.5">
                  Marca exacta existe
                </p>
              )}
            </div>
          </div>
        </div>

        {analisis.detalle && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-primary" />
                Detalle del analisis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">{analisis.detalle}</p>
            </CardContent>
          </Card>
        )}

        {marcasConflicto.length > 0 && (
          <Card className="border-red-700/50 overflow-hidden">
            <CardHeader className="bg-red-900/10 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-red-300">
                <AlertTriangle className="w-5 h-5" />
                Conflictos en TUS clases
                <Badge variant="destructive" className="ml-auto">{marcasConflicto.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {marcasConflicto.map((m, i) => renderMarca(m, i, true))}
              </div>
            </CardContent>
          </Card>
        )}

        {marcasOtras.length > 0 && (
          <Card className="overflow-hidden">
            <button
              type="button"
              className="w-full text-left"
              onClick={() => setShowOtrasMarcas(!showOtrasMarcas)}
              data-testid="button-toggle-otras-marcas"
            >
              <CardHeader className="pb-3 hover:bg-muted/30 transition-colors">
                <CardTitle className="flex items-center gap-2 text-base text-muted-foreground font-medium">
                  {showOtrasMarcas ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  {showOtrasMarcas ? 'Ocultar' : '+'} Ver otras marcas similares ({marcasOtras.length})
                  <span className="text-xs text-muted-foreground ml-1 font-normal">
                    — no afectan tu clase
                  </span>
                </CardTitle>
              </CardHeader>
            </button>
            <AnimatePresence>
              {showOtrasMarcas && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <CardContent className="pt-0 pb-4">
                    <div className="space-y-3 max-h-72 overflow-y-auto">
                      {marcasOtras.map((m, i) => renderMarca(m, i + marcasConflicto.length))}
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        )}

        {marcasFallback.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="w-5 h-5 text-primary" />
                Marcas encontradas en IMPI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {marcasFallback.map((m, i) => renderMarca(m, i))}
              </div>
            </CardContent>
          </Card>
        )}

        {analisis.recomendaciones && analisis.recomendaciones.length > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-primary">
                💡 Recomendaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analisis.recomendaciones.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-primary/80 text-sm">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-3 pt-4 border-t">
          {analisis.puede_continuar ? (
            <Button
              size="lg"
              className="w-full py-6 text-lg bg-emerald-600 hover:bg-emerald-700"
              onClick={handleContinue}
              data-testid="button-continue"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Continuar con el registro
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                className="w-full py-6 text-lg bg-amber-600 hover:bg-amber-700"
                onClick={handleContinue}
                data-testid="button-continue-anyway"
              >
                <AlertTriangle className="w-5 h-5 mr-2" />
                Continuar de todas formas
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full py-6 text-lg"
                onClick={handleChangeName}
                data-testid="button-change-name"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Cambiar nombre de marca
              </Button>
            </>
          )}
          
          <Button
            variant="ghost"
            onClick={handleChangeName}
            className="py-4"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a clasificacion
          </Button>
        </div>
      </motion.div>
    );
  };

  if (COMING_SOON) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm font-medium border-primary/30 bg-primary/5">
              Paso 1.5 de 4
            </Badge>
            <h1 className="text-3xl font-bold text-white mb-2">
              Verificación IMPI
            </h1>
            <p className="text-muted-foreground">
              Búsqueda en el registro oficial del IMPI
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-primary/20">
              <CardContent className="pt-10 pb-10 text-center">
                <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Construction className="w-10 h-10 text-primary" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-3" data-testid="text-coming-soon-title">
                  Verificación IMPI — Próximamente
                </h2>

                <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed" data-testid="text-coming-soon-description">
                  Estamos integrando la búsqueda en tiempo real con la base de datos del IMPI. 
                  Esta función estará disponible muy pronto.
                </p>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
                  <Clock className="w-4 h-4 text-primary/60" />
                  <span>Mientras tanto, puedes continuar con tu registro</span>
                </div>

                <Button
                  size="lg"
                  className="px-8 py-6 text-lg"
                  onClick={() => setLocation('/logo')}
                  data-testid="button-continue-registro"
                >
                  Continuar con mi registro
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center"
          >
            <Button
              variant="ghost"
              onClick={() => setLocation('/resultados')}
              className="text-muted-foreground"
              data-testid="button-back-results"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a resultados
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm font-medium border-primary/30 bg-primary/5">
            Paso 1.5 de 4
          </Badge>
          <h1 className="text-3xl font-bold text-white mb-2">
            Verificacion IMPI
          </h1>
          <p className="text-muted-foreground">
            Buscamos tu marca en el registro oficial del IMPI
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {pageState === 'loading' && renderLoading()}
          {pageState === 'error' && renderError()}
          {pageState === 'success' && renderSuccess()}
        </AnimatePresence>
      </div>
    </div>
  );
}
