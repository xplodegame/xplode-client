import { useCallback, useEffect, useRef, useState } from 'react';
import { GameMessage } from '../types/gameTypes';

const WEBSOCKET_URL = 'ws://127.0.0.1:3000';
const RECONNECT_DELAY = 2000;

interface WebSocketHookProps {
  onMessage: (message: GameMessage) => void;
  onError: (error: string) => void;
}

const useWebSocket = ({ onMessage, onError }: WebSocketHookProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return; // Avoid reconnecting if already connected or connecting
    }

    try {
      const ws = new WebSocket(WEBSOCKET_URL);
      wsRef.current = ws;

      ws.binaryType = 'arraybuffer';

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        onError('');

        // Clear any pending reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = undefined;
        }
      };

      ws.onmessage = (event) => {
        try {
          if (event.data instanceof ArrayBuffer) {
            const decoder = new TextDecoder('utf-8');
            const messageStr = decoder.decode(event.data);
            const message = JSON.parse(messageStr) as GameMessage;
            console.log('Received message:', message);
            onMessage(message);
          } else {
            console.error('Received unexpected message type:', event.data);
          }
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setIsConnected(false);
        onError('Connection error occurred');

        // Attempt to reconnect immediately
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null; // Reset the WebSocket reference
        reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY);
      };
    } catch (err) {
      console.error('Connection error:', err);
      onError('Failed to connect to game server');
      setIsConnected(false);
    }
  }, [onMessage, onError]);

  useEffect(() => {
    // Add a delay before the initial connection attempt
    const initialDelay = setTimeout(() => {
      connect();
    }, 1000); // Delay the initial connection by 1 second

    return () => {
      clearTimeout(initialDelay); // Clear the timeout on cleanup
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: GameMessage) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      onError('Not connected to server');
      return;
    }

    try {
      const messageStr = JSON.stringify(message);
      const encoder = new TextEncoder();
      const binaryData = encoder.encode(messageStr);
      console.log('Sending message:', messageStr);
      wsRef.current.send(binaryData);
    } catch (err) {
      console.error('Error sending message:', err);
      onError('Failed to send message');
    }
  }, [onError]);

  return { sendMessage, isConnected };
};

export default useWebSocket;