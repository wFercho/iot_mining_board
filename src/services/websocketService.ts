/* eslint-disable @typescript-eslint/no-unused-vars */
// services/websocketService.ts

// Tipos para los mensajes WebSocket
export interface WebSocketMessage {
  content: string;
  type?: string;
  timestamp?: string;
}

// Tipos para eventos del WebSocket
export interface ConnectionEvent {
  isConnected: boolean;
  timestamp: Date;
}

export interface ErrorEvent {
  error: Error;
  type: 'connection' | 'message' | 'general';
  timestamp: Date;
}

// Tipos para los listeners
export type MessageListener = (data: WebSocketMessage) => void;
export type ConnectionListener = (event: ConnectionEvent) => void;
export type ErrorListener = (event: ErrorEvent) => void;

// Mapa de listeners tipado
type ListenerMap = {
  message: Set<MessageListener>;
  connection: Set<ConnectionListener>;
  error: Set<ErrorListener>;
};

class WebSocketService {
  private static instance: WebSocketService | null = null;
  private url: string;
  private socket: WebSocket | null = null;
  private listeners: ListenerMap = {
    message: new Set<MessageListener>(),
    connection: new Set<ConnectionListener>(),
    error: new Set<ErrorListener>()
  };
  
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 2000;
  private isConnecting = false;
  private keepAliveInterval: NodeJS.Timeout | null = null;
  private connectionPromise: Promise<void> | null = null;

  private constructor(url: string) {
    this.url = url;
  }

  static getInstance(url: string): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService(url);
    }
    return WebSocketService.instance;
  }

  static resetInstance(): void {
    WebSocketService.instance?.disconnect();
    WebSocketService.instance = null;
  }

  async connect(): Promise<void> {
    // Si ya hay una conexión en progreso, retornar esa promesa
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    if (this.socket?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error('WebSocket ya se está conectando'));
        return;
      }

      this.isConnecting = true;

      try {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = (): void => {
          console.log("✅ WebSocket: Conexión establecida");
          this.isConnecting = false;
          this.connectionPromise = null;
          this.reconnectAttempts = 0;
          this.setupKeepAlive();
          this.notifyConnectionListeners(true);
          resolve();
        };

        this.socket.onmessage = (event: MessageEvent): void => {
          try {
            if (event.data === 'pong') return;
            const data: WebSocketMessage = JSON.parse(event.data);
            this.notifyMessageListeners(data);
          } catch (error) {
            const errorEvent: ErrorEvent = {
              error: error instanceof Error ? error : new Error('Error parsing message'),
              type: 'message',
              timestamp: new Date()
            };
            this.notifyErrorListeners(errorEvent);
          }
        };

        this.socket.onclose = (event: CloseEvent): void => {
          this.isConnecting = false;
          this.connectionPromise = null;
          this.cleanupKeepAlive();
          this.notifyConnectionListeners(false);

          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout((): void => {
              this.reconnectAttempts++;
              this.connect().catch(console.error);
            }, this.reconnectInterval);
          }
        };

        this.socket.onerror = (event: Event): void => {
          this.isConnecting = false;
          this.connectionPromise = null;
          const errorEvent: ErrorEvent = {
            error: new Error('WebSocket connection error'),
            type: 'connection',
            timestamp: new Date()
          };
          this.notifyErrorListeners(errorEvent);
          reject(errorEvent.error);
        };

      } catch (error) {
        this.isConnecting = false;
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  private setupKeepAlive(): void {
    this.cleanupKeepAlive();
    this.keepAliveInterval = setInterval((): void => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send('ping');
      }
    }, 30000);
  }

  private cleanupKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  send(message: WebSocketMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      const error = new Error('WebSocket no está conectado');
      const errorEvent: ErrorEvent = {
        error,
        type: 'general',
        timestamp: new Date()
      };
      this.notifyErrorListeners(errorEvent);
      throw error;
    }
  }

  // Métodos específicos para cada tipo de listener
  subscribeMessage(listener: MessageListener): () => void {
    this.listeners.message.add(listener);
    return (): void => {
      this.listeners.message.delete(listener);
    };
  }

  subscribeConnection(listener: ConnectionListener): () => void {
    this.listeners.connection.add(listener);
    return (): void => {
      this.listeners.connection.delete(listener);
    };
  }

  subscribeError(listener: ErrorListener): () => void {
    this.listeners.error.add(listener);
    return (): void => {
      this.listeners.error.delete(listener);
    };
  }

  private notifyMessageListeners(data: WebSocketMessage): void {
    this.listeners.message.forEach((listener: MessageListener): void => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error en message listener:', error);
      }
    });
  }

  private notifyConnectionListeners(isConnected: boolean): void {
    const event: ConnectionEvent = {
      isConnected,
      timestamp: new Date()
    };
    this.listeners.connection.forEach((listener: ConnectionListener): void => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error en connection listener:', error);
      }
    });
  }

  private notifyErrorListeners(event: ErrorEvent): void {
    this.listeners.error.forEach((listener: ErrorListener): void => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error en error listener:', error);
      }
    });
  }

  disconnect(code?: number, reason?: string): void {
    this.cleanupKeepAlive();
    this.clearAllListeners();
    this.reconnectAttempts = this.maxReconnectAttempts;
    this.connectionPromise = null;
    
    if (this.socket) {
      this.socket.close(code || 1000, reason || 'Normal closure');
      this.socket = null;
    }
    
    this.isConnecting = false;
  }

  private clearAllListeners(): void {
    this.listeners.message.clear();
    this.listeners.connection.clear();
    this.listeners.error.clear();
  }

  getConnectionState(): 'connecting' | 'open' | 'closed' | 'error' {
    if (!this.socket) return 'closed';
    
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'open';
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'error';
    }
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  getMaxReconnectAttempts(): number {
    return this.maxReconnectAttempts;
  }
}
const WS_URL = import.meta.env.WS_URL

// Exportar la instancia singleton
export const webSocketService = WebSocketService.getInstance("ws://localhost:8000/ws");
export default WebSocketService;