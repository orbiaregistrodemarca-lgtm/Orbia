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

export async function classifyBrand(data: {
  nombre_marca: string;
  que_vende: string;
  url_empresa?: string;
}): Promise<ClassificationResult> {
  const response = await fetch('/api/clasificar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al clasificar la marca');
  }

  return response.json();
}

export async function getEstudios(): Promise<ClassificationResult[]> {
  const response = await fetch('/api/estudios');
  
  if (!response.ok) {
    throw new Error('Error al obtener los estudios');
  }

  return response.json();
}

export async function getEstudioById(id: number): Promise<ClassificationResult> {
  const response = await fetch(`/api/estudios/${id}`);
  
  if (!response.ok) {
    throw new Error('Error al obtener el estudio');
  }

  return response.json();
}
