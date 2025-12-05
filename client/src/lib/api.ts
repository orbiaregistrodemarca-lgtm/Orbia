export interface ClassificationResult {
  claseNiza: number;
  nombreClase: string;
  justificacion: string;
  nivelViabilidad: 'ALTA' | 'MEDIA' | 'BAJA';
  esNombreFamoso: boolean;
  analisisRiesgo: string;
  descripcionJuridica: string;
  palabrasClave: string[];
  sugerenciasNombres: string[];
  clasesAdicionales: string;
}

export async function classifyBrand(data: {
  nombre_marca: string;
  que_vende: string;
  url_empresa?: string;
}): Promise<ClassificationResult> {
  const response = await fetch('https://orbia.app.n8n.cloud/webhook/clasificar-marca', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Error al clasificar la marca');
  }

  const responseData = await response.json();
  const rawData = Array.isArray(responseData) ? responseData[0] : responseData;

  // Parse keywords if they come as a string
  let keywords: string[] = [];
  if (typeof rawData.palabras_clave === 'string') {
    try {
      keywords = JSON.parse(rawData.palabras_clave);
    } catch (e) {
      keywords = [rawData.palabras_clave];
    }
  } else if (Array.isArray(rawData.palabras_clave)) {
    keywords = rawData.palabras_clave;
  }

  return {
    claseNiza: rawData.clase_niza || 0,
    nombreClase: rawData.nombre_clase || '',
    justificacion: rawData.justificacion || '',
    nivelViabilidad: rawData.nivel_viabilidad || 'MEDIA',
    esNombreFamoso: rawData.es_nombre_famoso || false,
    analisisRiesgo: rawData.analisis_riesgo || '',
    descripcionJuridica: rawData.descripcion_juridica || '',
    palabrasClave: keywords,
    sugerenciasNombres: rawData.sugerencias_nombres || [],
    clasesAdicionales: rawData.clases_adicionales || '',
  };
}
