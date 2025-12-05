import { getSupabase } from "./supabase";
import type { EstudioMarca, InsertEstudioMarca } from "@shared/schema";

export interface IStorage {
  createEstudioMarca(estudio: InsertEstudioMarca): Promise<EstudioMarca>;
  getEstudiosMarca(): Promise<EstudioMarca[]>;
  getEstudioMarcaById(id: number): Promise<EstudioMarca | null>;
  getEstudiosByNombreMarca(nombreMarca: string): Promise<EstudioMarca[]>;
}

export class SupabaseStorage implements IStorage {
  async createEstudioMarca(estudio: InsertEstudioMarca): Promise<EstudioMarca> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('estudios_marca')
      .insert(estudio)
      .select()
      .single();

    if (error) {
      console.error('Error inserting estudio_marca:', error);
      throw new Error(`Error al guardar el estudio: ${error.message}`);
    }

    return data as EstudioMarca;
  }

  async getEstudiosMarca(): Promise<EstudioMarca[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('estudios_marca')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching estudios_marca:', error);
      throw new Error(`Error al obtener estudios: ${error.message}`);
    }

    return (data || []) as EstudioMarca[];
  }

  async getEstudioMarcaById(id: number): Promise<EstudioMarca | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('estudios_marca')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching estudio_marca by id:', error);
      throw new Error(`Error al obtener estudio: ${error.message}`);
    }

    return data as EstudioMarca;
  }

  async getEstudiosByNombreMarca(nombreMarca: string): Promise<EstudioMarca[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('estudios_marca')
      .select('*')
      .ilike('nombre_marca', `%${nombreMarca}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching estudios_marca:', error);
      throw new Error(`Error al buscar estudios: ${error.message}`);
    }

    return (data || []) as EstudioMarca[];
  }
}

export const storage = new SupabaseStorage();
