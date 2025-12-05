import { z } from "zod";

export const estudioMarcaSchema = z.object({
  id: z.number().optional(),
  nombre_marca: z.string(),
  que_vende: z.string(),
  url_empresa: z.string().nullable().optional(),
  clase_niza: z.number(),
  nombre_clase: z.string(),
  justificacion: z.string(),
  nivel_viabilidad: z.enum(['ALTA', 'MEDIA', 'BAJA']),
  es_nombre_famoso: z.boolean(),
  analisis_riesgo: z.string(),
  descripcion_juridica: z.string(),
  palabras_clave: z.array(z.string()),
  sugerencias_nombres: z.array(z.string()),
  clases_adicionales: z.string().nullable().optional(),
  created_at: z.string().optional(),
});

export const insertEstudioMarcaSchema = estudioMarcaSchema.omit({ id: true, created_at: true });

export type EstudioMarca = z.infer<typeof estudioMarcaSchema>;
export type InsertEstudioMarca = z.infer<typeof insertEstudioMarcaSchema>;

export const classificationInputSchema = z.object({
  nombre_marca: z.string().min(2),
  que_vende: z.string().min(10),
  url_empresa: z.string().url().optional().or(z.literal('')),
});

export type ClassificationInput = z.infer<typeof classificationInputSchema>;
