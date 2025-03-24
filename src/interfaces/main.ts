type NodeID = string;

type Sensor = {
  category: string;
  unit: string;
};

type IRealTimeSensorData = {
  sensorId: string; // sensor_temperature_11
  category: string; // temperature
  value: number; // 22
  alert: {
    name: string; // NORMAL
    color: string; //#1548a8
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

export interface INodeRealTimeData {
  id: NodeID;
  sensorsData: IRealTimeSensorData[];
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
