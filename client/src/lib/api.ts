const WEBHOOK_URL = 'https://orbia.app.n8n.cloud/webhook/clasificar-marca';
const LOGO_WEBHOOK_URL = 'https://orbia.app.n8n.cloud/webhook/analizar-logo-v2';

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
  
  alerta_critica?: string | null;
  requiere_verificacion_impi?: boolean;
  recomendacion_experta?: string | null;
  siguiente_paso?: string | null;
  total_clases?: number;
  
  clase_principal_descripcion?: string;
  clase_secundaria_1_numero?: number | null;
  clase_secundaria_1_nombre?: string | null;
  clase_secundaria_1_descripcion?: string | null;
  clase_secundaria_2_numero?: number | null;
  clase_secundaria_2_nombre?: string | null;
  clase_secundaria_2_descripcion?: string | null;
  clase_secundaria_3_numero?: number | null;
  clase_secundaria_3_nombre?: string | null;
  clase_secundaria_3_descripcion?: string | null;
  clase_secundaria_4_numero?: number | null;
  clase_secundaria_4_nombre?: string | null;
  clase_secundaria_4_descripcion?: string | null;
  clase_secundaria_5_numero?: number | null;
  clase_secundaria_5_nombre?: string | null;
  clase_secundaria_5_descripcion?: string | null;
  clases_a_registrar?: string;
}

export interface LogoAnalysisResult {
  logo_es_registrable: boolean;
  logo_problemas: string | null;
  logo_sugerencias: string | null;
  logo_alternativa_1_url: string | null;
  logo_alternativa_2_url: string | null;
  logo_origen: 'subido' | 'generado';
  logo_distintividad: 'ALTA' | 'MEDIA' | 'BAJA' | 'NULA';
  logo_nivel_riesgo: 'BAJO' | 'MEDIO' | 'ALTO';
  tiene_elementos_prohibidos: boolean;
  logo_analisis?: string | null;
  logo_tipo?: string | null;
  logo_colores?: string | null;
  logo_elementos?: string | null;
  logo_estilo?: string | null;
  logo_similitudes?: string | null;
  logo_recomendacion?: string | null;
  logo_justificacion?: string | null;
  logo_elementos_detectados?: string | null;
  logo_descripcion?: string | null;
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
      palabrasClave = rawData.palabras_clave ? [rawData.palabras_clave] : []; 
    }
  } else if (Array.isArray(rawData.palabras_clave)) {
    palabrasClave = rawData.palabras_clave;
  }

  let sugerenciasNombres: string[] = [];
  if (typeof rawData.sugerencias_nombres === 'string') {
    try { 
      sugerenciasNombres = JSON.parse(rawData.sugerencias_nombres); 
    } catch { 
      sugerenciasNombres = rawData.sugerencias_nombres ? [rawData.sugerencias_nombres] : []; 
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
    
    alerta_critica: rawData.alerta_critica || null,
    requiere_verificacion_impi: rawData.requiere_verificacion_impi || false,
    recomendacion_experta: rawData.recomendacion_experta || null,
    siguiente_paso: rawData.siguiente_paso || null,
    total_clases: rawData.total_clases || 1,
    
    clase_principal_descripcion: rawData.clase_principal_descripcion || rawData.descripcion_juridica || '',
    clase_secundaria_1_numero: rawData.clase_secundaria_1_numero || null,
    clase_secundaria_1_nombre: rawData.clase_secundaria_1_nombre || null,
    clase_secundaria_1_descripcion: rawData.clase_secundaria_1_descripcion || null,
    clase_secundaria_2_numero: rawData.clase_secundaria_2_numero || null,
    clase_secundaria_2_nombre: rawData.clase_secundaria_2_nombre || null,
    clase_secundaria_2_descripcion: rawData.clase_secundaria_2_descripcion || null,
    clase_secundaria_3_numero: rawData.clase_secundaria_3_numero || null,
    clase_secundaria_3_nombre: rawData.clase_secundaria_3_nombre || null,
    clase_secundaria_3_descripcion: rawData.clase_secundaria_3_descripcion || null,
    clase_secundaria_4_numero: rawData.clase_secundaria_4_numero || null,
    clase_secundaria_4_nombre: rawData.clase_secundaria_4_nombre || null,
    clase_secundaria_4_descripcion: rawData.clase_secundaria_4_descripcion || null,
    clase_secundaria_5_numero: rawData.clase_secundaria_5_numero || null,
    clase_secundaria_5_nombre: rawData.clase_secundaria_5_nombre || null,
    clase_secundaria_5_descripcion: rawData.clase_secundaria_5_descripcion || null,
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
  console.log('📥 Resultado análisis logo (completo):', result);
  
  const analisis = result.analisis_grafico || {};
  console.log('📊 Datos de analisis_grafico:', analisis);
  
  const problemas = analisis.problemas;
  const problemasStr = Array.isArray(problemas) 
    ? (problemas.length > 0 ? problemas.join(', ') : null)
    : (problemas || null);
  
  return {
    logo_es_registrable: analisis.es_registrable ?? result.logo_es_registrable ?? false,
    logo_problemas: problemasStr,
    logo_sugerencias: analisis.sugerencias || result.logo_sugerencias || null,
    logo_alternativa_1_url: result.logo_alternativa_1_url || null,
    logo_alternativa_2_url: result.logo_alternativa_2_url || null,
    logo_origen: data.tiene_logo ? 'subido' : 'generado',
    logo_distintividad: analisis.distintividad || result.logo_distintividad || 'MEDIA',
    logo_nivel_riesgo: analisis.nivel_riesgo || result.logo_nivel_riesgo || 'MEDIO',
    tiene_elementos_prohibidos: analisis.tiene_elementos_prohibidos ?? result.tiene_elementos_prohibidos ?? false,
    logo_analisis: analisis.analisis || result.logo_analisis || null,
    logo_tipo: analisis.tipo || result.logo_tipo || null,
    logo_colores: analisis.colores || result.logo_colores || null,
    logo_elementos: analisis.elementos || result.logo_elementos || null,
    logo_estilo: analisis.estilo || result.logo_estilo || null,
    logo_similitudes: analisis.similitudes || result.logo_similitudes || null,
    logo_recomendacion: analisis.recomendacion || result.logo_recomendacion || null,
    logo_justificacion: analisis.justificacion_legal || result.logo_justificacion || null,
    logo_elementos_detectados: analisis.elementos_detectados || result.logo_elementos_detectados || null,
    logo_descripcion: analisis.descripcion || result.logo_descripcion || null,
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

export function formatLegalDescription(text: string): string {
  if (!text) return '';
  return text
    .split(';')
    .map(item => item.trim())
    .filter(item => item.length > 0)
    .map(item => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase())
    .join('; ');
}
