import { create } from "zustand";
import { IRealTimeSensorData, MineNodes3D } from "../interfaces/main";
interface MineNodesState {
  nodes3D: MineNodes3D | undefined;
  loading: boolean;
  error: string | null;
  wsConnected: boolean;
  setNodes3D: (nodes3D: MineNodes3D) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setWsConnected: (connected: boolean) => void;
  updateNodeSensor: (sensorData: IRealTimeSensorData) => void;
}

// Crear store de Zustand
export const useMineNodesStore = create<MineNodesState>((set) => ({
  nodes3D: undefined,
  loading: true,
  error: null,
  wsConnected: false,
  setNodes3D: (nodes3D) => set({ nodes3D }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setWsConnected: (wsConnected) => set({ wsConnected }),
  updateNodeSensor: (sensorData) =>
    set((state) => {
      if (!state.nodes3D) return state;

      console.log("Actualizando sensor con datos:", sensorData);

      const updatedNodes = state.nodes3D.nodes.map((node) => {
        if (node.id !== sensorData.nodeId) return node;

        console.log("Encontrado nodo para actualizar:", node.id);

        // Actualizar el sensor específico
        const updatedSensors = node.sensors.map((sensor) => {
          // Comprobamos tanto sensor.id como sensor.ID para mayor compatibilidad
          const sensorIdMatches =
            (sensor.id && sensor.id === sensorData.sensorId) ||
            (sensor.id && sensor.id === sensorData.sensorId);

          if (!sensorIdMatches) return sensor;

          console.log(
            "Actualizando sensor:",
            sensor,
            "con nuevos datos:",
            sensorData
          );

          return {
            ...sensor,
            value: sensorData.value,
            alert: sensorData.alert,
          };
        });

        // Determinar si hay alguna alerta activa que no sea NORMAL
        const hasActiveAlert = updatedSensors.some(
          (sensor) => sensor.alert && sensor.alert.name !== "NORMAL"
        );

        // Determinar el nuevo color del nodo
        const determineNodeColor = () => {
          // Prioridad 1: Alerta PELIGRO
          const dangerAlert = updatedSensors.find(
            (s) => s.alert?.name === "PELIGRO"
          );
          if (dangerAlert) return dangerAlert.alert!.color;

          // Prioridad 2: Otras alertas
          const anyAlert = updatedSensors.find(
            (s) => s.alert && s.alert.name !== "NORMAL"
          );
          if (anyAlert) return anyAlert.alert!.color;

          // Si no hay alertas, mantener el color actual o usar el de zona
          return (
            node.color ||
            (node.zone.category === "bocamina"
              ? "blue"
              : node.zone.category === "extraction"
              ? "orange"
              : "#2268e0")
          );
        };

        return {
          ...node,
          sensors: updatedSensors,
          color: determineNodeColor(),
          // Añadimos metadatos de alerta que pueden ser útiles para la visualización
          hasAlert: hasActiveAlert,
          alertTimestamp: hasActiveAlert ? Date.now() : undefined,
        };
      });

      return {
        nodes3D: {
          ...state.nodes3D,
          nodes: updatedNodes,
        },
      };
    }),
}));
