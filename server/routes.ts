import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { classificationInputSchema, insertEstudioMarcaSchema } from "@shared/schema";
import { z } from "zod";
import { getSupabase } from "./supabase";

const WEBHOOK_URL = 'https://orbia.app.n8n.cloud/webhook/clasificar-marca';

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post('/api/clasificar', async (req, res) => {
    try {
      const input = classificationInputSchema.parse(req.body);
      
      const webhookResponse = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_marca: input.nombre_marca,
          que_vende: input.que_vende,
          url_empresa: input.url_empresa || null,
        }),
      });

      if (!webhookResponse.ok) {
        throw new Error('Error al clasificar la marca con el webhook');
      }

      const webhookData = await webhookResponse.json();
      const rawData = Array.isArray(webhookData) ? webhookData[0] : webhookData;

      let palabrasClave: string[] = [];
      if (typeof rawData.palabras_clave === 'string') {
        try {
          palabrasClave = JSON.parse(rawData.palabras_clave);
        } catch {
          palabrasClave = [rawData.palabras_clave];
        }
      } else if (Array.isArray(rawData.palabras_clave)) {
        palabrasClave = rawData.palabras_clave;
      }

      const estudioData = {
        nombre_marca: input.nombre_marca,
        que_vende: input.que_vende,
        url_empresa: input.url_empresa || null,
        clase_niza: rawData.clase_niza || 0,
        nombre_clase: rawData.nombre_clase || '',
        justificacion: rawData.justificacion || '',
        nivel_viabilidad: rawData.nivel_viabilidad || 'MEDIA',
        es_nombre_famoso: rawData.es_nombre_famoso || false,
        analisis_riesgo: rawData.analisis_riesgo || '',
        descripcion_juridica: rawData.descripcion_juridica || '',
        palabras_clave: palabrasClave,
        sugerencias_nombres: rawData.sugerencias_nombres || [],
        clases_adicionales: rawData.clases_adicionales || null,
      };

      const savedEstudio = await storage.createEstudioMarca(estudioData);

      res.json(savedEstudio);
    } catch (error) {
      console.error('Error en /api/clasificar:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Datos inválidos', 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Error interno del servidor' 
      });
    }
  });

  app.get('/api/estudios', async (req, res) => {
    try {
      const estudios = await storage.getEstudiosMarca();
      res.json(estudios);
    } catch (error) {
      console.error('Error en /api/estudios:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Error al obtener estudios' 
      });
    }
  });

  app.get('/api/estudios/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido' });
      }
      
      const estudio = await storage.getEstudioMarcaById(id);
      
      if (!estudio) {
        return res.status(404).json({ message: 'Estudio no encontrado' });
      }
      
      res.json(estudio);
    } catch (error) {
      console.error('Error en /api/estudios/:id:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Error al obtener estudio' 
      });
    }
  });

  app.get('/api/estudios/buscar/:nombre', async (req, res) => {
    try {
      const nombre = req.params.nombre;
      const estudios = await storage.getEstudiosByNombreMarca(nombre);
      res.json(estudios);
    } catch (error) {
      console.error('Error en /api/estudios/buscar:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Error al buscar estudios' 
      });
    }
  });

  app.post('/api/estudios/:estudioId/upload-logo', async (req, res) => {
    try {
      const { estudioId } = req.params;
      const { logo_base64, nombre_marca } = req.body;

      if (!estudioId || !logo_base64) {
        return res.status(400).json({ message: 'Faltan datos requeridos' });
      }

      const supabase = getSupabase();

      const matches = logo_base64.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ message: 'Formato de imagen inválido' });
      }

      const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');
      const safeName = (nombre_marca || 'logo').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `${safeName}_usuario_${estudioId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, buffer, {
          contentType: `image/${matches[1]}`,
          upsert: true
        });

      if (uploadError) {
        console.error('Error subiendo logo a Storage:', uploadError);
        return res.status(500).json({ message: 'Error subiendo logo', error: uploadError.message });
      }

      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from('estudios_marca')
        .update({ logo_seleccionado: publicUrl, logo_origen: 'usuario_subido' })
        .eq('id', estudioId);

      if (updateError) {
        console.error('Error actualizando estudio:', updateError);
        return res.status(500).json({ message: 'Error guardando referencia', error: updateError.message });
      }

      console.log('✅ Logo subido y guardado:', publicUrl);
      res.json({ success: true, logo_url: publicUrl });
    } catch (error) {
      console.error('Error en POST /api/estudios/:id/upload-logo:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error interno' });
    }
  });

  app.patch('/api/estudios/:estudioId/logo', async (req, res) => {
    try {
      const { estudioId } = req.params;
      const { logo_seleccionado, logo_origen } = req.body;
      
      if (!estudioId || !logo_seleccionado) {
        return res.status(400).json({ message: 'Faltan datos requeridos' });
      }

      const supabase = getSupabase();
      
      const { error } = await supabase
        .from('estudios_marca')
        .update({ logo_seleccionado, logo_origen })
        .eq('id', estudioId);

      if (error) {
        console.error('Error guardando logo en Supabase:', error);
        return res.status(500).json({ message: 'Error guardando logo', error: error.message });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error en PATCH /api/estudios/:id/logo:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error interno' });
    }
  });

  return httpServer;
}
