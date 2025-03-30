import { useCallback, useEffect, useRef, useState } from "react";
import { GameMessage, GameState } from "../types/gameTypes";

const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;
const BACKOFF_MULTIPLIER = 1.5;
const MAX_RETRIES = 10;
const CONNECTION_TIMEOUT = 5000;

interface WebSocketHookProps {
  onMessage: (message: GameMessage) => void;
  onError: (error: string) => void;
  gameState?: GameState | null;
}

interface WebSocketConfig {
  url: string;
  lastPlayRequest?: GameMessage;
  instanceId?: string;
}

const useWebSocket = ({
  onMessage,
  onError,
  gameState,
}: WebSocketHookProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef<number>(0);
  const isConnectingRef = useRef<boolean>(false);
  const gameStateRef = useRef<GameState | null>(gameState ?? null);
  const configRef = useRef<WebSocketConfig>({
    url: import.meta.env.VITE_WEBSOCKET_URL,
    lastPlayRequest: undefined,
    instanceId: undefined,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Update gameStateRef whenever gameState changes
  useEffect(() => {
    gameStateRef.current = gameState ?? null;
  }, [gameState]);

  const getNextReconnectDelay = useCallback(() => {
    const delay =
      INITIAL_RECONNECT_DELAY *
      Math.pow(BACKOFF_MULTIPLIER, reconnectAttemptsRef.current);
    return Math.min(delay, MAX_RECONNECT_DELAY);
  }, []);

  const cleanup = useCallback((skipCookieClear: boolean = false) => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    isConnectingRef.current = false;

    // Only clear the cookie if not skipping
    if (!skipCookieClear) {
      document.cookie = "fly-machine-id=; max-age=0; path=/";
    }
  }, []);

  const connect = useCallback(
    (url?: string, instanceId?: string) => {
      if (
        isConnectingRef.current ||
        wsRef.current?.readyState === WebSocket.OPEN ||
        wsRef.current?.readyState === WebSocket.CONNECTING
      ) {
        return;
      }

      cleanup();
      isConnectingRef.current = true;

      try {
        // Use provided URL or fallback to current config URL
        const wsUrl = url || configRef.current.url;

        // Create WebSocket connection
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        ws.binaryType = "arraybuffer";

        // Store instance ID in config
        if (instanceId) {
          configRef.current.instanceId = instanceId;
        }

        const connectionTimeout = setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            ws.close();
          }
        }, CONNECTION_TIMEOUT);

        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          // console.log("WebSocket connected to:", wsUrl);
          isConnectingRef.current = false;
          setIsConnected(true);
          setIsRedirecting(false);
          onError("");
          reconnectAttemptsRef.current = 0;

          // If we have a stored play request and we're connecting to a new server, replay it
          if (configRef.current.lastPlayRequest && url) {
            try {
              const messageStr = JSON.stringify(
                configRef.current.lastPlayRequest
              );
              const encoder = new TextEncoder();
              const binaryData = encoder.encode(messageStr);
              ws.send(binaryData);
              // Clear the stored request after replaying
              configRef.current.lastPlayRequest = undefined;
            } catch (err) {
              console.error("Error replaying last request:", err);
            }
          } else {
            // Send initial ping
            try {
              const currentGameState = gameStateRef.current;
              let pingMessage: GameMessage = "Ping";

              if (currentGameState) {
                if ("RUNNING" in currentGameState) {
                  pingMessage = {
                    Ping: { game_id: currentGameState.RUNNING.game_id },
                  };
                } else if ("WAITING" in currentGameState) {
                  pingMessage = {
                    Ping: { game_id: currentGameState.WAITING.game_id },
                  };
                }
              }

              const messageStr = JSON.stringify(pingMessage);
              const encoder = new TextEncoder();
              const binaryData = encoder.encode(messageStr);
              ws.send(binaryData);
            } catch (err) {
              console.error("Error sending initial ping:", err);
            }
          }
        };

        ws.onmessage = (event) => {
          try {
            if (event.data instanceof ArrayBuffer) {
              const decoder = new TextDecoder("utf-8");
              const messageStr = decoder.decode(event.data);
              const message = JSON.parse(messageStr) as GameMessage;
              console.log("Received message:", message);

              // Handle RedirectToServer message
              if (
                typeof message === "object" &&
                "RedirectToServer" in message
              ) {
                const { game_id, machine_id } = message.RedirectToServer;
                console.log(
                  `Redirecting to server, game_id: ${game_id}, with machine_id: ${machine_id}`
                );
                setIsRedirecting(true);
                configRef.current.url = import.meta.env.VITE_WEBSOCKET_URL;

                // Set the fly-machine-id cookie when we receive a RedirectToServer message
                if (machine_id) {
                  const maxAge = 6 * 24 * 60 * 60 * 1000; // 6 days
                  document.cookie = `fly-machine-id=${machine_id}; max-age=${maxAge}; path=/`;
                }
                // Extract player_id from the lastPlayRequest
                if (
                  typeof configRef.current.lastPlayRequest === "object" &&
                  "Play" in configRef.current.lastPlayRequest
                ) {
                  const playerId =
                    configRef.current.lastPlayRequest?.Play?.player_id;
                  configRef.current.lastPlayRequest = {
                    Join: {
                      player_id: playerId,
                      game_id: game_id,
                      name: configRef.current.lastPlayRequest?.Play?.name,
                    },
                  };
                }

                // Cleanup without clearing the cookie
                cleanup(true);
                connect(import.meta.env.VITE_WEBSOCKET_URL);
                return;
              }

              onMessage(message);
            } else {
              console.warn("Received non-binary message:", event.data);
            }
          } catch (err) {
            console.error("Error parsing message:", err);
          }
        };

        ws.onerror = (event) => {
          clearTimeout(connectionTimeout);
          console.error("WebSocket error:", event);
        };

        ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          console.log(
            `WebSocket closed with code ${event.code}, reason: ${event.reason}`
          );
          isConnectingRef.current = false;
          setIsConnected(false);
          wsRef.current = null;

          // Don't attempt to reconnect if we're in the middle of a redirect
          if (!isRedirecting) {
            if (
              event.code !== 1000 &&
              reconnectAttemptsRef.current < MAX_RETRIES
            ) {
              const nextDelay = getNextReconnectDelay();
              console.log(
                `Scheduling reconnect in ${nextDelay}ms (attempt ${
                  reconnectAttemptsRef.current + 1
                })`
              );

              reconnectTimeoutRef.current = setTimeout(() => {
                reconnectAttemptsRef.current++;
                connect();
              }, nextDelay);
            } else if (reconnectAttemptsRef.current >= MAX_RETRIES) {
              console.log("Maximum reconnection attempts reached");
              onError(
                "Maximum reconnection attempts reached. Please refresh the page."
              );
            }
          }
        };
      } catch (err) {
        console.error("Connection error:", err);
        isConnectingRef.current = false;
        onError("Failed to connect to game server");
        setIsConnected(false);

        if (!isRedirecting && reconnectAttemptsRef.current < MAX_RETRIES) {
          const nextDelay = getNextReconnectDelay();
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, nextDelay);
        }
      }
    },
    [cleanup, getNextReconnectDelay, onMessage, onError]
  );

  useEffect(() => {
    connect();
    return cleanup;
  }, [connect, cleanup]);

  const sendMessage = useCallback(
    (message: GameMessage) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.error("WebSocket is not connected");
        onError("Not connected to server");
        return;
      }

      try {
        // Store Play requests for potential replay after redirect
        if (typeof message === "object" && "Play" in message) {
          configRef.current.lastPlayRequest = message;
        }

        const messageStr = JSON.stringify(message);
        const encoder = new TextEncoder();
        const binaryData = encoder.encode(messageStr);
        console.log("Sending message:", messageStr);
        wsRef.current.send(binaryData);
      } catch (err) {
        console.error("Error sending message:", err);
        onError("Failed to send message");
      }
    },
    [onError]
  );

  return {
    sendMessage,
    isConnected,
    isRedirecting,
    reconnect: connect,
  };
};

export default useWebSocket;
