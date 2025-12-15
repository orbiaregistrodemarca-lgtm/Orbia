import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrbiaMascot } from '@/components/mascot/OrbiaMascot';
import { analyzeLogo, imageToBase64, LogoAnalysisResult, ClassificationResult } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Palette, CheckCircle, XCircle, AlertTriangle, 
  ArrowRight, ArrowLeft, Loader2, X, Image as ImageIcon,
  Sparkles, Shield, Eye
} from 'lucide-react';

type PageState = 'choice' | 'upload' | 'generating' | 'analyzing' | 'results';

export default function Logo() {
  const [pageState, setPageState] = useState<PageState>('choice');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [brandName, setBrandName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [estudioId, setEstudioId] = useState('');
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [result, setResult] = useState<LogoAnalysisResult | null>(null);
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  
  const [loadingTip, setLoadingTip] = useState(0);
  const tips = [
    "Un logo distintivo es más fácil de registrar",
    "Evita similitudes con marcas famosas",
    "Los logos simples son más memorables",
    "El IMPI revisa que tu logo no confunda consumidores",
    "Un buen logo transmite la esencia de tu marca"
  ];

  useEffect(() => {
    const storedResult = localStorage.getItem('orbia_last_result');
    const storedInput = localStorage.getItem('orbia_last_input');
    
    if (!storedResult || !storedInput) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Primero debes clasificar tu marca",
      });
      setLocation('/clasificar');
      return;
    }

    try {
      const parsedResult: ClassificationResult = JSON.parse(storedResult);
      const parsedInput = JSON.parse(storedInput);
      
      setBrandName(parsedInput.nombre_marca);
      setBusinessDescription(parsedInput.que_vende);
      setEstudioId(parsedResult.id || crypto.randomUUID());
    } catch (e) {
      console.error('Error loading data:', e);
      setLocation('/clasificar');
    }
  }, [setLocation, toast]);

  useEffect(() => {
    if (pageState === 'analyzing' || pageState === 'generating') {
      const interval = setInterval(() => {
        setLoadingTip((prev) => (prev + 1) % tips.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [pageState]);

  const handleFileSelect = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Archivo muy grande",
        description: "El tamaño máximo es 5MB",
      });
      return;
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Formato no válido",
        description: "Solo se aceptan PNG, JPG o SVG",
      });
      return;
    }

    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const clearUpload = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
  };

  const analyzeUploadedLogo = async () => {
    if (!uploadedFile) return;
    
    setPageState('analyzing');
    
    try {
      const base64 = await imageToBase64(uploadedFile);
      
      const analysisResult = await analyzeLogo({
        estudio_id: estudioId,
        nombre_marca: brandName,
        descripcion_negocio: businessDescription,
        tiene_logo: true,
        logo_base64: base64,
      });
      
      setResult(analysisResult);
      setPageState('results');
    } catch (error) {
      console.error('Error analyzing logo:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No pudimos analizar tu logo. Intenta de nuevo.",
      });
      setPageState('upload');
    }
  };

  const generateLogos = async () => {
    setPageState('generating');
    
    try {
      const analysisResult = await analyzeLogo({
        estudio_id: estudioId,
        nombre_marca: brandName,
        descripcion_negocio: businessDescription,
        tiene_logo: false,
      });
      
      setResult(analysisResult);
      setPageState('results');
    } catch (error) {
      console.error('Error generating logos:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No pudimos generar logos. Intenta de nuevo.",
      });
      setPageState('choice');
    }
  };

  const selectGeneratedLogo = (logoUrl: string) => {
    setSelectedLogo(logoUrl);
    localStorage.setItem('orbia_selected_logo', logoUrl);
  };

  const continueToNextStep = () => {
    if (result) {
      localStorage.setItem('orbia_logo_result', JSON.stringify(result));
      if (selectedLogo) {
        localStorage.setItem('orbia_selected_logo', selectedLogo);
      }
    }
    toast({
      title: "Próximamente",
      description: "El siguiente módulo estará disponible pronto",
    });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'BAJO': return 'bg-emerald-100 text-emerald-800';
      case 'MEDIO': return 'bg-amber-100 text-amber-800';
      case 'ALTO': return 'bg-rose-100 text-rose-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getDistintividadColor = (level: string) => {
    switch (level) {
      case 'ALTA': return 'bg-emerald-600';
      case 'MEDIA': return 'bg-amber-500';
      case 'BAJA': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6"
        >
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-5 h-5 text-secondary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Módulo 2</h2>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-primary">
              Análisis de Logo
            </h1>
            <p className="text-muted-foreground mt-2">
              Verifica que tu logo sea registrable ante el IMPI
            </p>
          </div>
          <OrbiaMascot 
            state={pageState === 'analyzing' || pageState === 'generating' ? 'thinking' : 'idle'} 
            size="md" 
          />
        </motion.div>

        <AnimatePresence mode="wait">
          
          {/* CHOICE STATE */}
          {pageState === 'choice' && (
            <motion.div
              key="choice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card className="shadow-lg border-t-4 border-t-secondary">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl">
                    ¿Ya tienes un logo para <span className="text-secondary">{brandName}</span>?
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className="cursor-pointer border-2 hover:border-secondary hover:shadow-lg transition-all h-full"
                        onClick={() => setPageState('upload')}
                        data-testid="option-upload"
                      >
                        <CardContent className="p-8 text-center">
                          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                            <Upload className="w-10 h-10 text-secondary" />
                          </div>
                          <h3 className="text-xl font-bold text-primary mb-2">
                            Sí, quiero subir mi logo
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            Analizaremos si es registrable y te daremos recomendaciones
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className="cursor-pointer border-2 hover:border-accent hover:shadow-lg transition-all h-full"
                        onClick={generateLogos}
                        data-testid="option-generate"
                      >
                        <CardContent className="p-8 text-center">
                          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
                            <Sparkles className="w-10 h-10 text-accent" />
                          </div>
                          <h3 className="text-xl font-bold text-primary mb-2">
                            No tengo logo, genera opciones
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            Crearemos 2 propuestas únicas con IA para tu marca
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                    
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setLocation('/resultados')}
                  className="text-muted-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a clasificación
                </Button>
              </div>
            </motion.div>
          )}

          {/* UPLOAD STATE */}
          {pageState === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-secondary" />
                    Sube tu logo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {!previewUrl ? (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={`
                        border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer
                        ${isDragging 
                          ? 'border-secondary bg-secondary/5' 
                          : 'border-slate-300 hover:border-secondary hover:bg-slate-50'
                        }
                      `}
                      onClick={() => document.getElementById('file-input')?.click()}
                      data-testid="dropzone"
                    >
                      <input
                        id="file-input"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                      <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-secondary' : 'text-slate-400'}`} />
                      <p className="text-lg font-medium text-primary mb-2">
                        Arrastra tu logo aquí
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        o haz clic para seleccionar
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <Badge variant="secondary">PNG</Badge>
                        <Badge variant="secondary">JPG</Badge>
                        <Badge variant="secondary">SVG</Badge>
                        <Badge variant="outline">Max 5MB</Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="bg-slate-100 rounded-xl p-8 flex items-center justify-center min-h-[300px]">
                        <img 
                          src={previewUrl} 
                          alt="Preview del logo" 
                          className="max-w-full max-h-[280px] object-contain rounded-lg shadow-md"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-4 right-4"
                        onClick={clearUpload}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <p className="text-center text-sm text-muted-foreground mt-3">
                        {uploadedFile?.name}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={analyzeUploadedLogo}
                      disabled={!uploadedFile}
                      className="flex-1 py-6 text-lg bg-primary"
                      data-testid="button-analyze"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      Analizar logo
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPageState('choice')}
                      className="py-6"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Volver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* LOADING STATE */}
          {(pageState === 'analyzing' || pageState === 'generating') && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <OrbiaMascot state="thinking" size="lg" className="mb-8" />
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                <Loader2 className="animate-spin" />
                {pageState === 'analyzing' ? 'Analizando tu logo...' : 'Generando propuestas...'}
              </h2>
              <div className="h-16 flex items-center justify-center w-full max-w-md px-4">
                <motion.p 
                  key={loadingTip}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-muted-foreground text-lg"
                >
                  "{tips[loadingTip]}"
                </motion.p>
              </div>
              <div className="w-64 h-2 bg-slate-200 rounded-full mt-8 overflow-hidden">
                <motion.div 
                  className="h-full bg-secondary"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 12, ease: "linear" }}
                />
              </div>
            </motion.div>
          )}

          {/* RESULTS STATE */}
          {pageState === 'results' && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              
              {/* Result Card - Registrable or Not */}
              {result.logo_origen === 'subido' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-2xl border-2 p-6 ${
                    result.es_registrable 
                      ? 'bg-emerald-50 border-emerald-200' 
                      : 'bg-rose-50 border-rose-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      {result.es_registrable ? (
                        <CheckCircle className="w-12 h-12 text-emerald-600" />
                      ) : (
                        <XCircle className="w-12 h-12 text-rose-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-2xl font-bold mb-2 ${
                        result.es_registrable ? 'text-emerald-800' : 'text-rose-800'
                      }`}>
                        {result.es_registrable 
                          ? '¡Tu logo es registrable!' 
                          : 'Tu logo tiene problemas para registrarse'
                        }
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className={getRiskColor(result.nivel_riesgo)}>
                          Riesgo: {result.nivel_riesgo}
                        </Badge>
                        <Badge className={`text-white ${getDistintividadColor(result.distintividad)}`}>
                          Distintividad: {result.distintividad}
                        </Badge>
                      </div>
                      <p className={`text-sm leading-relaxed ${
                        result.es_registrable ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {result.analisis}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Problems List */}
              {result.problemas && result.problemas.length > 0 && (
                <Card className="border-rose-200">
                  <CardHeader>
                    <CardTitle className="text-rose-700 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Problemas Detectados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.problemas.map((problema, i) => (
                        <li key={i} className="flex items-start gap-2 text-rose-700">
                          <span className="text-rose-500 mt-1">•</span>
                          {problema}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Similarities */}
              {result.similitudes_detectadas && result.similitudes_detectadas.length > 0 && (
                <Card className="border-amber-200">
                  <CardHeader>
                    <CardTitle className="text-amber-700 flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Similitudes con Logos Famosos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.similitudes_detectadas.map((brand, i) => (
                        <Badge key={i} variant="outline" className="border-amber-400 text-amber-700">
                          {brand}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Suggestions */}
              {result.sugerencias && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-primary flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Sugerencias de Mejora
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{result.sugerencias}</p>
                  </CardContent>
                </Card>
              )}

              {/* Generated Logo Alternatives */}
              {(result.logo_alternativa_1_url || result.logo_alternativa_2_url) && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    {result.logo_origen === 'generado' 
                      ? 'Creamos estas propuestas para tu marca:' 
                      : 'Te generamos alternativas registrables:'
                    }
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {result.logo_alternativa_1_url && (
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Card 
                          className={`cursor-pointer transition-all ${
                            selectedLogo === result.logo_alternativa_1_url 
                              ? 'border-2 border-secondary shadow-lg' 
                              : 'hover:shadow-lg'
                          }`}
                          onClick={() => selectGeneratedLogo(result.logo_alternativa_1_url)}
                        >
                          <CardContent className="p-6">
                            <div className="bg-slate-100 rounded-lg p-4 mb-4 flex items-center justify-center min-h-[200px]">
                              <img 
                                src={result.logo_alternativa_1_url} 
                                alt="Opción 1" 
                                className="max-w-full max-h-[180px] object-contain"
                              />
                            </div>
                            <Button 
                              className={`w-full ${
                                selectedLogo === result.logo_alternativa_1_url 
                                  ? 'bg-secondary' 
                                  : 'bg-primary'
                              }`}
                            >
                              {selectedLogo === result.logo_alternativa_1_url 
                                ? '✓ Seleccionado' 
                                : 'Elegir este logo'
                              }
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}

                    {result.logo_alternativa_2_url && (
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Card 
                          className={`cursor-pointer transition-all ${
                            selectedLogo === result.logo_alternativa_2_url 
                              ? 'border-2 border-secondary shadow-lg' 
                              : 'hover:shadow-lg'
                          }`}
                          onClick={() => selectGeneratedLogo(result.logo_alternativa_2_url)}
                        >
                          <CardContent className="p-6">
                            <div className="bg-slate-100 rounded-lg p-4 mb-4 flex items-center justify-center min-h-[200px]">
                              <img 
                                src={result.logo_alternativa_2_url} 
                                alt="Opción 2" 
                                className="max-w-full max-h-[180px] object-contain"
                              />
                            </div>
                            <Button 
                              className={`w-full ${
                                selectedLogo === result.logo_alternativa_2_url 
                                  ? 'bg-secondary' 
                                  : 'bg-primary'
                              }`}
                            >
                              {selectedLogo === result.logo_alternativa_2_url 
                                ? '✓ Seleccionado' 
                                : 'Elegir este logo'
                              }
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </div>

                  {result.logo_origen === 'generado' && (
                    <div className="text-center">
                      <Button 
                        variant="outline" 
                        onClick={generateLogos}
                        className="mt-4"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generar más opciones
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button 
                  size="lg" 
                  className="flex-1 bg-primary text-lg py-6 shadow-xl hover:shadow-2xl transition-all"
                  onClick={continueToNextStep}
                  data-testid="button-continue"
                >
                  Continuar al siguiente paso <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="py-6"
                  onClick={() => {
                    setResult(null);
                    setSelectedLogo(null);
                    clearUpload();
                    setPageState('choice');
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Probar otro logo
                </Button>
              </div>
            </motion.div>
          )}
          
        </AnimatePresence>
      </div>
    </div>
  );
}
