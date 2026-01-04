import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrbiaMascot } from '@/components/mascot/OrbiaMascot';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, ArrowRight, ArrowLeft, Loader2, CheckCircle, 
  AlertCircle, ExternalLink, Download, Briefcase,
  User, MapPin, Mail, Phone, Tag, Shield, Image as ImageIcon
} from 'lucide-react';

const WEBHOOK_URL = 'https://n8n.srv1175451.hstgr.cloud/webhook/generar-solicitud';

interface GenerarResponse {
  success: boolean;
  estudio_id?: string;
  mensaje?: string;
  documento_url?: string;
  instrucciones?: string;
  siguiente_paso?: string;
  errores?: string[];
  campos_faltantes?: string[];
}

type PageState = 'summary' | 'generating' | 'success' | 'error';

export default function Solicitud() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [pageState, setPageState] = useState<PageState>('summary');
  const [estudioId, setEstudioId] = useState('');
  const [nombreMarca, setNombreMarca] = useState('');
  const [claseNiza, setClaseNiza] = useState<number | null>(null);
  const [nombreClase, setNombreClase] = useState('');
  const [descripcionJuridica, setDescripcionJuridica] = useState('');
  const [nivelViabilidad, setNivelViabilidad] = useState('');
  const [titularData, setTitularData] = useState<any>(null);
  const [documentoUrl, setDocumentoUrl] = useState<string | null>(null);
  const [instrucciones, setInstrucciones] = useState<string | null>(null);
  const [errores, setErrores] = useState<string[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const storedResult = localStorage.getItem('orbia_last_result');
    const storedTitular = localStorage.getItem('orbia_titular_data');
    
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
      setClaseNiza(parsedResult.clase_niza || null);
      setNombreClase(parsedResult.nombre_clase || '');
      setDescripcionJuridica(parsedResult.descripcion_juridica || parsedResult.clase_principal_descripcion || '');
      setNivelViabilidad(parsedResult.nivel_viabilidad || '');

      if (storedTitular) {
        setTitularData(JSON.parse(storedTitular));
      }

      const storedSelectedLogo = localStorage.getItem('orbia_selected_logo');
      if (storedSelectedLogo) {
        setLogoUrl(storedSelectedLogo);
      }
    } catch (e) {
      console.error('Error loading data:', e);
    }
  }, [setLocation, toast]);

  const handleGenerar = async () => {
    if (!estudioId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se encontró el ID del estudio",
      });
      return;
    }

    setPageState('generating');
    
    try {
      console.log('📤 Generando solicitud para estudio:', estudioId);
      
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudio_id: estudioId }),
      });

      const result: GenerarResponse = await response.json();
      console.log('📥 Respuesta del webhook:', result);

      if (result.success) {
        setDocumentoUrl(result.documento_url || null);
        setInstrucciones(result.instrucciones || null);
        setPageState('success');
        toast({
          title: "Solicitud generada",
          description: result.mensaje || "El documento se generó correctamente",
        });
      } else {
        setErrores(result.errores || result.campos_faltantes || ['Error desconocido']);
        setPageState('error');
        toast({
          variant: "destructive",
          title: "Error al generar",
          description: result.mensaje || "No se pudo generar la solicitud",
        });
      }
    } catch (error) {
      console.error('❌ Error:', error);
      setErrores(['Error de conexión con el servidor']);
      setPageState('error');
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
      });
    }
  };

  const getViabilidadColor = (nivel: string) => {
    switch (nivel?.toUpperCase()) {
      case 'ALTA': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'MEDIA': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'BAJA': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const renderSummary = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            Datos de la Marca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Nombre de la marca:</span>
            <span className="font-bold text-lg text-primary">{nombreMarca}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Clase NIZA:</span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              Clase {claseNiza} - {nombreClase}
            </Badge>
          </div>
          
          {descripcionJuridica && (
            <div>
              <span className="text-muted-foreground text-sm">Descripción jurídica:</span>
              <p className="text-sm mt-1 bg-slate-50 p-3 rounded-lg border">
                {descripcionJuridica}
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Viabilidad legal:</span>
            <Badge className={`border ${getViabilidadColor(nivelViabilidad)}`}>
              <Shield className="w-3 h-3 mr-1" />
              {nivelViabilidad}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {logoUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Logo de la Marca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="bg-slate-50 p-4 rounded-lg border">
                <img 
                  src={logoUrl} 
                  alt="Logo de la marca" 
                  className="max-h-32 object-contain"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {titularData?.titular && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {titularData.titular.tipo === 'persona_fisica' ? (
                <User className="w-5 h-5 text-primary" />
              ) : (
                <Briefcase className="w-5 h-5 text-primary" />
              )}
              Datos del Titular
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tipo:</span>
              <Badge variant="outline">
                {titularData.titular.tipo === 'persona_fisica' ? 'Persona Física' : 'Persona Moral'}
              </Badge>
            </div>
            
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-muted-foreground mt-1" />
              <div>
                <span className="text-sm text-muted-foreground">
                  {titularData.titular.tipo === 'persona_fisica' ? 'Nombre' : 'Razón Social'}:
                </span>
                <p className="font-medium">
                  {titularData.titular.nombre || titularData.titular.razon_social}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
              <div>
                <span className="text-sm text-muted-foreground">Domicilio:</span>
                <p className="font-medium">{titularData.titular.domicilio}</p>
                {titularData.titular.ciudad && (
                  <p className="text-sm text-muted-foreground">
                    {titularData.titular.ciudad}, {titularData.titular.estado} C.P. {titularData.titular.codigo_postal}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{titularData.titular.email}</span>
              </div>
              {titularData.titular.telefono && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{titularData.titular.telefono}</span>
                </div>
              )}
            </div>

            {titularData.titular.rfc && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">RFC:</span>
                <code className="bg-slate-100 px-2 py-1 rounded text-sm">
                  {titularData.titular.rfc}
                </code>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!titularData?.titular && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-medium text-amber-800">Datos del titular pendientes</p>
                <p className="text-sm text-amber-700 mt-1">
                  No has ingresado los datos del titular de la marca.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setLocation('/titular')}
                >
                  Completar datos del titular
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={handleGenerar}
          disabled={!titularData?.titular}
          className="flex-1 py-6 text-lg bg-primary"
          data-testid="button-generar"
        >
          <FileText className="w-5 h-5 mr-2" />
          Generar Solicitud IMPI
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setLocation('/titular')}
          className="py-6"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </div>
    </motion.div>
  );

  const renderGenerating = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <OrbiaMascot state="thinking" size="lg" className="mb-8" />
      <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
        <Loader2 className="animate-spin" />
        Generando tu solicitud...
      </h2>
      <p className="text-muted-foreground text-lg max-w-md">
        Estamos preparando el documento oficial para tu trámite ante el IMPI. 
        Esto puede tomar unos segundos.
      </p>
      <div className="w-64 h-2 bg-slate-200 rounded-full mt-8 overflow-hidden">
        <motion.div 
          className="h-full bg-secondary"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 8, ease: "linear" }}
        />
      </div>
    </motion.div>
  );

  const renderSuccess = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-center">
        <OrbiaMascot state="happy" size="lg" />
      </div>

      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="pt-8 pb-8 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-emerald-800 mb-2">
            ¡Solicitud generada exitosamente!
          </h2>
          <p className="text-emerald-700 mb-6">
            Tu documento de solicitud IMPI está listo para descargar.
          </p>
        </CardContent>
      </Card>

      {documentoUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Tu Solicitud IMPI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Solicitud IMPI - {nombreMarca}</p>
                  <p className="text-sm text-muted-foreground">Documento listo para descargar</p>
                </div>
              </div>
              <Button
                onClick={() => window.open(documentoUrl, '_blank')}
                data-testid="button-view-document"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir
              </Button>
            </div>

            {instrucciones && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Instrucciones para PDF:</p>
                    <p className="text-sm text-amber-700 mt-1">{instrucciones}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {documentoUrl && (
          <>
            <Button
              onClick={() => window.open(documentoUrl, '_blank')}
              className="w-full py-6 text-lg bg-primary"
              data-testid="button-open-document"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Abrir mi Solicitud
            </Button>
            <Button
              variant="outline"
              className="w-full py-6 text-lg"
              onClick={() => {
                const link = document.createElement('a');
                link.href = documentoUrl;
                link.download = `Solicitud_IMPI_${nombreMarca.replace(/\s+/g, '_')}.html`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              data-testid="button-download-document"
            >
              <Download className="w-5 h-5 mr-2" />
              Descargar Documento
            </Button>
          </>
        )}
        
        <Button
          variant="ghost"
          onClick={() => setPageState('summary')}
          className="py-4"
          data-testid="button-view-summary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Ver resumen
        </Button>
      </div>
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
        <CardContent className="pt-8 pb-8">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-2 text-center">
            No se pudo generar la solicitud
          </h2>
          
          {errores.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-red-700 font-medium">Problemas encontrados:</p>
              <ul className="space-y-2">
                {errores.map((error, index) => (
                  <li key={index} className="flex items-start gap-2 text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => setPageState('summary')}
          className="flex-1 py-6"
          data-testid="button-retry"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al resumen
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setLocation('/titular')}
          className="py-6"
        >
          Editar datos del titular
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <FileText className="w-4 h-4" />
            <span>MÓDULO 4</span>
            <span className="text-primary font-medium">• Paso 4 de 5</span>
          </div>
          <h1 className="text-3xl font-bold text-primary">Generar Solicitud IMPI</h1>
          <p className="text-muted-foreground mt-1">
            Revisa los datos y genera el documento oficial
          </p>
        </div>
        {pageState === 'summary' && (
          <OrbiaMascot state="idle" size="md" className="hidden sm:block" />
        )}
      </div>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((step) => (
          <div 
            key={step}
            className={`h-2 flex-1 rounded-full ${
              step <= 4 ? 'bg-primary' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {pageState === 'summary' && renderSummary()}
        {pageState === 'generating' && renderGenerating()}
        {pageState === 'success' && renderSuccess()}
        {pageState === 'error' && renderError()}
      </AnimatePresence>
    </div>
  );
}
