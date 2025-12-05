import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { OrbiaMascot } from '@/components/mascot/OrbiaMascot';
import { classifyBrand, ClassificationResult } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  nombre_marca: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  que_vende: z.string().min(10, 'Por favor describe con más detalle tus productos o servicios (mínimo 10 caracteres)'),
  url_empresa: z.string().url('Ingresa una URL válida').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

export default function Classify() {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loadingTip, setLoadingTip] = useState(0);

  const tips = [
    "¿Sabías que México usa el sistema uniclase para marcas?",
    "El Artículo 173 de la LFPPI prohíbe nombres de personas famosas.",
    "Una buena descripción jurídica protege mejor tu marca.",
    "El registro de marca tiene una vigencia de 10 años.",
    "NOMINUS está analizando la fonética de tu marca..."
  ];

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingTip((prev) => (prev + 1) % tips.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // Check for pre-filled data (from "Try another name" feature)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre_marca: localStorage.getItem('orbia_retry_name') || '',
      que_vende: localStorage.getItem('orbia_retry_desc') || '',
      url_empresa: '',
    },
  });

  // Clear retry data after loading
  useEffect(() => {
    localStorage.removeItem('orbia_retry_name');
    localStorage.removeItem('orbia_retry_desc');
  }, []);

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      const result = await classifyBrand(data);
      
      // Save result to local storage to persist across refreshes/navigation
      localStorage.setItem('orbia_last_result', JSON.stringify(result));
      localStorage.setItem('orbia_last_input', JSON.stringify(data)); // Save input for "Classify another" flow
      
      setLocation('/resultados');
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un problema al analizar tu marca. Por favor intenta de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="container max-w-3xl mx-auto">
        
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <OrbiaMascot state="thinking" size="lg" className="mb-8" />
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                <Loader2 className="animate-spin" />
                Analizando tu marca...
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
                  transition={{ duration: 8, ease: "linear" }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-center mb-8">
                <OrbiaMascot state="idle" size="sm" className="mr-4" />
                <div className="text-center md:text-left">
                  <h1 className="text-3xl font-display font-bold text-primary">Clasifica tu Marca</h1>
                  <p className="text-muted-foreground">Descubre si tu marca es viable y cómo protegerla.</p>
                </div>
              </div>

              <Card className="shadow-xl border-t-4 border-t-secondary">
                <CardHeader>
                  <CardTitle>Información de la Marca</CardTitle>
                  <CardDescription>
                    Ingresa los detalles para que nuestra IA pueda realizar el análisis legal.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="nombre_marca"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre de la Marca</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: TacoMax, TechFlow, Bella Vista..." {...field} className="text-lg" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="que_vende"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>¿Qué productos o servicios ofreces?</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe detalladamente qué vendes. Ejemplo: Vendo tacos de pastor, bistec y carnitas. También hago banquetes para eventos y vendo souvenirs como llaveros y playeras."
                                className="min-h-[120px] text-base"
                                {...field} 
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground mt-1">
                              Entre más detalle proporciones, más precisa será la clasificación y la protección legal.
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="url_empresa"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sitio Web o Red Social (Opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." type="url" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" size="lg" className="w-full text-lg py-6 bg-primary hover:bg-primary/90 shadow-lg hover:translate-y-[-2px] transition-all">
                        Analizar mi marca
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
