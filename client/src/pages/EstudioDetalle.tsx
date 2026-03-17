import { useState, useEffect } from 'react';
import { API_BASE } from '@/lib/config';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  ArrowLeft, FileText, Loader2, ExternalLink, Download,
  Shield, Tag, Scale, Lightbulb, AlertTriangle, CheckCircle,
  Image, User, Building2, Calendar, Hash
} from 'lucide-react';

interface EstudioCompleto {
  id: string;
  created_at: string;
  nombre_marca: string;
  que_vende: string | null;
  estado: string | null;
  clase_niza: number | null;
  nombre_clase: string | null;
  justificacion_niza: string | null;
  nivel_viabilidad: string | null;
  es_nombre_famoso: boolean | null;
  analisis_riesgo: string | null;
  descripcion_juridica: string | null;
  sugerencias_nombres: string | null;
  sugerencias_alternativas: string | null;
  clase_secundaria_1_numero: number | null;
  clase_secundaria_1_nombre: string | null;
  clase_secundaria_2_numero: number | null;
  clase_secundaria_2_nombre: string | null;
  clase_secundaria_3_numero: number | null;
  clase_secundaria_3_nombre: string | null;
  logo_url: string | null;
  logo_es_registrable: boolean | null;
  logo_nivel_riesgo: string | null;
  logo_distintividad: string | null;
  logo_analisis: string | null;
  logo_problemas: string | null;
  logo_sugerencias: string | null;
  titular_tipo: string | null;
  titular_nombre: string | null;
  titular_email: string | null;
  titular_rfc: string | null;
  titular_curp: string | null;
  documento_generado_url: string | null;
  user_id: string | null;
}

const estadoConfig: Record<string, { label: string; color: string }> = {
  solicitud_generada: { label: 'Solicitud generada', color: 'bg-emerald-900/30 text-emerald-300 border-emerald-700' },
  busqueda_completada: { label: 'Búsqueda completada', color: 'bg-primary/10 text-primary border-primary/30' },
  en_proceso: { label: 'En proceso', color: 'bg-amber-900/30 text-amber-300 border-amber-700' },
  clasificado: { label: 'Clasificado', color: 'bg-sky-900/30 text-sky-300 border-sky-700' },
};

const viabilidadConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  ALTA: { label: 'Alta', color: 'text-emerald-400', icon: CheckCircle },
  MEDIA: { label: 'Media', color: 'text-amber-400', icon: AlertTriangle },
  BAJA: { label: 'Baja', color: 'text-red-400', icon: AlertTriangle },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function EstudioDetalle({ id }: { id: string }) {
  const { session } = useAuth();
  const [, setLocation] = useLocation();
  const [estudio, setEstudio] = useState<EstudioCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.access_token || !id) return;

    fetch(`${API_BASE}/api/dashboard/estudios/${id}`, {
      headers: { 'Authorization': `Bearer ${session.access_token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error('No se pudo cargar el estudio');
        return r.json();
      })
      .then(data => {
        setEstudio(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [session?.access_token, id]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando trámite...</p>
        </div>
      </div>
    );
  }

  if (error || !estudio) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
          <p className="text-white text-lg">{error || 'Estudio no encontrado'}</p>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const estadoBadge = estadoConfig[estudio.estado || ''];
  const viabilidad = viabilidadConfig[estudio.nivel_viabilidad || ''];
  const secondaryClasses = [
    { num: estudio.clase_secundaria_1_numero, name: estudio.clase_secundaria_1_nombre },
    { num: estudio.clase_secundaria_2_numero, name: estudio.clase_secundaria_2_nombre },
    { num: estudio.clase_secundaria_3_numero, name: estudio.clase_secundaria_3_nombre },
  ].filter(c => c.num);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-muted-foreground mb-4" data-testid="button-back-dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al dashboard
            </Button>
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-display font-bold text-white" data-testid="text-detalle-marca">
                {estudio.nombre_marca}
              </h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {estadoBadge ? (
                  <Badge variant="outline" className={estadoBadge.color}>{estadoBadge.label}</Badge>
                ) : (
                  <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border">{estudio.estado || 'Sin estado'}</Badge>
                )}
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(estudio.created_at)}
                </span>
              </div>
            </div>
            {estudio.documento_generado_url && (
              <a href={estudio.documento_generado_url} target="_blank" rel="noopener noreferrer">
                <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg" data-testid="button-download-pdf">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar solicitud PDF
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              </a>
            )}
          </div>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Tag className="w-5 h-5 text-primary" />
                  Clasificación Niza
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {estudio.clase_niza && (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">{estudio.clase_niza}</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{estudio.nombre_clase || 'Sin nombre'}</p>
                      <p className="text-xs text-muted-foreground">Clase principal</p>
                    </div>
                  </div>
                )}

                {secondaryClasses.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Clases secundarias</p>
                    {secondaryClasses.map((c, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-secondary/20 border border-secondary/30 flex items-center justify-center text-sm font-semibold text-secondary-foreground">
                          {c.num}
                        </span>
                        <span className="text-sm text-muted-foreground">{c.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {estudio.que_vende && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Productos / Servicios</p>
                    <p className="text-sm text-white">{estudio.que_vende}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5 text-primary" />
                  Análisis de Viabilidad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {viabilidad && (
                  <div className="flex items-center gap-3">
                    <viabilidad.icon className={`w-8 h-8 ${viabilidad.color}`} />
                    <div>
                      <p className={`text-lg font-bold ${viabilidad.color}`}>Viabilidad {viabilidad.label}</p>
                      {estudio.es_nombre_famoso && (
                        <p className="text-xs text-red-400 font-medium">Coincide con marca famosa</p>
                      )}
                    </div>
                  </div>
                )}

                {estudio.analisis_riesgo && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Análisis de riesgo</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{estudio.analisis_riesgo}</p>
                  </div>
                )}

                {estudio.descripcion_juridica && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Descripción jurídica</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {estudio.descripcion_juridica.length > 300
                        ? estudio.descripcion_juridica.slice(0, 300) + '...'
                        : estudio.descripcion_juridica}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {(estudio.logo_url || estudio.logo_analisis) && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Image className="w-5 h-5 text-primary" />
                    Logo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {estudio.logo_url && (
                    <div className="flex justify-center p-4 bg-white/5 rounded-xl border border-border">
                      <img
                        src={estudio.logo_url}
                        alt={estudio.nombre_marca}
                        className="max-h-32 object-contain rounded"
                        data-testid="img-logo-detalle"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    {estudio.logo_es_registrable !== null && (
                      <Badge variant="outline" className={estudio.logo_es_registrable ? 'bg-emerald-900/30 text-emerald-300 border-emerald-700' : 'bg-red-900/30 text-red-300 border-red-700'}>
                        {estudio.logo_es_registrable ? 'Registrable' : 'No registrable'}
                      </Badge>
                    )}
                    {estudio.logo_distintividad && (
                      <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border">
                        Distintividad: {estudio.logo_distintividad}
                      </Badge>
                    )}
                    {estudio.logo_nivel_riesgo && (
                      <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border">
                        Riesgo: {estudio.logo_nivel_riesgo}
                      </Badge>
                    )}
                  </div>
                  {estudio.logo_analisis && (
                    <p className="text-sm text-muted-foreground">{estudio.logo_analisis}</p>
                  )}
                  {estudio.logo_problemas && (
                    <div className="flex items-start gap-2 text-sm text-red-400">
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{estudio.logo_problemas}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {(estudio.titular_nombre || estudio.titular_email) && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {estudio.titular_tipo === 'persona_moral' ? (
                      <Building2 className="w-5 h-5 text-primary" />
                    ) : (
                      <User className="w-5 h-5 text-primary" />
                    )}
                    Titular
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {estudio.titular_nombre && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Nombre</p>
                      <p className="text-white font-medium">{estudio.titular_nombre}</p>
                    </div>
                  )}
                  {estudio.titular_tipo && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Tipo</p>
                      <p className="text-sm text-muted-foreground capitalize">{estudio.titular_tipo.replace('_', ' ')}</p>
                    </div>
                  )}
                  {estudio.titular_email && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                      <p className="text-sm text-muted-foreground">{estudio.titular_email}</p>
                    </div>
                  )}
                  {estudio.titular_rfc && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">RFC</p>
                      <p className="text-sm text-muted-foreground">{estudio.titular_rfc}</p>
                    </div>
                  )}
                  {estudio.titular_curp && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">CURP</p>
                      <p className="text-sm text-muted-foreground">{estudio.titular_curp}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {estudio.justificacion_niza && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="md:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Scale className="w-5 h-5 text-primary" />
                    Justificación Legal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{estudio.justificacion_niza}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {estudio.sugerencias_nombres && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="md:col-span-2">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg text-primary">
                    <Lightbulb className="w-5 h-5" />
                    Sugerencias de nombres
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{estudio.sugerencias_nombres}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {estudio.documento_generado_url && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-6">
            <Card className="border-emerald-700/30 bg-emerald-900/10">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-emerald-300">
                  <FileText className="w-5 h-5" />
                  Solicitud IMPI Generada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg overflow-hidden" style={{ height: '600px' }}>
                  <iframe
                    src={estudio.documento_generado_url}
                    className="w-full h-full"
                    title="Vista previa de solicitud PDF"
                    data-testid="iframe-pdf-preview"
                  />
                </div>
                <div className="mt-4 text-center">
                  <a href={estudio.documento_generado_url} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-emerald-600 hover:bg-emerald-700" data-testid="button-open-pdf">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir PDF en nueva pestaña
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
