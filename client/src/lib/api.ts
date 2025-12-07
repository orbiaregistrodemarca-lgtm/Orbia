const WEBHOOK_URL = 'https://orbia.app.n8n.cloud/webhook/clasificar-marca';

export interface ClassificationResult {
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
}

export async function classifyBrand(data: {
  nombre_marca: string;
  que_vende: string;
  url_empresa?: string;
}): Promise<ClassificationResult> {
  console.log('📤 Enviando al webhook:', data);
  
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
    console.error('❌ Error en respuesta:', response.status, response.statusText);
    throw new Error('Error al clasificar la marca');
  }

  const webhookData = await response.json();
  console.log('📥 Respuesta del webhook:', webhookData);
  
  const rawData = Array.isArray(webhookData) ? webhookData[0] : webhookData;
  console.log('📦 Datos procesados:', rawData);
  
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

  const result: ClassificationResult = {
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

  console.log('✅ Resultado final:', result);
  return result;
}
