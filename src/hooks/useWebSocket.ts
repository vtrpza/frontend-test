import { useState, useEffect, useCallback, useRef } from 'react';
import type { WebsocketMessage } from '../types/websocket';

interface UseWebSocketOptions {
  onMessage?: (message: WebsocketMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  reconnectAttempts?: number;
}

/**
 * Custom hook for managing WebSocket connections to Binance streams
 */
export const useWebSocket = (
  symbols: string[],
  options: UseWebSocketOptions = {}
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectInterval = 5000,
    reconnectAttempts = 5
  } = options;

  // Connect to the WebSocket
  const connect = useCallback(() => {
    if (!symbols || symbols.length === 0) {
      setError('No symbols provided for WebSocket connection');
      return;
    }

    // Clean up previous connection if exists
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const streams = symbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
      const url = `wss://data-stream.binance.com/stream?streams=${streams}`;
      
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        setError(null);
        reconnectCountRef.current = 0;
        if (onOpen) onOpen();
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebsocketMessage;
          if (onMessage) onMessage(message);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket error:', e);
        setError('WebSocket connection error');
        if (onError) onError(e);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
        if (onClose) onClose();

        // Attempt to reconnect if not manually closed
        if (reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current += 1;
          console.log(`Attempting to reconnect (${reconnectCountRef.current}/${reconnectAttempts})...`);
          
          if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
          }
          
          timeoutRef.current = window.setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      setError('Failed to establish WebSocket connection');
      console.error('WebSocket connection error:', err);
    }
  }, [symbols, onMessage, onOpen, onClose, onError, reconnectInterval, reconnectAttempts]);

  // Disconnect from the WebSocket
  const disconnect = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  // Connect when symbols change
  useEffect(() => {
    if (symbols && symbols.length > 0) {
      connect();
    }

    // Clean up on unmount
    return () => {
      disconnect();
    };
  }, [symbols, connect, disconnect]);

  return { isConnected, error, connect, disconnect };
};

export default useWebSocket;
