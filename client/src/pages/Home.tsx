import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { OrbiaMascot } from '@/components/mascot/OrbiaMascot';
import { CheckCircle, Brain, FileText, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-b from-background to-blue-50/50 dark:from-background dark:to-blue-950/20">
        <div className="container px-4 mx-auto flex flex-col-reverse lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-primary mb-6">
                Registra tu marca en México con <span className="text-secondary">IA</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
                ORBIA analiza tu marca en segundos y te guía paso a paso para protegerla ante el IMPI. 
                Con la potencia de NOMINUS.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/clasificar">
                  <Button size="lg" className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 bg-primary hover:bg-primary/90">
                    Analizar mi marca GRATIS
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
          
          <div className="flex-1 flex justify-center relative z-10">
            <OrbiaMascot size="lg" className="w-64 h-64 md:w-80 md:h-80" />
          </div>

          {/* Decorative blob */}
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white dark:bg-card/50">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-primary mb-4">¿Cómo funciona?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Protege tu propiedad intelectual en tres sencillos pasos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FileText className="w-10 h-10 text-secondary" />,
                title: "1. Ingresa tu marca",
                description: "Cuéntanos el nombre de tu marca y qué productos o servicios ofreces."
              },
              {
                icon: <Brain className="w-10 h-10 text-accent" />,
                title: "2. IA analiza viabilidad",
                description: "Nuestra inteligencia artificial clasifica tu marca y revisa prohibiciones legales."
              },
              {
                icon: <ShieldCheck className="w-10 h-10 text-primary" />,
                title: "3. Recibe tu estudio",
                description: "Obtén un reporte detallado con la clasificación Niza correcta y análisis de riesgo."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-background border shadow-lg hover:shadow-xl transition-shadow text-center"
              >
                <div className="w-20 h-20 mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Orbia */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl font-display font-bold text-primary mb-6">¿Por qué elegir ORBIA?</h2>
              <div className="space-y-4">
                {[
                  "Análisis basado en la Ley Federal de Propiedad Industrial",
                  "Clasificación NIZA automática y precisa",
                  "Detección de nombres famosos prohibidos",
                  "Descripción jurídica redactada por expertos",
                  "Respaldado por NOMINUS, despacho líder en PI"
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-accent shrink-0 mt-0.5" />
                    <span className="text-lg text-slate-700 dark:text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/clasificar">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                    Comenzar análisis gratuito
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-md aspect-square bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 flex items-center justify-center overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                 <div className="text-center z-10">
                    <Sparkles className="w-16 h-16 text-warning mx-auto mb-4 animate-pulse" />
                    <h3 className="text-2xl font-bold text-primary mb-2">Powered by AI</h3>
                    <p className="text-muted-foreground">Tecnología legal de última generación</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-card">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-display font-bold text-center text-primary mb-12">Lo que dicen nuestros usuarios</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Increíblemente rápido. Me ahorró horas de investigación sobre la clasificación correcta.",
                author: "Ana García",
                role: "Emprendedora"
              },
              {
                quote: "La descripción jurídica que generó fue perfecta para mi solicitud ante el IMPI.",
                author: "Carlos Ruiz",
                role: "Dueño de Restaurante"
              },
              {
                quote: "Me alertó sobre un conflicto con una marca famosa que no había considerado. ¡Gracias!",
                author: "Sofía Mendez",
                role: "Diseñadora Gráfica"
              }
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                <p className="text-muted-foreground italic mb-4">"{t.quote}"</p>
                <div>
                  <p className="font-bold text-primary">{t.author}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
