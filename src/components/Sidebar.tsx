import React, { useState } from "react";
import { ChevronDown, ChevronUp, Home, Settings, AlertCircle, Grid, User, Layers, Pickaxe, BookMinus, OctagonMinus } from "lucide-react"; // Asegúrate de tener lucide-react instalado

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const [isDevicesOpen, setIsDevicesOpen] = useState(false); // Estado para controlar el submenú

  const toggleDevices = () => {
    setIsDevicesOpen(!isDevicesOpen); // Alternar la visibilidad del submenú
  };

  return (
    <aside className={`bg-gray-800 text-white w-64 p-4 ${isOpen ? "block" : "hidden"}`}>
      <h2 className="text-xl font-bold">Nombre</h2>
      <ul className="mt-4">
        {/* Elemento "Inicio" */}
        <li className="flex items-center p-2 hover:bg-gray-700 rounded cursor-pointer transition duration-200">
          <Home size={20} className="mr-2" /> {/* Ícono de Inicio */}
          <span>Inicio</span>
        </li>
        {/* Elemento "Dispositivos" con submenú */}
        <li className="flex items-center justify-between p-2 hover:bg-gray-700 rounded cursor-pointer transition duration-200" onClick={toggleDevices}>
          <div className="flex items-center">
            <Layers size={20} className="mr-2" /> {/* Ícono de Dispositivos */}
            <span>Dispositivos</span>
          </div>
          {isDevicesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />} {/* Ícono que cambia */}
        </li>
        {isDevicesOpen && ( // Mostrar el submenú si isDevicesOpen es true
          <ul className="ml-4 mt-2">
            <li className="flex items-center p-2 hover:bg-gray-600 rounded cursor-pointer transition duration-200">
              <Pickaxe size={20} className="mr-2" /> {/* Ícono de Minas */}
              <span>Minas</span>
            </li>
            <li className="flex items-center p-2 hover:bg-gray-600 rounded cursor-pointer transition duration-200">
              <BookMinus size={20} className="mr-2" /> {/* Ícono de Nodos Sensores */}
              <span>Nodos Sensores</span>
            </li>
            <li className="flex items-center p-2 hover:bg-gray-600 rounded cursor-pointer transition duration-200">
              <OctagonMinus size={20} className="mr-2" /> {/* Ícono de Sensores */}
              <span>Sensores</span>
            </li>
          </ul>
        )}
        {/* Otros elementos */}
        {["Alarmas", "Tableros", "Perfiles", "Configuración"].map((item) => (
          <li key={item} className="flex items-center p-2 hover:bg-gray-700 rounded cursor-pointer transition duration-200">
            {item === "Alarmas" && <AlertCircle size={20} className="mr-2" />} {/* Ícono de Alarmas */}
            {item === "Tableros" && <Grid size={20} className="mr-2" />} {/* Ícono de Tableros */}
            {item === "Perfiles" && <User  size={20} className="mr-2" />} {/* Ícono de Perfiles */}
            {item === "Configuración" && <Settings size={20} className="mr-2" />} {/* Ícono de Configuración */}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;