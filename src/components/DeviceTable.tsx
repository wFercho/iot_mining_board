import { useEffect, useRef, useState } from "react";

const WS_URL = "ws://localhost:8000/ws";

export default function DeviceTable() {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<{ sensor_id: number; temperature?: number; humidity?: number }[]>([]);
    const ws = useRef<WebSocket | null>(null);

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
                console.log("📩 Mensaje recibido:", event.data);
                try {
                    const data = JSON.parse(event.data);
                    
                    // Validar que los datos sean correctos antes de agregarlos
                    if (typeof data.sensor_id === "number" && typeof data.temperature === "number" && typeof data.humidity === "number") {
                        setMessages(prev => [...prev, data]);
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

            ws.current.onerror = (event) => {
                console.error("❌ Error en WebSocket:", event);
            };
        }

        connectWebSocket();

        return () => {
            ws.current?.close();
        };
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">
                {isConnected ? "🟢 Conectado" : "🔴 Desconectado"}
            </h2>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 mt-4">
                    <thead>
                        <tr className="bg-gray-800 text-white">
                            <th className="border border-gray-600 px-4 py-2">Sensor ID</th>
                            <th className="border border-gray-600 px-4 py-2">Temperatura (°C)</th>
                            <th className="border border-gray-600 px-4 py-2">Humedad (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {messages.map((msg, index) => (
                            <tr key={index} className="border border-gray-300 text-center">
                                <td className="border border-gray-300 px-4 py-2">{msg.sensor_id}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    {msg.temperature !== undefined ? msg.temperature.toFixed(2) : "N/A"}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                    {msg.humidity !== undefined ? msg.humidity.toFixed(2) : "N/A"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
