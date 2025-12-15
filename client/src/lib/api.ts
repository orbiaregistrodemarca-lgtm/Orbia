const WEBHOOK_URL = 'https://orbia.app.n8n.cloud/webhook/clasificar-marca';
const LOGO_WEBHOOK_URL = 'https://orbia.app.n8n.cloud/webhook/analizar-logo';

export interface ClassificationResult {
  id?: string;
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
  
  clase_principal_descripcion?: string;
  clase_secundaria_1_numero?: number | null;
  clase_secundaria_1_nombre?: string | null;
  clase_secundaria_1_descripcion?: string | null;
  clase_secundaria_2_numero?: number | null;
  clase_secundaria_2_nombre?: string | null;
  clase_secundaria_2_descripcion?: string | null;
  clases_a_registrar?: string;
}

export interface LogoAnalysisResult {
  success: boolean;
  es_registrable: boolean;
  nivel_riesgo: 'BAJO' | 'MEDIO' | 'ALTO';
  analisis: string;
  distintividad: 'ALTA' | 'MEDIA' | 'BAJA';
  similitudes_detectadas: string[];
  problemas: string[];
  sugerencias: string;
  logo_origen: 'subido' | 'generado';
  logo_alternativa_1_url: string;
  logo_alternativa_2_url: string;
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

  let sugerenciasNombres: string[] = [];
  if (typeof rawData.sugerencias_nombres === 'string') {
    try { 
      sugerenciasNombres = JSON.parse(rawData.sugerencias_nombres); 
    } catch { 
      sugerenciasNombres = [rawData.sugerencias_nombres]; 
    }
  } else if (Array.isArray(rawData.sugerencias_nombres)) {
    sugerenciasNombres = rawData.sugerencias_nombres;
  }

  const result: ClassificationResult = {
    id: rawData.id || crypto.randomUUID(),
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
    sugerencias_nombres: sugerenciasNombres,
    clases_adicionales: rawData.clases_adicionales || null,
    
    clase_principal_descripcion: rawData.clase_principal_descripcion || rawData.descripcion_juridica || '',
    clase_secundaria_1_numero: rawData.clase_secundaria_1_numero || null,
    clase_secundaria_1_nombre: rawData.clase_secundaria_1_nombre || null,
    clase_secundaria_1_descripcion: rawData.clase_secundaria_1_descripcion || null,
    clase_secundaria_2_numero: rawData.clase_secundaria_2_numero || null,
    clase_secundaria_2_nombre: rawData.clase_secundaria_2_nombre || null,
    clase_secundaria_2_descripcion: rawData.clase_secundaria_2_descripcion || null,
    clases_a_registrar: rawData.clases_a_registrar || null,
  };

  console.log('✅ Resultado final:', result);
  return result;
}

export async function analyzeLogo(data: {
  estudio_id: string;
  nombre_marca: string;
  descripcion_negocio: string;
  tiene_logo: boolean;
  logo_base64?: string;
}): Promise<LogoAnalysisResult> {
  console.log('📤 Enviando logo para análisis:', { 
    ...data, 
    logo_base64: data.logo_base64 ? '[BASE64 - ' + Math.round(data.logo_base64.length / 1024) + 'KB]' : undefined 
  });
  
  const response = await fetch(LOGO_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    console.error('❌ Error en análisis de logo:', response.status, response.statusText);
    throw new Error('Error al analizar el logo');
  }

  const rawResult = await response.json();
  const result = Array.isArray(rawResult) ? rawResult[0] : rawResult;
  console.log('📥 Resultado análisis logo:', result);
  
  return {
    success: result.success ?? true,
    es_registrable: result.es_registrable ?? false,
    nivel_riesgo: result.nivel_riesgo || 'MEDIO',
    analisis: result.analisis || '',
    distintividad: result.distintividad || 'MEDIA',
    similitudes_detectadas: result.similitudes_detectadas || [],
    problemas: result.problemas || [],
    sugerencias: result.sugerencias || '',
    logo_origen: result.logo_origen || 'subido',
    logo_alternativa_1_url: result.logo_alternativa_1_url || '',
    logo_alternativa_2_url: result.logo_alternativa_2_url || '',
  };
}

export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
