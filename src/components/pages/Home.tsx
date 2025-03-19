import React from "react";
import SensorData from "@/components/DeviceTable"; // Asegúrate de que la ruta sea correcta

const Home: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Datos del Sensor</h1>
      <SensorData />
    </div>
  );
};

export default Home;