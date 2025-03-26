import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import { MineNodes3D, INodeRealTimeData } from "../interfaces/main";

const MINES_API_HOST = "localhost:8080";
export const useMineNodes3D = (minaId: string | undefined) => {
  const [nodes3D, setNodes3D] = useState<MineNodes3D>();
  const [nodesRealTimeData, setNodesRealTimeData] =
    useState<INodeRealTimeData[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const wsUrl = useMemo(() => {
    if (!minaId) return;
    return `$"ws://${MINES_API_HOST}"/ws/minas/${minaId}`;
  }, [minaId]);

  const fetchNodes3D = useCallback(async () => {
    if (!minaId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<MineNodes3D>(
        `http://${MINES_API_HOST}/mine-nodes3d/mine/${minaId}`
      );

      setNodes3D(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener los nodos 3D"
      );
      console.error("Error fetching nodes:", err);
    } finally {
      setLoading(false);
    }
  }, [minaId]);

  const handleWebSocketMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      setNodesRealTimeData(data);
    } catch (err) {
      console.error("Error parsing WebSocket data:", err);
    }
  }, []);

  const handleWebSocketError = useCallback((error: Event) => {
    console.error("WebSocket error:", error);
    setError("Error en la conexión WebSocket");
  }, []);

  const connectWebSocket = useCallback(() => {
    if (!wsUrl) return;
    if (socketRef.current) {
      socketRef.current.close();
    }

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log(`WebSocket connected for mina ${minaId}`);
    };

    socket.onmessage = handleWebSocketMessage;
    socket.onerror = handleWebSocketError;

    socket.onclose = (event) => {
      console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
      setTimeout(() => {
        if (socketRef.current?.readyState === WebSocket.CLOSED) {
          connectWebSocket();
        }
      }, 5000);
    };
  }, [minaId, wsUrl, handleWebSocketMessage, handleWebSocketError]);

  useEffect(() => {
    if (minaId) {
      fetchNodes3D();
      connectWebSocket();

      return () => {
        if (
          socketRef.current &&
          socketRef.current.readyState !== WebSocket.CLOSED
        ) {
          socketRef.current.close();
        }
      };
    }
  }, [minaId, fetchNodes3D, connectWebSocket]);

  const returnValue = useMemo(
    () => ({
      nodes3D,
      nodesRealTimeData,
      loading,
      error,
      refreshData: fetchNodes3D,
    }),
    [nodes3D, nodesRealTimeData, loading, error, fetchNodes3D]
  );

  return returnValue;
};
