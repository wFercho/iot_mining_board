import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

export interface Sensor {
  id: string;
  variable: string;
  marca: string;
  referencia: string;
  id_node: string;
  unidad_medicion: string;
  max_medicion: number;
  min_medicion: number;
  precision: number;
  tiempo_respuesta_valor: number;
  tiempo_respuesta_unidad: string;
  resolucion: number;
  temperatura_max: number;
  temperatura_min: number;
  voltaje_tipo: string;
  voltaje_min: number;
  voltaje_max: number;
  corriente_min: number;
  corriente_max: number;
  durabilidad_valor: number;
  durabilidad_unidad: string;
  modo_instalacion: string;
  tipo_salida: string;
  certificados: string;
  created_at?: string;
  updated_at?: string;
}

export interface Node {
  id: string;
  name: string;
  description?: string;
  location?: string;
  status?: string;
}

export const SensorService = {
  // Obtener todos los sensores
  async getSensors(page: number = 1, perPage: number = 10): Promise<{ items: Sensor[]; total: number }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/sensors/paginated/sensors`, {
        params: { page, per_page: perPage }
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching sensors:', error);
      throw new Error('Error fetching sensors');
    }
  },

  // Obtener sensores por nodo
  async getSensorsByNode(nodeId: string, page: number = 1, perPage: number = 10): Promise<{ items: Sensor[]; total: number }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/sensors/node/${nodeId}`, {
        params: { page, per_page: perPage }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching sensors by node:', error);
      throw new Error('Error fetching sensors by node');
    }
  },

  // Obtener un sensor por ID
  async getSensorById(id: string): Promise<Sensor> {
    try {
      const response = await axios.get(`${API_BASE_URL}/sensors/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sensor:', error);
      throw new Error('Error fetching sensor');
    }
  },

  // Crear un nuevo sensor
  async createSensor(sensorData: Omit<Sensor, 'id' | 'created_at' | 'updated_at'>): Promise<Sensor> {
    try {
      const response = await axios.post(`${API_BASE_URL}/sensors`, sensorData);
      return response.data;
    } catch (error) {
      console.error('Error creating sensor:', error);
      throw new Error('Error creating sensor');
    }
  },

  // Actualizar un sensor
  async updateSensor(id: string, sensorData: Partial<Sensor>): Promise<Sensor> {
    try {
      console.log(sensorData)
      const response = await axios.put(`${API_BASE_URL}/sensors/${id}`, sensorData);
      return response.data;
    } catch (error) {
      console.error('Error updating sensor:', error);
      throw new Error('Error updating sensor');
    }
  },

  // Eliminar un sensor
  async deleteSensor(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/sensors/${id}`);
    } catch (error) {
      console.error('Error deleting sensor:', error);
      throw new Error('Error deleting sensor');
    }
  },

  // Obtener todos los nodos
  async getNodes(): Promise<Node[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/nodes`);
      return response.data;
    } catch (error) {
      console.error('Error fetching nodes:', error);
      throw new Error('Error fetching nodes');
    }
  },
};