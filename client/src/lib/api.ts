export interface ClassificationResult {
  id?: number;
  nombre_marca: string;
  que_vende: string;
  url_empresa?: string | null;
  clase_niza: number;
  nombre_clase: string;
  justificacion: string;
  nivel_viabilidad: 'ALTA' | 'MEDIA' | 'BAJA';
  es_nombre_famoso: boolean;
  analisis_riesgo: string;
  descripcion_juridica: string;
  palabras_clave: string[];
  sugerencias_nombres: string[];
  clases_adicionales?: string | null;
  created_at?: string;
}

const WEBHOOK_URL = 'https://orbia.app.n8n.cloud/webhook/clasificar-marca';

export async function classifyBrand(data: {
  nombre_marca: string;
  que_vende: string;
  url_empresa?: string;
}): Promise<ClassificationResult> {
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre_marca: data.nombre_marca,
      que_vende: data.que_vende,
      url_empresa: data.url_empresa || '',
    }),
  });

  if (!response.ok) {
    throw new Error('Error al clasificar la marca');
  }

  const webhookData = await response.json();
  const rawData = Array.isArray(webhookData) ? webhookData[0] : webhookData;

  // Parsear palabras_clave si viene como string
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

  return {
    nombre_marca: data.nombre_marca,
    que_vende: data.que_vende,
    url_empresa: data.url_empresa || null,
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
}

// Estas funciones ya no funcionarán sin servidor, las dejamos para referencia
export async function getEstudios(): Promise<ClassificationResult[]> {
  console.warn('getEstudios no disponible en modo estático');
  return [];
}

export async function getEstudioById(id: number): Promise<ClassificationResult | null> {
  console.warn('getEstudioById no disponible en modo estático');
  return null;
}
```

---

## **Prompt para Replit para aplicar el fix:**
```
El deploy en Vercel no funciona porque el servidor Express no se ejecuta en producción estática.

Modifica client/src/lib/api.ts para llamar DIRECTAMENTE al webhook de n8n en lugar de /api/clasificar:

1. Cambia la URL de fetch de '/api/clasificar' a 'https://orbia.app.n8n.cloud/webhook/clasificar-marca'

2. Transforma la respuesta del webhook (viene en snake_case y puede ser array):
   - const rawData = Array.isArray(webhookData) ? webhookData[0] : webhookData
   - Parsea palabras_clave si viene como string JSON
   - Mapea todos los campos correctamente

3. El webhook ya guarda en Supabase automáticamente, no necesitas el servidor para eso.

4. Las funciones getEstudios y getEstudioById no funcionarán sin servidor, puedes dejarlas vacías o conectar Supabase directamente desde el cliente si lo necesitas después.
