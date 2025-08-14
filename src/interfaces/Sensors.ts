export interface SensorData {
  id: string;
  node_id: string;
  type: string;
  value: number;
  unit: string;
  manufacturer: string;
  model: string;
  timestamp: string;
  status: string;
  battery: number;
  signal: number;
  installation: string;
  protocols: string[];
  certifications: string[];
  firmware: string;
  metadata: {
    accuracy: number;
    sampling_rate: string;
    calibration_date: string;
  };
}