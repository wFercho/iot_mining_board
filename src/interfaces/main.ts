type NodeID = string;

export interface INodeIn3D {
  id: NodeID;
  zone: {
    category: "bocamina" | "tunel" | "extraction";
    name: string;
  };
  connections: NodeID[];
  position: {
    x: number;
    y: number;
    z: number;
  };
  color: string | null;
  sensors: Sensor[];
}

export interface MineNodes3D {
  id: string;
  mine_id: string;
  nodes: INodeIn3D[];
}

export const ZoneCategory = {
  bocamina: "Bocamina",
  tunel: "Túnel",
  extraction: "Zona de Extracción",
};

export type IRealTimeSensorData = {
  sensorId: string; // sensor_temperature_11
  category: string; // temperature
  mineId: string;
  nodeId: string;
  value: number; // 22
  alert: {
    name: string; // NORMAL
    color: string; //#1548a8
  };
};

// Actualización de interfaces para incluir el campo alert en Sensor
export type Sensor = {
  id: string;
  category: string;
  unit: string;
  value: number;
  alert?: {
    name: string;
    color: string;
  };
};

export interface INodeIn3D {
  id: NodeID;
  zone: {
    category: "bocamina" | "tunel" | "extraction";
    name: string;
  };
  connections: NodeID[];
  position: {
    x: number;
    y: number;
    z: number;
  };
  color: string | null;
  sensors: Sensor[];
}

export interface MineNodes3D {
  id: string;
  mine_id: string;
  nodes: INodeIn3D[];
}
