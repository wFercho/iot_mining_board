import {
  ChevronDown,
  ChevronUp,
  Home,
  Settings,
  AlertCircle,
  Grid,
  User,
  Layers,
  Pickaxe,
  Router,
  SmartphoneNfc,
  Gauge,
} from "lucide-react"; // Asegúrate de tener lucide-react instalado
import { Link } from "wouter";
import { useAppContext } from "../state/appContext";
const moreSidebarElements: { name: string; href: string }[] = [
  {
    name: "Alarmas",
    href: "/alerts",
  },
  {
    name: "Minas",
    href: "/mines",
  },
  {
    name: "Tableros",
    href: "/data-table",
  },
  {
    name: "Perfiles",
    href: "/profiles",
  },
  {
    name: "Configuración",
    href: "/configuration",
  },
];
interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { isDevicesSidebarOpen, toggleDivecesSidebar } = useAppContext();

  return (
    <aside
      className={`bg-gray-800 text-white w-64 p-4 ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <h2 className="text-xl font-bold">Nombre</h2>
      <ul className="mt-4">
        {/* Elemento "Inicio" */}
        <Link href="/">
          {" "}
          <li className="flex items-center p-2 hover:bg-gray-700 rounded cursor-pointer transition duration-200">
            <Home size={20} className="mr-2" /> {/* Ícono de Inicio */}
            <span>Inicio</span>
          </li>
        </Link>
        {/* Elemento "Dispositivos" con submenú */}
        <li
          className="flex items-center justify-between p-2 hover:bg-gray-700 rounded cursor-pointer transition duration-200"
          onClick={toggleDivecesSidebar}
        >
          <div className="flex items-center">
            <Layers size={20} className="mr-2" /> {/* Ícono de Dispositivos */}
            <span>Dispositivos</span>
          </div>
          {isDevicesSidebarOpen ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}{" "}
          {/* Ícono que cambia */}
        </li>
        {isDevicesSidebarOpen && ( // Mostrar el submenú si isDevicesOpen es true
          <ul className="ml-4 mt-2">
            <Link href="/iot-gateway">
              <li className="flex items-center p-2 hover:bg-gray-600 rounded cursor-pointer transition duration-200">
                <Router size={20} className="mr-2" /> {/* Ícono de Minas */}
                <span>IoT Gateway</span>
              </li>
            </Link>
            <Link href="/nodes">
              <li className="flex items-center p-2 hover:bg-gray-600 rounded cursor-pointer transition duration-200">
                <SmartphoneNfc size={20} className="mr-2" />{" "}
                {/* Ícono de Nodos Sensores */}
                <span>Nodos Sensores</span>
              </li>
            </Link>
            <Link href="/sensors">
              <li className="flex items-center p-2 hover:bg-gray-600 rounded cursor-pointer transition duration-200">
                <Gauge size={20} className="mr-2" /> {/* Ícono de Sensores */}
                <span>Sensores</span>
              </li>
            </Link>
          </ul>
        )}
        {/* Otros elementos */}
        {moreSidebarElements.map((item) => (
          <Link href={item.href} key={"sidebar" + item.name}>
            <li className="flex items-center p-2 hover:bg-gray-700 rounded cursor-pointer transition duration-200">
              {item.name === "Alarmas" && (
                <AlertCircle size={20} className="mr-2" />
              )}{" "}
              {/* Ícono de Alarmas */}
              {item.name === "Minas" && (
                <Pickaxe size={20} className="mr-2" />
              )}{" "}
              {/* Ícono de Alarmas */}
              {item.name === "Tableros" && (
                <Grid size={20} className="mr-2" />
              )}{" "}
              {/* Ícono de Tableros */}
              {item.name === "Perfiles" && (
                <User size={20} className="mr-2" />
              )}{" "}
              {/* Ícono de Perfiles */}
              {item.name === "Configuración" && (
                <Settings size={20} className="mr-2" />
              )}{" "}
              {/* Ícono de Configuración */}
              <span>{item.name}</span>
            </li>
          </Link>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
