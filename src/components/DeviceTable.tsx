import { useEffect, useRef, useState } from "react";

const WS_URL = "ws://localhost:8000/ws";

export default function DeviceTable() {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<string[]>([]); // Estado para almacenar los datos recibidos
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

                // 🔹 Enviar un mensaje cada 30 segundos para mantener la conexión activa
                const keepAliveInterval = setInterval(() => {
                    if (ws.current?.readyState === WebSocket.OPEN) {
                        ws.current.send("ping");
                    }
                }, 30000);

                ws.current.onclose = () => clearInterval(keepAliveInterval);
            };

            ws.current.onmessage = (event) => {
                console.log("📩 Mensaje recibido:", event.data);
                setMessages(prev => [...prev, event.data]); // Guardar cada mensaje recibido en el estado
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

            {/* Tabla de datos recibidos */}
            <table className="w-full border-collapse border border-gray-300 mt-4">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border border-gray-300 px-4 py-2">#</th>
                        <th className="border border-gray-300 px-4 py-2">Mensaje</th>
                    </tr>
                </thead>
                <tbody>
                    {messages.map((msg, index) => (
                        <tr key={index} className="border border-gray-300">
                            <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                            <td className="border border-gray-300 px-4 py-2">{msg}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
