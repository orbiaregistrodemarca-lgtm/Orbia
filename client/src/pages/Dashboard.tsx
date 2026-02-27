import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrbiaMascot } from '@/components/mascot/OrbiaMascot';
import { motion } from 'framer-motion';
import {
  Plus, FileText, Loader2, ExternalLink, Eye, ShieldCheck,
  Sparkles, FolderOpen
} from 'lucide-react';

interface Estudio {
  id: string;
  created_at: string;
  nombre_marca: string;
  estado: string | null;
  clase_niza: number | null;
  nombre_clase: string | null;
  nivel_viabilidad: string | null;
  documento_generado_url: string | null;
  user_id: string | null;
}

const estadoConfig: Record<string, { label: string; color: string }> = {
  solicitud_generada: { label: 'Solicitud generada', color: 'bg-emerald-900/30 text-emerald-300 border-emerald-700' },
  busqueda_completada: { label: 'Busqueda completada', color: 'bg-primary/10 text-primary border-primary/30' },
  en_proceso: { label: 'En proceso', color: 'bg-amber-900/30 text-amber-300 border-amber-700' },
  clasificado: { label: 'Clasificado', color: 'bg-sky-900/30 text-sky-300 border-sky-700' },
};

const riesgoConfig: Record<string, { color: string }> = {
  ALTO: { color: 'bg-red-900/30 text-red-300 border-red-700' },
  MEDIO: { color: 'bg-amber-900/30 text-amber-300 border-amber-700' },
  MEDIA: { color: 'bg-amber-900/30 text-amber-300 border-amber-700' },
  BAJO: { color: 'bg-emerald-900/30 text-emerald-300 border-emerald-700' },
  NINGUNO: { color: 'bg-emerald-900/30 text-emerald-300 border-emerald-700' },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Dashboard() {
  const { session } = useAuth();
  const [estudios, setEstudios] = useState<Estudio[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('user');

  useEffect(() => {
    if (!session?.access_token) return;
    const token = session.access_token;

    Promise.all([
      fetch('/api/dashboard/profile', {
        headers: { 'Authorization': `Bearer ${token}` },
      }).then(r => r.json()).catch(() => ({ role: 'user' })),
    ]).then(([profileData]) => {
      const userRole = profileData.role || 'user';
      setRole(userRole);

      return fetch('/api/dashboard/estudios', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
    })
    .then(r => r.json())
    .then((data) => {
      setEstudios(Array.isArray(data) ? data : []);
      setLoading(false);
    })
    .catch(() => {
      setLoading(false);
    });
  }, [session?.access_token]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando tus tramites...</p>
        </div>
      </div>
    );
  }

  const getEstadoBadge = (estado: string | null) => {
    const config = estado && estadoConfig[estado];
    if (config) {
      return <Badge variant="outline" className={config.color} data-testid="badge-estado">{config.label}</Badge>;
    }
    return <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border" data-testid="badge-estado">{estado || 'Sin estado'}</Badge>;
  };

  const getRiesgoBadge = (nivel: string | null) => {
    if (!nivel) return null;
    const config = riesgoConfig[nivel];
    if (!config) return null;
    return <Badge variant="outline" className={config.color} data-testid="badge-riesgo">Riesgo: {nivel}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <FolderOpen className="w-7 h-7 text-primary" />
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white" data-testid="text-dashboard-title">
              Mis tramites
            </h1>
            {role === 'superadmin' && (
              <Badge className="bg-purple-900/30 text-purple-300 border-purple-700 ml-2" data-testid="badge-admin">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            )}
          </div>
          <Link href="/clasificar">
            <Button className="shadow-lg shadow-primary/25 bg-primary text-background hover:bg-primary/90 font-semibold" data-testid="button-nueva-marca">
              <Plus className="w-4 h-4 mr-2" />
              Nueva marca
            </Button>
          </Link>
        </motion.div>

        {estudios.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-dashed border-2 border-border">
              <CardContent className="py-16 text-center">
                <div className="flex justify-center mb-6">
                  <OrbiaMascot state="idle" size="md" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2" data-testid="text-empty-state">
                  Aun no tienes tramites
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Comienza registrando tu primera marca. Te guiaremos paso a paso en todo el proceso.
                </p>
                <Link href="/clasificar">
                  <Button size="lg" className="px-8 py-6 text-lg shadow-lg shadow-primary/25 bg-primary text-background hover:bg-primary/90 font-semibold" data-testid="button-primera-marca">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Registrar mi primera marca
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {estudios.map((estudio, index) => (
              <motion.div
                key={estudio.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md hover:border-primary/30 transition-all" data-testid={`card-estudio-${estudio.id}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-lg font-bold text-white leading-tight" data-testid={`text-marca-${estudio.id}`}>
                        {estudio.nombre_marca}
                      </h3>
                      {getEstadoBadge(estudio.estado)}
                    </div>

                    {estudio.clase_niza && (
                      <p className="text-sm text-muted-foreground mb-2" data-testid={`text-clase-${estudio.id}`}>
                        Clase {estudio.clase_niza} — {estudio.nombre_clase || 'Sin nombre'}
                      </p>
                    )}

                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="text-xs text-muted-foreground" data-testid={`text-fecha-${estudio.id}`}>
                        {formatDate(estudio.created_at)}
                      </span>
                      {getRiesgoBadge(estudio.nivel_viabilidad)}
                    </div>

                    {role === 'superadmin' && estudio.user_id && (
                      <p className="text-xs text-purple-400 mb-3 font-medium" data-testid={`text-usuario-${estudio.id}`}>
                        Usuario: {estudio.user_id.slice(0, 8)}...
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      {estudio.documento_generado_url && (
                        <a
                          href={estudio.documento_generado_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button variant="default" size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700" data-testid={`button-pdf-${estudio.id}`}>
                            <FileText className="w-4 h-4 mr-1" />
                            Ver solicitud PDF
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </a>
                      )}
                      <Button variant="outline" size="sm" className={estudio.documento_generado_url ? '' : 'flex-1'} data-testid={`button-detalle-${estudio.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        Ver detalle
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
