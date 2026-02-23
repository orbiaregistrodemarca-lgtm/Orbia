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
  AlertTriangle, AlertCircle, FileText, RefreshCw, XCircle
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

  const getNivelRiesgoStyle = (nivel: string) => {
    switch (nivel) {
      case 'ALTO': return 'bg-red-100 text-red-800 border-red-300';
      case 'MEDIO': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'BAJO': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'NINGUNO': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getNivelRiesgoIcon = (nivel: string) => {
    switch (nivel) {
      case 'ALTO': return <XCircle className="w-6 h-6 text-red-600" />;
      case 'MEDIO': return <AlertTriangle className="w-6 h-6 text-amber-600" />;
      case 'BAJO': return <AlertCircle className="w-6 h-6 text-blue-600" />;
      case 'NINGUNO': return <CheckCircle className="w-6 h-6 text-emerald-600" />;
      default: return <Search className="w-6 h-6 text-slate-600" />;
    }
  };

  const getMascotState = () => {
    if (pageState === 'loading') return 'thinking';
    if (pageState === 'error') return 'worried';
    if (!resultado?.analisis) return 'idle';
    if (resultado?.analisis.nivel_riesgo === 'ALTO') return 'worried';
    if (resultado?.analisis.nivel_riesgo === 'NINGUNO') return 'happy';
    return 'idle';
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
          <h2 className="text-xl font-bold text-slate-800 mb-2">
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

      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-8 pb-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">
            Error en la búsqueda
          </h2>
          <p className="text-red-700 mb-6">{error}</p>
          
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

  const renderSuccess = () => {
    if (!resultado) return null;
    
    const { analisis, resultado_busqueda } = resultado;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="flex justify-center">
          <OrbiaMascot state={getMascotState()} size="lg" />
        </div>

        <Card className={`border-2 ${getNivelRiesgoStyle(analisis.nivel_riesgo)}`}>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                {getNivelRiesgoIcon(analisis.nivel_riesgo)}
                <div>
                  <p className="font-bold text-lg">
                    Riesgo {analisis.nivel_riesgo}
                  </p>
                  <p className="text-sm opacity-80">
                    Score: {analisis.score}/100
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="mb-1">
                  {resultado_busqueda.total_marcas_encontradas} marca(s) encontrada(s)
                </Badge>
                {resultado_busqueda.marca_exacta_existe && (
                  <p className="text-xs font-semibold text-red-600">
                    ⚠️ Marca exacta existe
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-primary" />
              Análisis de Conflictos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">{analisis.resumen}</p>
          </CardContent>
        </Card>

        {(() => {
          const marcasConflicto = resultado_busqueda.marcas_en_conflicto || [];
          const marcasOtras = resultado_busqueda.otras_marcas || [];
          const marcasFallback = (!marcasConflicto.length && !marcasOtras.length) ? (resultado_busqueda.marcas_similares || []) : [];

          const renderMarca = (marca: MarcaEncontrada, index: number, isConflict: boolean = false) => (
            <div 
              key={index}
              className={`border rounded-lg p-3 ${isConflict ? 'bg-red-50 border-red-200' : 'bg-slate-50'}`}
              data-testid={`marca-encontrada-${index}`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{marca.denominacion || 'Sin nombre'}</p>
                  <p className="text-sm text-muted-foreground">
                    Expediente: {marca.expediente || 'N/A'}
                  </p>
                  {marca.titular && (
                    <p className="text-sm text-muted-foreground">
                      Titular: {marca.titular}
                    </p>
                  )}
                  {marca.clases_en_conflicto && marca.clases_en_conflicto.length > 0 && (
                    <p className="text-sm font-semibold text-red-600 mt-1">
                      Clase {marca.clases_en_conflicto.join(', ')} en conflicto
                    </p>
                  )}
                  {marca.similitud != null && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Similitud: {marca.similitud}%
                    </p>
                  )}
                  {marca.fecha_vencimiento && (
                    <p className="text-xs text-muted-foreground">
                      Vence: {marca.fecha_vencimiento}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <Badge variant={marca.vigente === false ? 'outline' : 'secondary'} className={marca.vigente === false ? 'opacity-60' : ''}>
                    {marca.clases ? `Clases: ${marca.clases.join(', ')}` : `Clase ${marca.clase || 'N/A'}`}
                  </Badge>
                  <p className={`text-xs mt-1 ${marca.vigente ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
                    {marca.estado || 'Estado desconocido'}
                  </p>
                  {marca.link_impi && (
                    <a href={marca.link_impi} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                      Ver en IMPI
                    </a>
                  )}
                </div>
              </div>
              {marca.imagen_url && (
                <img src={marca.imagen_url} alt={marca.denominacion} className="mt-2 max-h-16 object-contain rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
            </div>
          );

          return (
            <>
              {marcasConflicto.length > 0 && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-red-800">
                      <AlertTriangle className="w-5 h-5" />
                      Conflictos en TUS clases ({marcasConflicto.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {marcasConflicto.map((m, i) => renderMarca(m, i, true))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {marcasOtras.length > 0 && (
                <Card>
                  <CardHeader className="cursor-pointer" onClick={() => setShowOtrasMarcas(!showOtrasMarcas)}>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Search className="w-5 h-5 text-primary" />
                      Otras marcas similares en clases diferentes ({marcasOtras.length})
                      <span className="text-xs text-muted-foreground ml-auto">
                        {showOtrasMarcas ? '(clic para colapsar)' : '(clic para expandir)'}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  {showOtrasMarcas && (
                    <CardContent>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {marcasOtras.map((m, i) => renderMarca(m, i))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}

              {marcasFallback.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Search className="w-5 h-5 text-primary" />
                      Marcas encontradas en IMPI
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {marcasFallback.map((m, i) => renderMarca(m, i))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          );
        })()}

        {analisis.recomendaciones && analisis.recomendaciones.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
                💡 Recomendaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-blue-700 text-sm space-y-1">
                {analisis.recomendaciones.map((rec, index) => (
                  <li key={index}>{rec}</li>
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
            Volver a clasificación
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm font-medium border-primary/30 bg-primary/5">
            Paso 1.5 de 4
          </Badge>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Verificación IMPI
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
