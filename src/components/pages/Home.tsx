import React from "react";
import SensorData from "../DeviceTable"; // Adjusted the path to match the relative location

export const Home: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Datos del Sensor</h1>
      <SensorData />
    </div>
  );
};

