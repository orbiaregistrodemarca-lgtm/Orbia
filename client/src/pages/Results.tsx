import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ClassificationResult, formatLegalDescription } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { OrbiaMascot } from '@/components/mascot/OrbiaMascot';
import { 
  CheckCircle, AlertTriangle, XCircle, Copy, ChevronDown, ChevronUp, 
  ArrowRight, ArrowLeft, Shield, Scale, Lightbulb, Search, FileText,
  AlertOctagon, Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface ClassCardProps {
  tipo: 'principal' | 'adicional';
  numero: number;
  nombre: string;
  descripcion: string;
  onCopy: () => void;
  index?: number;
}

function ClassCard({ tipo, numero, nombre, descripcion, onCopy, index = 0 }: ClassCardProps) {
  const [isOpen, setIsOpen] = useState(tipo === 'principal');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: tipo === 'principal' ? 0 : 0.05 * (index + 1) }}
    >
      <Card className={`shadow-md ${tipo === 'principal' ? 'border-t-4 border-t-secondary' : 'border-l-4 border-l-amber-400'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge 
              variant={tipo === 'principal' ? 'default' : 'secondary'}
              className={tipo === 'principal' ? 'bg-primary text-background' : 'bg-amber-900/30 text-amber-300 border-amber-700'}
            >
              {tipo === 'principal' ? 'CLASE PRINCIPAL' : `CLASE ADICIONAL ${index + 1}`}
            </Badge>
          </div>
          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-5xl font-bold text-primary">{numero}</span>
            <span className="text-lg font-medium text-muted-foreground">{nombre}</span>
          </div>
        </CardHeader>
        <CardContent>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                <span className="text-sm font-medium text-primary">Descripción para IMPI</span>
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3">
              <div className="bg-muted/50 p-4 rounded-lg border border-border max-h-48 overflow-y-auto">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {formatLegalDescription(descripcion)}
                </p>
              </div>
              <Button onClick={onCopy} variant="outline" size="sm" className="w-full gap-2">
                <Copy className="w-4 h-4" />
                Copiar descripción
              </Button>
            </CollapsibleContent>
          </Collapsible>
          {!isOpen && descripcion && (
            <p className="text-xs text-muted-foreground mt-2 truncate cursor-pointer" onClick={() => setIsOpen(true)}>
              {formatLegalDescription(descripcion).substring(0, 80)}...
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Results() {
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [brandName, setBrandName] = useState('');
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔍 Results: Buscando datos en localStorage...');
    
    const storedResult = localStorage.getItem('orbia_last_result');
    const storedInput = localStorage.getItem('orbia_last_input');
    
    if (!storedResult) {
      console.log('⚠️ No hay resultados, redirigiendo a /clasificar');
      setLocation('/clasificar');
      return;
    }

    try {
      const parsed = JSON.parse(storedResult);
      console.log('✅ Resultado parseado:', parsed);
      setResult(parsed);
      
      if (storedInput) {
        const input = JSON.parse(storedInput);
        setBrandName(input.nombre_marca);
      }
    } catch (e) {
      console.error('❌ Error parseando resultado:', e);
      setLocation('/clasificar');
    }
  }, [setLocation]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <OrbiaMascot state="thinking" size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: `${label} copiada al portapapeles`,
    });
  };

  const handleSuggestionClick = (name: string) => {
    localStorage.setItem('orbia_retry_name', name);
    const storedInput = localStorage.getItem('orbia_last_input');
    if (storedInput) {
      const input = JSON.parse(storedInput);
      localStorage.setItem('orbia_retry_desc', input.que_vende);
    }
    setLocation('/clasificar');
  };

  const getViabilityConfig = (level: string) => {
    switch (level) {
      case 'ALTA': 
        return {
          bg: 'bg-emerald-900/20 border-emerald-700',
          text: 'text-emerald-300',
          icon: <CheckCircle className="w-10 h-10 text-emerald-600" />,
          title: '¡Tu marca es registrable!',
          mascotState: 'happy' as const
        };
      case 'MEDIA': 
        return {
          bg: 'bg-amber-900/20 border-amber-700',
          text: 'text-amber-300',
          icon: <AlertTriangle className="w-10 h-10 text-amber-600" />,
          title: 'Tu marca tiene algunos riesgos',
          mascotState: 'idle' as const
        };
      case 'BAJA': 
        return {
          bg: 'bg-rose-900/20 border-rose-700',
          text: 'text-rose-300',
          icon: <XCircle className="w-10 h-10 text-rose-600" />,
          title: 'Tu marca tiene problemas para registrarse',
          mascotState: 'worried' as const
        };
      default:
        return {
          bg: 'bg-muted/50 border-border',
          text: 'text-muted-foreground',
          icon: null,
          title: 'Resultado',
          mascotState: 'idle' as const
        };
    }
  };

  const viabilityConfig = getViabilityConfig(result.nivel_viabilidad);
  const hasRealAnalysis = result.analisis_riesgo && result.analisis_riesgo.length > 20;
  const hasAlertaCritica = result.alerta_critica && result.alerta_critica !== 'Ninguna' && result.alerta_critica.length > 0;

  const secondaryClasses = [
    { numero: result.clase_secundaria_1_numero, nombre: result.clase_secundaria_1_nombre, descripcion: result.clase_secundaria_1_descripcion },
    { numero: result.clase_secundaria_2_numero, nombre: result.clase_secundaria_2_nombre, descripcion: result.clase_secundaria_2_descripcion },
    { numero: result.clase_secundaria_3_numero, nombre: result.clase_secundaria_3_nombre, descripcion: result.clase_secundaria_3_descripcion },
    { numero: result.clase_secundaria_4_numero, nombre: result.clase_secundaria_4_nombre, descripcion: result.clase_secundaria_4_descripcion },
    { numero: result.clase_secundaria_5_numero, nombre: result.clase_secundaria_5_nombre, descripcion: result.clase_secundaria_5_descripcion },
  ].filter(c => c.numero !== null && c.numero !== undefined);

  const totalClases = result.total_clases || (1 + secondaryClasses.length);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6"
        >
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-5 h-5 text-secondary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Estudio de Marca</h2>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary break-all" data-testid="text-brand-name">
              {brandName || result.nombre_marca}
            </h1>
          </div>
          <OrbiaMascot state={viabilityConfig.mascotState} size="md" />
        </motion.div>

        <div className="space-y-6">
          
          {/* ALERTA CRÍTICA */}
          {hasAlertaCritica && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-600 text-white rounded-xl p-5 flex items-start gap-4 shadow-lg"
              data-testid="alert-critica"
            >
              <AlertOctagon className="w-8 h-8 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-lg mb-1">Alerta Crítica: {result.alerta_critica}</p>
                {result.alerta_critica === 'Uso Comercial Detectado' && (
                  <p className="text-red-100 text-sm">
                    Se detectó uso comercial previo de este nombre. Esto puede impedir el registro de la marca.
                  </p>
                )}
                {result.alerta_critica === 'Nombre Famoso' && (
                  <p className="text-red-100 text-sm">
                    Este nombre está asociado a una persona famosa (Art. 173 LFPPI).
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* VIABILIDAD */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className={`rounded-2xl border-2 p-6 ${viabilityConfig.bg}`}
            data-testid="card-viabilidad"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                {viabilityConfig.icon}
              </div>
              <div className="flex-1">
                <h3 className={`text-2xl font-bold mb-2 ${viabilityConfig.text}`}>
                  {viabilityConfig.title}
                </h3>
                <Badge className={`mb-3 ${
                  result.nivel_viabilidad === 'ALTA' ? 'bg-emerald-600' :
                  result.nivel_viabilidad === 'MEDIA' ? 'bg-amber-600' : 'bg-rose-600'
                } text-white`}>
                  Viabilidad {result.nivel_viabilidad}
                </Badge>
                <p className={`text-sm leading-relaxed ${viabilityConfig.text} opacity-90`}>
                  {result.justificacion}
                </p>
              </div>
            </div>
          </motion.div>

          {/* VERIFICACIÓN IMPI */}
          {result.requiere_verificacion_impi && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-start gap-3"
            >
              <Search className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-primary text-sm">Verificación IMPI Recomendada</p>
                <p className="text-primary/70 text-sm">
                  Se recomienda verificar la disponibilidad de este nombre en la base de datos del IMPI antes de proceder.
                </p>
              </div>
            </motion.div>
          )}

          {/* ALERTA NOMBRE FAMOSO */}
          {result.es_nombre_famoso && !hasAlertaCritica && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-red-900/20 border-2 border-red-700 rounded-xl p-5 flex items-start gap-4"
              data-testid="alert-nombre-famoso"
            >
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-300 mb-1">Alerta: Nombre Famoso Detectado</p>
                <p className="text-sm text-red-400">
                  Este nombre está asociado a una persona famosa, lo cual viola el Artículo 173 de la Ley Federal de Protección a la Propiedad Industrial (LFPPI).
                </p>
              </div>
            </motion.div>
          )}

          {/* ANÁLISIS DE RIESGO */}
          {hasRealAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="shadow-md border-l-4 border-l-amber-500">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Análisis de Riesgo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed" data-testid="text-analisis-riesgo">
                    {result.analisis_riesgo}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* CLASES A REGISTRAR */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-primary">Clasificación NIZA</h2>
              </div>
              <Badge variant="outline" className="text-primary border-primary">
                {totalClases} {totalClases === 1 ? 'Clase' : 'Clases'} para Protección
              </Badge>
            </div>
            
            <div className="grid gap-4">
              {/* Clase Principal */}
              <ClassCard
                tipo="principal"
                numero={result.clase_niza}
                nombre={result.nombre_clase}
                descripcion={result.clase_principal_descripcion || result.descripcion_juridica}
                onCopy={() => copyToClipboard(result.clase_principal_descripcion || result.descripcion_juridica, 'Descripción clase principal')}
              />

              {/* Clases Secundarias */}
              {secondaryClasses.length > 0 && (
                <div className="grid md:grid-cols-2 gap-4 mt-2">
                  {secondaryClasses.map((clase, index) => (
                    <ClassCard
                      key={index}
                      tipo="adicional"
                      numero={clase.numero!}
                      nombre={clase.nombre || ''}
                      descripcion={clase.descripcion || ''}
                      onCopy={() => copyToClipboard(clase.descripcion || '', `Descripción clase ${clase.numero}`)}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* RECOMENDACIÓN EXPERTA */}
          {result.recomendacion_experta && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="shadow-lg bg-gradient-to-br from-secondary/20 to-primary/10 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    Recomendación del Experto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white/80 leading-relaxed">
                    {result.recomendacion_experta}
                  </p>
                  {result.siguiente_paso && (
                    <div className="bg-card/60 rounded-lg p-4 border border-primary/20">
                      <p className="text-sm font-medium text-primary flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{result.siguiente_paso}</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* PALABRAS CLAVE */}
          {result.palabras_clave && result.palabras_clave.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="space-y-3"
            >
              <h3 className="font-bold text-primary flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Palabras Clave de tu Marca
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.palabras_clave.map((keyword, i) => (
                  <Badge 
                    key={i} 
                    variant="secondary" 
                    className="px-3 py-1.5 text-sm bg-primary/10 text-primary hover:bg-primary/20"
                    data-testid={`badge-keyword-${i}`}
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}

          {/* NOMBRES ALTERNATIVOS */}
          {result.nivel_viabilidad !== 'ALTA' && result.sugerencias_nombres && result.sugerencias_nombres.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-emerald-700/30 bg-gradient-to-br from-emerald-900/20 to-teal-900/20">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-emerald-600" />
                    Nombres Alternativos Sugeridos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Estos nombres tienen mayor probabilidad de ser aprobados por el IMPI:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {result.sugerencias_nombres.map((name, i) => (
                      <Button 
                        key={i} 
                        variant="outline" 
                        className="bg-card hover:bg-emerald-900/20 hover:text-emerald-300 hover:border-emerald-700 shadow-sm"
                        onClick={() => handleSuggestionClick(name)}
                        data-testid={`button-sugerencia-${i}`}
                      >
                        {name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ACCIONES */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4 pt-6 border-t"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/busqueda-impi" className="flex-1">
                <Button 
                  size="lg" 
                  className="w-full bg-primary text-lg py-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all" 
                  data-testid="button-continuar"
                >
                  Continuar con el registro <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              {secondaryClasses.length > 0 && (
                <Button 
                  size="lg" 
                  variant="outline"
                  className="flex-1 py-6 border-2 border-secondary text-secondary hover:bg-secondary/5"
                  data-testid="button-proteccion-total"
                >
                  Protección Total ({totalClases} clases)
                </Button>
              )}
            </div>
            <div className="flex justify-center">
              <Link href="/clasificar">
                <Button variant="ghost" className="text-muted-foreground" data-testid="button-clasificar-otra">
                  <ArrowLeft className="mr-2 w-4 h-4" /> Clasificar otra marca
                </Button>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
