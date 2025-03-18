import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import { INodeIn3D, INodeRealTimeData } from "../interfaces/main";

const MINES_API_HOST = ""
export const useNodes = (minaId: string) => {
    const [nodes3D, setNodes3D] = useState<INodeIn3D[]>();
    const [nodesRealTimeData, setNodesRealTimeData] = useState<INodeRealTimeData[]>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const socketRef = useRef<WebSocket | null>(null);

    // Memoiza la URL del WebSocket para evitar recreaciones innecesarias
    const wsUrl = useMemo(() => {
        return `${MINES_API_HOST || 'ws://localhost:8080'}/ws/minas/${minaId}`;
    }, [minaId]);

    // Función para obtener los nodos 3D utilizando Axios
    const fetchNodes3D = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get<INodeIn3D[]>(`/api/minas/${minaId}/nodes3d`);
            setNodes3D(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al obtener los nodos 3D');
            console.error('Error fetching nodes:', err);
        } finally {
            setLoading(false);
        }
    }, [minaId]);

    // Función para procesar mensajes recibidos por WebSocket
    const handleWebSocketMessage = useCallback((event: MessageEvent) => {
        try {
            const data = JSON.parse(event.data);
            setNodesRealTimeData(data);
        } catch (err) {
            console.error('Error parsing WebSocket data:', err);
        }
    }, []);

    // Función para manejar errores de WebSocket
    const handleWebSocketError = useCallback((error: Event) => {
        console.error('WebSocket error:', error);
        setError('Error en la conexión WebSocket');
    }, []);

    // Función para conectar WebSocket para datos en tiempo real
    const connectWebSocket = useCallback(() => {
        // Cerrar conexión existente si la hay
        if (socketRef.current) {
            socketRef.current.close();
        }

        // Crear nueva conexión
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        // Manejadores de eventos del WebSocket
        socket.onopen = () => {
            console.log(`WebSocket connected for mina ${minaId}`);
        };

        socket.onmessage = handleWebSocketMessage;
        socket.onerror = handleWebSocketError;

        socket.onclose = (event) => {
            console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
            // Reconectar después de un tiempo si la conexión se cierra inesperadamente
            setTimeout(() => {
                if (socketRef.current?.readyState === WebSocket.CLOSED) {
                    connectWebSocket();
                }
            }, 5000);
        };
    }, [minaId, wsUrl, handleWebSocketMessage, handleWebSocketError]);

    // Cargar datos iniciales y configurar WebSocket
    useEffect(() => {
        if (minaId) {
            fetchNodes3D();
            connectWebSocket();

            // Limpiar conexión al desmontar
            return () => {
                if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
                    socketRef.current.close();
                }
            };
        }
    }, [minaId, fetchNodes3D, connectWebSocket]);

    // Memoiza el objeto de retorno para evitar recreaciones innecesarias
    const returnValue = useMemo(() => ({
        nodes3D,
        nodesRealTimeData,
        loading,
        error,
        refreshData: fetchNodes3D
    }), [nodes3D, nodesRealTimeData, loading, error, fetchNodes3D]);

    return returnValue;
};