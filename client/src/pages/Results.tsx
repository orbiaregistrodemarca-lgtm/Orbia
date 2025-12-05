import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ClassificationResult } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { OrbiaMascot } from '@/components/mascot/OrbiaMascot';
import { CheckCircle, AlertTriangle, XCircle, Copy, ChevronDown, ChevronUp, ArrowRight, ArrowLeft, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function Results() {
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [brandName, setBrandName] = useState('');
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const storedResult = localStorage.getItem('orbia_last_result');
    const storedInput = localStorage.getItem('orbia_last_input');
    
    if (!storedResult) {
      setLocation('/clasificar');
      return;
    }

    try {
      setResult(JSON.parse(storedResult));
      if (storedInput) {
        const input = JSON.parse(storedInput);
        setBrandName(input.nombre_marca);
      }
    } catch (e) {
      console.error("Error parsing result", e);
      setLocation('/clasificar');
    }
  }, [setLocation]);

  if (!result) return null;

  const copyDescription = () => {
    navigator.clipboard.writeText(result.descripcion_juridica);
    toast({
      title: "Copiado",
      description: "Descripción jurídica copiada al portapapeles",
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

  const getViabilityColor = (level: string) => {
    switch (level) {
      case 'ALTA': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
      case 'MEDIA': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
      case 'BAJA': return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getViabilityIcon = (level: string) => {
    switch (level) {
      case 'ALTA': return <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />;
      case 'MEDIA': return <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />;
      case 'BAJA': return <XCircle className="w-8 h-8 text-rose-600 dark:text-rose-400" />;
      default: return null;
    }
  };

  const mascotState = result.nivel_viabilidad === 'ALTA' ? 'happy' : result.nivel_viabilidad === 'BAJA' ? 'worried' : 'idle';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Resultados para</h2>
            <h1 className="text-4xl font-display font-bold text-primary break-all">{brandName || result.nombre_marca}</h1>
          </div>
          <OrbiaMascot state={mascotState} size="md" />
        </div>

        <div className="grid gap-6">
          {/* Viability Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border-2 p-6 flex items-center gap-6 shadow-sm ${getViabilityColor(result.nivel_viabilidad)}`}
          >
            <div className="shrink-0">
              {getViabilityIcon(result.nivel_viabilidad)}
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Viabilidad: {result.nivel_viabilidad}</h3>
              <p className="text-sm opacity-90">{result.justificacion}</p>
            </div>
          </motion.div>

          {/* Famous Name Warning */}
          {result.es_nombre_famoso && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200"
            >
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Alerta de Nombre Famoso</p>
                <p className="text-sm">Este nombre utiliza una persona famosa, lo cual está prohibido por el Artículo 173 de la LFPPI. El registro será muy probablemente rechazado.</p>
              </div>
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Classification Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-primary">Clasificación NIZA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold text-secondary">{result.clase_niza}</span>
                  <span className="text-xl font-medium text-muted-foreground">Clase</span>
                </div>
                <p className="text-lg font-medium mb-4">{result.nombre_clase}</p>
                
                {result.clases_adicionales && (
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200">
                    <p className="font-bold flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" />
                      Protección Adicional
                    </p>
                    <p className="mt-1">{result.clases_adicionales}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Risk Analysis */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-primary">Análisis de Riesgo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {result.analisis_riesgo}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Legal Description */}
          <Card className="shadow-md">
            <Collapsible open={isDescriptionOpen} onOpenChange={setIsDescriptionOpen}>
              <div className="p-6 flex items-center justify-between">
                <CardTitle className="text-primary flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Descripción para IMPI
                </CardTitle>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {isDescriptionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
              
              <div className="px-6 pb-6">
                <CollapsibleContent className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border text-sm leading-relaxed font-mono text-slate-600 dark:text-slate-400">
                    {result.descripcion_juridica}
                  </div>
                  <Button onClick={copyDescription} variant="outline" className="w-full gap-2">
                    <Copy className="w-4 h-4" />
                    Copiar descripción
                  </Button>
                </CollapsibleContent>
                {!isDescriptionOpen && (
                  <p className="text-sm text-muted-foreground truncate cursor-pointer hover:text-primary transition-colors" onClick={() => setIsDescriptionOpen(true)}>
                    {result.descripcion_juridica.substring(0, 100)}...
                  </p>
                )}
              </div>
            </Collapsible>
          </Card>

          {/* Keywords */}
          <div className="space-y-3">
            <h3 className="font-bold text-primary">Palabras Clave Detectadas</h3>
            <div className="flex flex-wrap gap-2">
              {result.palabras_clave.map((keyword, i) => (
                <Badge key={i} variant="secondary" className="px-3 py-1 text-sm">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>

          {/* Suggestions (if low viability) */}
          {result.nivel_viabilidad !== 'ALTA' && result.sugerencias_nombres.length > 0 && (
            <Card className="border-secondary/20 bg-blue-50/50 dark:bg-blue-900/10">
              <CardHeader>
                <CardTitle className="text-primary">Nombres Alternativos Sugeridos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {result.sugerencias_nombres.map((name, i) => (
                    <Button 
                      key={i} 
                      variant="outline" 
                      className="bg-white hover:bg-blue-50 hover:text-primary border-blue-200 shadow-sm"
                      onClick={() => handleSuggestionClick(name)}
                    >
                      {name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t mt-4">
            <Button size="lg" className="flex-1 bg-primary text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              Continuar con el registro <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Link href="/clasificar">
              <Button variant="outline" size="lg" className="flex-1">
                <ArrowLeft className="mr-2 w-5 h-5" /> Clasificar otra marca
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
