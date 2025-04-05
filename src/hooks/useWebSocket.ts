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

  // Helper function to build a URL with machine_id parameter
  const getUrlWithMachineId = useCallback(
    (baseUrl = import.meta.env.VITE_WEBSOCKET_URL, machineId?: string) => {
      const id = machineId || configRef.current.instanceId;

      if (!id) return baseUrl;

      const separator = baseUrl.includes("?") ? "&" : "?";
      return `${baseUrl}${separator}machine_id=${id}`;
    },
    []
  );

  const cleanup = useCallback((skipUrlReset: boolean = false) => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    isConnectingRef.current = false;

    // Only reset URL and instanceId during normal cleanup, not redirects
    if (!skipUrlReset) {
      configRef.current.url = import.meta.env.VITE_WEBSOCKET_URL;
      configRef.current.instanceId = undefined;
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

      console.log("Connecting to WebSocket...");
      cleanup(!!url || !!instanceId); // Skip URL reset if providing a new URL or instanceId
      isConnectingRef.current = true;

      try {
        // Use provided URL or build one with machine_id if available
        const wsUrl =
          url ||
          (configRef.current.instanceId
            ? getUrlWithMachineId()
            : configRef.current.url);

        console.log("WebSocket URL:", wsUrl);

        // Create WebSocket connection
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        ws.binaryType = "arraybuffer";

        // Store instance ID in config if provided
        if (instanceId) {
          configRef.current.instanceId = instanceId;
        }

        const connectionTimeout = setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            console.error("WebSocket connection timeout");
            ws.close();
          }
        }, CONNECTION_TIMEOUT);

        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log("WebSocket connected to:", wsUrl);
          isConnectingRef.current = false;
          setIsConnected(true);
          setIsRedirecting(false);
          onError("");
          reconnectAttemptsRef.current = 0;

          // If we have a stored play request and we're connecting to a new server, replay it
          if (configRef.current.lastPlayRequest && url) {
            try {
              console.log(
                "Replaying stored request:",
                configRef.current.lastPlayRequest
              );
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

              console.log("Sending initial ping:", pingMessage);
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
              console.log(
                "Raw message received:",
                messageStr.slice(0, 200) +
                  (messageStr.length > 200 ? "..." : "")
              );

              const message = JSON.parse(messageStr) as GameMessage;
              console.log(
                "Parsed message type:",
                typeof message === "object" ? Object.keys(message)[0] : message
              );

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

                // Store machine_id for future connections
                configRef.current.instanceId = machine_id;

                // Build URL with machine_id parameter
                const url = getUrlWithMachineId(
                  import.meta.env.VITE_WEBSOCKET_URL,
                  machine_id
                );
                configRef.current.url = url;

                // Extract player_id from the lastPlayRequest for Join message
                if (
                  typeof configRef.current.lastPlayRequest === "object" &&
                  "Play" in configRef.current.lastPlayRequest
                ) {
                  const playerId =
                    configRef.current.lastPlayRequest?.Play?.player_id;
                  const playerName =
                    configRef.current.lastPlayRequest?.Play?.name;

                  configRef.current.lastPlayRequest = {
                    Join: {
                      player_id: playerId,
                      game_id: game_id,
                      name: playerName,
                    },
                  };
                  console.log(
                    "Updated lastPlayRequest for Join:",
                    configRef.current.lastPlayRequest
                  );
                }

                // Extract player_id from the lastPlayRequest for Join message
                if (
                  typeof configRef.current.lastPlayRequest === "object" &&
                  "Join" in configRef.current.lastPlayRequest
                ) {
                  const playerId =
                    configRef.current.lastPlayRequest?.Join?.player_id;
                  const playerName =
                    configRef.current.lastPlayRequest?.Join?.name;

                  configRef.current.lastPlayRequest = {
                    Join: {
                      player_id: playerId,
                      game_id: game_id,
                      name: playerName,
                    },
                  };
                  console.log(
                    "Updated lastPlayRequest for Join:",
                    configRef.current.lastPlayRequest
                  );
                }

                // Cleanup but preserve URL and instanceId
                cleanup(true);

                // Add small delay before reconnecting to ensure clean connection
                setTimeout(() => {
                  console.log("Reconnecting to:", url);
                  connect(url);
                }, 100);

                return;
              }

              onMessage(message);
            } else {
              console.warn("Received non-binary message:", event.data);
            }
          } catch (err) {
            console.error("Error parsing message:", err);
            console.error(
              "Raw data length:",
              event.data instanceof ArrayBuffer
                ? event.data.byteLength
                : String(event.data).length
            );
          }
        };

        ws.onerror = (event) => {
          clearTimeout(connectionTimeout);
          console.error("WebSocket error:", event);

          // Provide more specific error messaging based on connection state
          if (ws.readyState === WebSocket.CONNECTING) {
            onError("Failed to establish connection to game server");
          } else if (ws.readyState === WebSocket.OPEN) {
            onError("Connection interrupted with game server");
          } else {
            onError("WebSocket error occurred");
          }

          // Check if we're using a machine_id parameter
          const wsUrl = ws.url || "";
          if (wsUrl.includes("machine_id=")) {
            console.error("Error occurred with machine_id routing");
          }
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

                // Reconnect with machine_id if available
                if (configRef.current.instanceId) {
                  const url = getUrlWithMachineId();
                  connect(url);
                } else {
                  connect();
                }
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
    [cleanup, getNextReconnectDelay, onMessage, onError, getUrlWithMachineId]
  );

  useEffect(() => {
    // Check if we have a stored machine ID and use it for the initial connection
    if (configRef.current.instanceId) {
      const url = getUrlWithMachineId();
      connect(url);
    } else {
      connect();
    }

    return () => cleanup();
  }, [connect, cleanup, getUrlWithMachineId]);

  const sendMessage = useCallback(
    (message: GameMessage) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.error("WebSocket is not connected");
        onError("Not connected to server");
        return;
      }

      try {
        // Store Play requests for potential replay after redirect
        if (
          typeof message === "object" &&
          ("Play" in message || "Join" in message)
        ) {
          console.log("Storing Play request for potential replay:", message);
          configRef.current.lastPlayRequest = message;
        }

        const messageStr = JSON.stringify(message);
        const encoder = new TextEncoder();
        const binaryData = encoder.encode(messageStr);
        console.log(
          "Sending message:",
          typeof message === "object" ? Object.keys(message)[0] : message
        );
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
