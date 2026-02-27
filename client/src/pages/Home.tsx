import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { OrbiaMascot } from '@/components/mascot/OrbiaMascot';
import { CheckCircle, Brain, FileText, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative py-20 overflow-hidden bg-gradient-to-b from-background to-secondary/20">
        <div className="container px-4 mx-auto flex flex-col-reverse lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-white mb-6">
                Registra tu marca en Mexico con <span className="text-primary">IA</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
                ORBIA analiza tu marca en segundos y te guia paso a paso para protegerla ante el IMPI. 
                Con la potencia de NOMINUS.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/clasificar">
                  <Button size="lg" className="text-lg px-8 py-6 shadow-xl shadow-primary/25 hover:shadow-2xl transition-all transform hover:-translate-y-1 bg-primary hover:bg-primary/90 text-background font-semibold">
                    Analizar mi marca GRATIS
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
          
          <div className="flex-1 flex justify-center relative z-10">
            <OrbiaMascot size="lg" className="w-64 h-64 md:w-80 md:h-80" />
          </div>

          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-white mb-4">Como funciona?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Protege tu propiedad intelectual en tres sencillos pasos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FileText className="w-10 h-10 text-primary" />,
                title: "1. Ingresa tu marca",
                description: "Cuentanos el nombre de tu marca y que productos o servicios ofreces."
              },
              {
                icon: <Brain className="w-10 h-10 text-primary" />,
                title: "2. IA analiza viabilidad",
                description: "Nuestra inteligencia artificial clasifica tu marca y revisa prohibiciones legales."
              },
              {
                icon: <ShieldCheck className="w-10 h-10 text-primary" />,
                title: "3. Recibe tu estudio",
                description: "Obten un reporte detallado con la clasificacion Niza correcta y analisis de riesgo."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-muted/50 border border-border shadow-lg hover:shadow-xl hover:border-primary/30 transition-all text-center"
              >
                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl font-display font-bold text-white mb-6">Por que elegir ORBIA?</h2>
              <div className="space-y-4">
                {[
                  "Analisis basado en la Ley Federal de Propiedad Industrial",
                  "Clasificacion NIZA automatica y precisa",
                  "Deteccion de nombres famosos prohibidos",
                  "Descripcion juridica redactada por expertos",
                  "Respaldado por NOMINUS, despacho lider en PI"
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-lg text-white/80">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/clasificar">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                    Comenzar analisis gratuito
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-md aspect-square bg-card rounded-2xl shadow-2xl p-8 flex items-center justify-center overflow-hidden border border-border">
                 <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/20" />
                 <div className="text-center z-10">
                    <Sparkles className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
                    <h3 className="text-2xl font-bold text-white mb-2">Powered by AI</h3>
                    <p className="text-muted-foreground">Tecnologia legal de ultima generacion</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-display font-bold text-center text-white mb-12">Lo que dicen nuestros usuarios</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Increiblemente rapido. Me ahorro horas de investigacion sobre la clasificacion correcta.",
                author: "Ana Garcia",
                role: "Emprendedora"
              },
              {
                quote: "La descripcion juridica que genero fue perfecta para mi solicitud ante el IMPI.",
                author: "Carlos Ruiz",
                role: "Dueno de Restaurante"
              },
              {
                quote: "Me alerto sobre un conflicto con una marca famosa que no habia considerado. Gracias!",
                author: "Sofia Mendez",
                role: "Disenadora Grafica"
              }
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-xl bg-muted/50 border border-border">
                <p className="text-muted-foreground italic mb-4">"{t.quote}"</p>
                <div>
                  <p className="font-bold text-white">{t.author}</p>
                  <p className="text-xs text-primary uppercase tracking-wide">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
