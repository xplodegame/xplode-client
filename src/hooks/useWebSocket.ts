import { useCallback, useEffect, useRef, useState } from 'react';
import { GameMessage } from '../types/gameTypes';

const WEBSOCKET_URL = 'ws://127.0.0.1:3000';
const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;
const BACKOFF_MULTIPLIER = 1.5;
const MAX_RETRIES = 10;

interface WebSocketHookProps {
  onMessage: (message: GameMessage) => void;
  onError: (error: string) => void;
}

const useWebSocket = ({ onMessage, onError }: WebSocketHookProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef<number>(0);
  const isConnectingRef = useRef<boolean>(false);
  const [isConnected, setIsConnected] = useState(false);

  const getNextReconnectDelay = useCallback(() => {
    const delay = INITIAL_RECONNECT_DELAY * Math.pow(BACKOFF_MULTIPLIER, reconnectAttemptsRef.current);
    return Math.min(delay, MAX_RECONNECT_DELAY);
  }, []);

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    isConnectingRef.current = false;
  }, []);

  const connect = useCallback(() => {
    if (isConnectingRef.current || 
        wsRef.current?.readyState === WebSocket.OPEN || 
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    cleanup();
    isConnectingRef.current = true;

    try {
      const ws = new WebSocket(WEBSOCKET_URL);
      wsRef.current = ws;
      ws.binaryType = 'arraybuffer';

      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          ws.close();
        }
      }, 5000);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('WebSocket connected');
        isConnectingRef.current = false;
        setIsConnected(true);
        onError('');
        reconnectAttemptsRef.current = 0;
        
        try {
          ws.send(JSON.stringify("Ping"));
        } catch (err) {
          console.error('Error sending initial ping:', err);
        }
      };

      ws.onmessage = (event) => {
        try {
          if (event.data instanceof ArrayBuffer) {
            const decoder = new TextDecoder('utf-8');
            const messageStr = decoder.decode(event.data);
            const message = JSON.parse(messageStr) as GameMessage;
            onMessage(message);
          } else {
            console.warn('Received non-binary message:', event.data);
          }
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      };

      ws.onerror = (event) => {
        clearTimeout(connectionTimeout);
        console.error('WebSocket error:', event);
      };

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log(`WebSocket closed with code ${event.code}, reason: ${event.reason}`);
        isConnectingRef.current = false;
        setIsConnected(false);
        wsRef.current = null;

        if (event.code !== 1000 && reconnectAttemptsRef.current < MAX_RETRIES) {
          const nextDelay = getNextReconnectDelay();
          console.log(`Scheduling reconnect in ${nextDelay}ms (attempt ${reconnectAttemptsRef.current + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, nextDelay);
        } else if (reconnectAttemptsRef.current >= MAX_RETRIES) {
          console.log('Maximum reconnection attempts reached');
          onError('Maximum reconnection attempts reached. Please refresh the page.');
        }
      };
    } catch (err) {
      console.error('Connection error:', err);
      isConnectingRef.current = false;
      onError('Failed to connect to game server');
      setIsConnected(false);
      
      if (reconnectAttemptsRef.current < MAX_RETRIES) {
        const nextDelay = getNextReconnectDelay();
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, nextDelay);
      }
    }
  }, [cleanup, getNextReconnectDelay, onMessage, onError]);

  useEffect(() => {
    connect();
    return cleanup;
  }, [connect, cleanup]);

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
      wsRef.current.send(binaryData);
    } catch (err) {
      console.error('Error sending message:', err);
      onError('Failed to send message');
    }
  }, [onError]);

  return { 
    sendMessage, 
    isConnected,
    reconnect: connect 
  };
};

export default useWebSocket;