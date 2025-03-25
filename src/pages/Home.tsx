import React from "react";
import SensorData from "@/components/DeviceTable"; // Asegúrate de que la ruta sea correcta
import Dashboard from "../layouts/Dashboard";

const Home: React.FC = () => {
  return (
    <Dashboard pageName="">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Datos del Sensor</h1>
        <SensorData />
      </div>
    </Dashboard>
  );
};

export default Home;
