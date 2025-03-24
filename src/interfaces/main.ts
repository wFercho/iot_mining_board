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
    color: string; // #C23DAA
  };
};

export interface INodeIn3D {
  id: NodeID;
  zone: {
    category: string | "bocamina" | "tunel" | "extraction";
    name: string;
  };
  conections: NodeID[];
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
