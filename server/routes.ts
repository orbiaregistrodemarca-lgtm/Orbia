import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { classificationInputSchema, insertEstudioMarcaSchema } from "@shared/schema";
import { z } from "zod";

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

  return httpServer;
}
