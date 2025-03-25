import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";

interface AppContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  // isSidebarOpen: boolean;
  // toggleSidebar: () => void;
  isDevicesSidebarOpen: boolean;
  toggleDivecesSidebar: () => void;
}

// Crear el contexto con tipado
const AppContext = createContext<AppContextType | undefined>(undefined);

// Interfaz para las props del proveedor
interface AppProviderProps {
  children: ReactNode;
}

// Proveedor del contexto
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Estado para el tema (dark/light)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Recuperar el tema del localStorage si existe
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  // Estado para el sidebar
  // const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isDevicesSidebarOpen, setIsDevicesSidebarOpen] =
    useState<boolean>(false);

  // Efecto para guardar el tema en localStorage
  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(isDarkMode));

    // Aplicar clases de tema al documento
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Función para alternar el tema
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // Función para alternar el sidebar
  // const toggleSidebar = () => {
  //   setIsSidebarOpen((prevState) => !prevState);
  // };
  const toggleDivecesSidebar = () => {
    setIsDevicesSidebarOpen((prevState) => !prevState);
  };

  // Valor del contexto
  const contextValue: AppContextType = {
    isDarkMode,
    toggleTheme,
    // isSidebarOpen,
    // toggleSidebar,
    isDevicesSidebarOpen,
    toggleDivecesSidebar,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useAppContext debe ser usado dentro de un AppProvider");
  }

  return context;
};
