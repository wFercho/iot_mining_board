interface WebSocketMessage {
    content: string;
    // Agrega otros campos según sea necesario
  }
  
  class WebSocketService {
    private url: string;
    private socket: WebSocket | null = null;
    private listeners: Array<(data: WebSocketMessage) => void> = [];
  
    constructor(url: string) {
      this.url = url;
    }
  
    connect() {
      this.socket = new WebSocket(this.url);
  
      this.socket.onopen = () => {
        console.log("Conexión WebSocket abierta");
      };
  
      this.socket.onmessage = (event) => {
        const data: WebSocketMessage = JSON.parse(event.data);
        this.listeners.forEach((listener) => listener(data));
      };
  
      this.socket.onclose = () => {
        console.log("Conexión WebSocket cerrada");
        // Aquí puedes implementar lógica de reconexión si es necesario
      };
  
      this.socket.onerror = (error) => {
        console.error("Error en WebSocket:", error);
      };
    }
  
    send(message: WebSocketMessage) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(message));
      } else {
        console.error("WebSocket no está abierto. No se puede enviar el mensaje.");
      }
    }
  
    addListener(listener: (data: WebSocketMessage) => void) {
      this.listeners.push(listener);
    }
  
    removeListener(listener: (data: WebSocketMessage) => void) {
      this.listeners = this.listeners.filter((l) => l !== listener);
    }
  
    disconnect() {
      if (this.socket) {
        this.socket.close();
      }
    }
  }
  
  export default WebSocketService;