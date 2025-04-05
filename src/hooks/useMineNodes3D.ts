import { useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import { MineNodes3D, IRealTimeSensorData } from "../interfaces/main";
import { useMineNodesStore } from "../state/mineNodesStore";

const MINES_API_HOST = "localhost:8080";
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_INTERVAL_BASE = 1000;

export const useMineNodes3D = (mineId: string | undefined) => {
  const {
    nodes3D,
    loading,
    error,
    wsConnected,
    setNodes3D,
    setLoading,
    setError,
    setWsConnected,
    updateNodeSensor,
  } = useMineNodesStore();

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const wsUrl = useMemo(() => {
    if (!mineId) return;
    return `ws://${MINES_API_HOST}/ws/mine_nodes/${mineId}`;
  }, [mineId]);

  const fetchNodes3D = useCallback(async () => {
    if (!mineId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<MineNodes3D>(
        `http://${MINES_API_HOST}/mine-nodes3d/mine/${mineId}`
      );

      // Inicializar colores basados en la categoría de zona si no están definidos
      const nodesWithColor = response.data.nodes.map((node) => ({
        ...node,
        color:
          node.color ||
          (node.zone.category === "bocamina"
            ? "blue"
            : node.zone.category === "extraction"
            ? "orange"
            : "#2268e0"),
      }));

      setNodes3D({
        ...response.data,
        nodes: nodesWithColor,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener los nodos 3D"
      );
      console.error("Error fetching nodes:", err);
    } finally {
      setLoading(false);
    }
  }, [mineId, setLoading, setError, setNodes3D]);

  const handleWebSocketMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const newSensorData: IRealTimeSensorData = JSON.parse(event.data);
        console.log("Mensaje WebSocket recibido:", newSensorData);
        updateNodeSensor(newSensorData);
      } catch (err) {
        console.error("Error parsing WebSocket data:", err);
      }
    },
    [updateNodeSensor]
  );

  const handleWebSocketError = useCallback(
    (error: Event) => {
      console.error("WebSocket error:", error);
      setError("Error en la conexión WebSocket");
      setWsConnected(false);
    },
    [setError, setWsConnected]
  );

  const getReconnectDelay = useCallback(() => {
    const attempt = reconnectAttemptsRef.current;
    const baseDelay = RECONNECT_INTERVAL_BASE * Math.pow(2, attempt);
    const jitter = Math.random() * 0.5 + 0.75;
    return Math.min(baseDelay * jitter, 30000);
  }, []);

  const connectWebSocket = useCallback(() => {
    if (!wsUrl) return;

    // Si ya estamos conectados a la misma URL, no hacer nada
    if (
      socketRef.current?.readyState === WebSocket.OPEN &&
      socketRef.current?.url === wsUrl
    ) {
      return;
    }

    // Limpiar reconexión pendiente
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Cerrar solo si es una conexión diferente
    if (socketRef.current && socketRef.current.url !== wsUrl) {
      socketRef.current.close();
    }

    try {
      console.log(`Intentando conectar WebSocket a ${wsUrl}`);
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.addEventListener("message", handleWebSocketMessage);

      socket.onopen = () => {
        console.log(`WebSocket conectado para mina ${mineId}`);
        setWsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      socket.onerror = handleWebSocketError;

      socket.onclose = (event) => {
        console.log(
          `WebSocket conexión cerrada: ${event.code} ${
            event.reason || "Sin razón"
          }`
        );
        setWsConnected(false);

        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = getReconnectDelay();
          console.log(
            `Reintentando conexión en ${delay}ms (intento ${
              reconnectAttemptsRef.current + 1
            })`
          );

          reconnectTimeoutRef.current = window.setTimeout(() => {
            reconnectAttemptsRef.current++;
            connectWebSocket();
          }, delay);
        } else {
          console.error(
            "Se alcanzó el máximo número de intentos de reconexión"
          );
          setError(
            "No se pudo restablecer la conexión después de múltiples intentos."
          );
        }
      };
    } catch (err) {
      console.error("Error al crear conexión WebSocket:", err);
      setError("Error al iniciar la conexión WebSocket");
      setWsConnected(false);
    }
  }, [
    mineId,
    wsUrl,
    handleWebSocketMessage,
    handleWebSocketError,
    getReconnectDelay,
    setError,
    setWsConnected,
  ]);

  // Verificación periódica del estado de conexión
  useEffect(() => {
    let pingInterval: number;

    if (wsConnected && socketRef.current) {
      pingInterval = window.setInterval(() => {
        if (
          socketRef.current &&
          socketRef.current.readyState !== WebSocket.OPEN
        ) {
          console.log(
            "WebSocket: Detectada desconexión durante verificación periódica"
          );
          setWsConnected(false);
          connectWebSocket();
        }
      }, 30000);
    }

    return () => {
      if (pingInterval) clearInterval(pingInterval);
    };
  }, [wsConnected, connectWebSocket, setWsConnected]);

  useEffect(() => {
    if (mineId) {
      fetchNodes3D();
      connectWebSocket();

      return () => {
        if (reconnectTimeoutRef.current !== null) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }

        if (
          socketRef.current &&
          socketRef.current.readyState !== WebSocket.CLOSED
        ) {
          socketRef.current.close();
          socketRef.current = null;
        }
      };
    }
  }, [mineId, fetchNodes3D, connectWebSocket]);

  const reconnect = useCallback(() => {
    console.log("Intentando reconexión manual del WebSocket");
    reconnectAttemptsRef.current = 0;
    connectWebSocket();
  }, [connectWebSocket]);

  return {
    nodes3D,
    loading,
    error,
    wsConnected,
    refreshData: fetchNodes3D,
    reconnectWebSocket: reconnect,
  };
};
