// hooks/useWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  webSocketService, 
  WebSocketMessage, 
  ConnectionEvent, 
  ErrorEvent 
} from '../../services/websocketService';

interface UseWebSocketOptions {
  onMessage?: (data: WebSocketMessage) => void;
  onConnectionChange?: (isConnected: boolean, event: ConnectionEvent) => void;
  onError?: (event: ErrorEvent) => void;
  autoConnect?: boolean;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  connectionState: 'connecting' | 'open' | 'closed' | 'error';
  send: (message: WebSocketMessage) => void;
  disconnect: (code?: number, reason?: string) => void;
  connectionStatus: 'connecting' | 'open' | 'closed' | 'error';
}

export const useWebSocket = (options: UseWebSocketOptions = {}): UseWebSocketReturn => {
  const { 
   
    autoConnect = true 
  } = options;
  
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    // Estado inicial basado en la conexión actual
    return webSocketService.isConnected();
  });
  
  const [connectionState, setConnectionState] = useState<'connecting' | 'open' | 'closed' | 'error'>(() => {
    return webSocketService.getConnectionState();
  });

  // Usar useRef para mantener referencias estables a los callbacks
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Memoizar la función send
  const send = useCallback((message: WebSocketMessage): void => {
    webSocketService.send(message);
  }, []);

  // Memoizar la función disconnect
  const disconnect = useCallback((code?: number, reason?: string): void => {
    webSocketService.disconnect(code, reason);
  }, []);

  useEffect((): (() => void) => {
    if (!autoConnect) {
      console.log("🚫 useWebSocket: AutoConnect deshabilitado");
      return (): void => {};
    }

    console.log("🔌 useWebSocket: Inicializando conexión");

    let unsubscribeMessage: (() => void) | undefined;
    let unsubscribeConnection: (() => void) | undefined;
    let unsubscribeError: (() => void) | undefined;
    let isMounted = true;

    // Handler para mensajes
    const handleMessage = (data: WebSocketMessage): void => {
      if (!isMounted) return;
      if (optionsRef.current.onMessage) {
        optionsRef.current.onMessage(data);
      }
    };

    // Handler para cambios de conexión
    const handleConnectionChange = (event: ConnectionEvent): void => {
      if (!isMounted) return;
      setIsConnected(event.isConnected);
      setConnectionState(event.isConnected ? 'open' : 'closed');
      if (optionsRef.current.onConnectionChange) {
        optionsRef.current.onConnectionChange(event.isConnected, event);
      }
    };

    // Handler para errores
    const handleError = (event: ErrorEvent): void => {
      if (!isMounted) return;
      setConnectionState('error');
      setIsConnected(false);
      if (optionsRef.current.onError) {
        optionsRef.current.onError(event);
      }
    };

    const initializeWebSocket = async (): Promise<void> => {
      if (!isMounted) return;

      try {
        
        // Suscribirse a eventos
        unsubscribeMessage = webSocketService.subscribeMessage(handleMessage);
        unsubscribeConnection = webSocketService.subscribeConnection(handleConnectionChange);
        unsubscribeError = webSocketService.subscribeError(handleError);

        // Verificar estado actual y conectar si es necesario
        const currentState = webSocketService.getConnectionState();

        if (currentState === 'closed') {
          setConnectionState('connecting');
          await webSocketService.connect();
        } else if (currentState === 'open') {
          setIsConnected(true);
          setConnectionState('open');
        } else if (currentState === 'connecting') {
          setConnectionState('connecting');
        }

      } catch (error) {
        if (!isMounted) return;
                setConnectionState('error');
        setIsConnected(false);
        
        const errorEvent: ErrorEvent = {
          error: error instanceof Error ? error : new Error('Unknown connection error'),
          type: 'connection',
          timestamp: new Date()
        };
        handleError(errorEvent);
      }
    };

    initializeWebSocket();

    return (): void => {
      isMounted = false;
      unsubscribeMessage?.();
      unsubscribeConnection?.();
      unsubscribeError?.();
    };
  }, [autoConnect]); 

  return {
    isConnected,
    connectionState,
    send,
    disconnect,
    connectionStatus: webSocketService.getConnectionState()
  };
};