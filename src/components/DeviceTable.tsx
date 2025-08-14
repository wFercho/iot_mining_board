import { useCallback, useEffect, useRef, useState } from "react";
import { useNotifications } from "../Context/NotificationsContext";
import { SensorData } from "../interfaces/Sensors";
import { useSearchParams } from 'react-router-dom';
import { SensorModal } from "./SensorModal";

const WS_URL = "ws://localhost:8000/ws";
const PAGE_SIZE = 10;






export default function DeviceTable() {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<SensorData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: keyof SensorData; direction: 'ascending' | 'descending' } | null>(null);
    const [highlightedRow, setHighlightedRow] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
    const [showModal, setShowModal] = useState(false);

    const ws = useRef<WebSocket | null>(null);
    const { addAlert } = useNotifications();

    // Mostrar notificación en el navbar
    const showAlertNotification = (message: SensorData) => {
        const alertMessage = `Sensor ${message.node_id} (${message.type}): ${message.value} ${message.unit}`;

        if (message.status === 'WARNING' || message.status === 'DANGER' || message.status === 'ERROR') {
            addAlert({
                message: alertMessage,
                type: message.status as 'WARNING' | 'DANGER' | 'ERROR',
                sensorId: message.id
            });
        }
    };



    // En DeviceTable

    // Pasar esta función al Navbar a través del contexto si es necesario

    // Conectar WebSocket
    useEffect(() => {
        function connectWebSocket() {
            if (ws.current) {
                ws.current.close();
            }

            ws.current = new WebSocket(WS_URL);

            ws.current.onopen = () => {
                console.log("✅ Conexión WebSocket abierta");
                setIsConnected(true);

                const keepAliveInterval = setInterval(() => {
                    if (ws.current?.readyState === WebSocket.OPEN) {
                        ws.current?.send("ping");
                    }
                }, 30000);

                if (ws.current) {
                    ws.current.onclose = () => clearInterval(keepAliveInterval);
                }
            };

            ws.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data) as SensorData;

                    // Validar estructura básica de datos
                    if (data && typeof data.id === 'string' && typeof data.type === 'string') {
                        setMessages(prev => [data, ...prev].slice(0, 1000));

                        // Mostrar notificación si es alerta
                        if (data.status === 'WARNING' || data.status === 'DANGER' || data.status === 'ERROR') {
                            showAlertNotification(data);
                        }
                    } else {
                        console.warn("⚠️ Datos inválidos recibidos:", data);
                    }
                } catch (error) {
                    console.error("❌ Error al analizar JSON:", error);
                }
            };

            ws.current.onclose = (event) => {
                console.log("🔌 Conexión WebSocket cerrada", event.code);
                setIsConnected(false);

                if (event.code !== 1000) {
                    setTimeout(connectWebSocket, 2000);
                }
            };

            ws.current.onerror = (error) => {
                console.error("❌ Error en WebSocket:", error);
            };
        }

        connectWebSocket();

        return () => {
            ws.current?.close();
        };
    }, []);



    // Ordenar datos
    const sortedMessages = [...messages];
    if (sortConfig !== null) {
        sortedMessages.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }

    // Filtrar datos
    const filteredMessages = sortedMessages.filter(message => {
        const lowerSearchTerm = searchTerm.toLowerCase();

        // Filtro especial para alertas
        if (lowerSearchTerm === 'status:warning,danger,error') {
            return message.status === 'WARNING' || message.status === 'DANGER' || message.status === 'ERROR';
        }

        // Filtro normal
        return (
            message.node_id.toLowerCase().includes(lowerSearchTerm) ||
            message.id.toLowerCase().includes(lowerSearchTerm) ||
            message.type.toLowerCase().includes(lowerSearchTerm) ||
            message.status.toLowerCase().includes(lowerSearchTerm) ||
            message.manufacturer.toLowerCase().includes(lowerSearchTerm)
        );
    });

    const handleNotificationClick = useCallback((sensorId: string) => {
        const sensorIndex = messages.findIndex(m => m.id === sensorId);
        console.log(sensorIndex, "asdada")
        if (sensorIndex === -1) return;

        const filteredIndex = filteredMessages.findIndex(m => m.id === sensorId);
        const page = Math.ceil((filteredIndex + 1) / PAGE_SIZE);
        console.log("entroooo");
        setSearchTerm(sensorId);
        setCurrentPage(page);
        setHighlightedRow(sensorId);

        setTimeout(() => setHighlightedRow(null), 3000);
    }, [messages, filteredMessages]);

    const handleRowClick = (sensor: SensorData) => {
        setSelectedSensor(sensor);
        setShowModal(true);
    };
    useEffect(() => {
        const alertId = searchParams.get('alert');

        console.log(alertId, "alertId from URL");
        if (alertId) {
            handleNotificationClick(alertId);

            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.delete('alert');
                return newParams;
            });
        }
    }, [searchParams, handleNotificationClick, setSearchParams]); // Dependencias importantes
    // Paginación
    const totalPages = Math.ceil(filteredMessages.length / PAGE_SIZE);
    const paginatedMessages = filteredMessages.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const requestSort = (key: keyof SensorData) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Filtrar solo alertas para el contador
    const alertMessages = messages.filter(m =>
        m.status === 'WARNING' || m.status === 'DANGER' || m.status === 'ERROR'
    );

    return (
        <div className="flex flex-col h-screen">

            {showModal && selectedSensor && (
                <SensorModal
                    sensor={selectedSensor}
                    onClose={() => setShowModal(false)}
                />
            )}
            <div className="flex-1 overflow-auto p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {isConnected ? "🟢 Conectado" : "🔴 Desconectado"} |
                        <span className="ml-2 text-sm font-normal text-gray-600">
                            Mostrando {filteredMessages.length} registros
                        </span>
                    </h2>

                    <div className="flex items-center space-x-4">
                        <input
                            type="text"
                            placeholder="Buscar nodo, tipo o fabricante..."
                            className="px-3 py-2 border rounded-md text-sm"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                            >
                                Anterior
                            </button>
                            <span className="text-sm">
                                Página {currentPage} de {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filtro rápido para alertas */}
                <div className="mb-4 flex space-x-2">
                    <button
                        onClick={() => setSearchTerm('')}
                        className={`px-3 py-1 text-sm rounded ${!searchTerm ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setSearchTerm('status:WARNING,DANGER,ERROR')}
                        className={`px-3 py-1 text-sm rounded ${searchTerm === 'status:WARNING,DANGER,ERROR'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200'
                            }`}
                    >
                        Alertas ({alertMessages.length})
                    </button>
                </div>

                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-800 text-white">
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium uppercase cursor-pointer"
                                    onClick={() => requestSort('id')}
                                >
                                    Nodo {sortConfig?.key === 'id' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium uppercase cursor-pointer"
                                    onClick={() => requestSort('type')}
                                >
                                    Tipo {sortConfig?.key === 'type' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                                    Valor
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium uppercase cursor-pointer"
                                    onClick={() => requestSort('manufacturer')}
                                >
                                    Fabricante {sortConfig?.key === 'manufacturer' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium uppercase cursor-pointer"
                                    onClick={() => requestSort('timestamp')}
                                >
                                    Fecha {sortConfig?.key === 'timestamp' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedMessages.length > 0 ? (
                                paginatedMessages.map((message, index) => (
                                    <tr
                                        key={`${message.id}-${index}`}
                                        id={`sensor-${message.id}`}
                                        className={`hover:bg-gray-50 ${message.status === 'ERROR' ? 'bg-red-50' :
                                            message.status === 'DANGER' ? 'bg-red-50' :
                                                message.status === 'WARNING' ? 'bg-yellow-50' : ''
                                            } 
                                            }`}
                                        onClick={() => handleRowClick(message)}

                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {message.node_id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {message.type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="font-semibold">{message.value.toFixed(2)}</span> {message.unit}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {message.manufacturer} ({message.model})
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(message.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${message.status === 'OK' ? 'bg-green-100 text-green-800' :
                                                message.status === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {message.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                        No hay datos disponibles
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        Mostrando {paginatedMessages.length} de {filteredMessages.length} registros
                    </div>
                    <div className="flex space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-3 py-1 rounded ${currentPage === pageNum ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                            <span className="px-3 py-1">...</span>
                        )}
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                className="px-3 py-1 bg-gray-200 rounded"
                            >
                                {totalPages}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}