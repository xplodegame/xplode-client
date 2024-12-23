import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';

// Types matching Rust backend exactly
type Player = {
  id: string;
  funds: number;
};

type Board = {
  n: number;
  grid: ('Hidden' | 'Revealed')[][];
  bomb_coordinates: number[];
};

type GameState = 
  | { WAITING: { game_id: string; creator: Player; board: Board } }
  | { RUNNING: { game_id: string; players: Player[]; board: Board; turn_idx: number } }
  | { FINISHED: { game_id: string; winner_idx: number; board: Board; players: Player[] } };

const WEBSOCKET_URL = 'ws://127.0.0.1:3000';
const RECONNECT_DELAY = 2000;

const MultiplayerGame = () => {
  const { user } = useUser();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameId, setGameId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number>();
  // Track revealed cells locally
  const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set());

  // Add sound effects
  const gemSound = useRef(new Audio('/gemSound.mp3'));
  const bombSound = useRef(new Audio('/bombSound.mp3'));

  const connect = useCallback(() => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      const ws = new WebSocket(WEBSOCKET_URL);
      wsRef.current = ws;

      ws.binaryType = 'arraybuffer';

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError('');
      };

    //   ws.onmessage = (event) => {
    //     try {
    //       if (event.data instanceof ArrayBuffer) {
    //         const decoder = new TextDecoder('utf-8');
    //         const messageStr = decoder.decode(event.data);
    //         const message = JSON.parse(messageStr);
    //         console.log('Received message:', message);

    //         if ('GameUpdate' in message) {
    //           setGameState(message.GameUpdate);
    //           console.log('Updated game state:', message.GameUpdate);

    //           // If game is finished, reveal all bombs
    //           if ('FINISHED' in message.GameUpdate) {
    //             const board = message.GameUpdate.FINISHED.board;
    //             board.bomb_coordinates.forEach(index => {
    //               const x = Math.floor(index / 5);
    //               const y = index % 5;
    //               setRevealedCells(prev => new Set([...prev, `${x}-${y}`]));
    //             });
    //           }
    //         } else if ('Error' in message) {
    //           setError(message.Error);
    //         }
    //       } else {
    //         console.error('Received unexpected message type:', event.data);
    //       }
    //     } catch (err) {
    //       console.error('Error parsing message:', err);
    //     }
    //   };
    ws.onmessage = (event) => {
        try {
          if (event.data instanceof ArrayBuffer) {
            const decoder = new TextDecoder('utf-8');
            const messageStr = decoder.decode(event.data);
            const message = JSON.parse(messageStr);
            console.log('Received message:', message);
      
            if ('GameUpdate' in message) {
              const newGameState = message.GameUpdate;
              setGameState(newGameState);
              console.log('Updated game state:', newGameState);
      
              // Update revealed cells based on the grid state
              if ('RUNNING' in newGameState) {
                const newRevealedCells = new Set<string>();
                newGameState.RUNNING.board.grid.forEach((row, x) => {
                  row.forEach((cell, y) => {
                    if (cell === 'Mined' || cell === 'Revealed') {
                      newRevealedCells.add(`${x}-${y}`);
                      // Play sound for newly revealed cells
                      const cellIndex = x * 5 + y;
                      if (newGameState.RUNNING.board.bomb_coordinates.includes(cellIndex)) {
                        bombSound.current.play();
                      } else {
                        gemSound.current.play();
                      }
                    }
                  });
                });
                setRevealedCells(newRevealedCells);
              }
      
              // If game is finished, reveal all bombs
              if ('FINISHED' in newGameState) {
                const board = newGameState.FINISHED.board;
                const newRevealedCells = new Set<string>();
                board.bomb_coordinates.forEach(index => {
                  const x = Math.floor(index / 5);
                  const y = index % 5;
                  newRevealedCells.add(`${x}-${y}`);
                });
                setRevealedCells(newRevealedCells);
              }
            } else if ('Error' in message) {
              setError(message.Error);
            }
          } else {
            console.error('Received unexpected message type:', event.data);
          }
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Connection error occurred');
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        reconnectTimeoutRef.current = window.setTimeout(connect, RECONNECT_DELAY);
      };
    } catch (err) {
      console.error('Connection error:', err);
      setError('Failed to connect to game server');
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: any) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      setError('Not connected to server');
      return;
    }

    try {
      const messageStr = JSON.stringify(message);
      console.log('Sending message:', messageStr);
      wsRef.current.send(messageStr);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  }, []);

  const createGame = useCallback(() => {
    if (!user) return;
    setRevealedCells(new Set()); // Reset revealed cells
    
    const message = {
      CreateGame: {
        player_id: user.id
      }
    };
    
    console.log('Creating game with message:', message);
    sendMessage(message);
  }, [user, sendMessage]);

  const joinGame = useCallback(() => {
    if (!user || !gameId) return;
    setRevealedCells(new Set()); // Reset revealed cells
    
    const message = {
      JoinGame: {
        game_id: gameId,
        player_id: user.id
      }
    };
    
    console.log('Joining game with message:', message);
    sendMessage(message);
  }, [user, gameId, sendMessage]);

  const makeMove = useCallback((x: number, y: number) => {
    if (!gameState) return;
    
    const currentGameId = 
      'RUNNING' in gameState ? gameState.RUNNING.game_id :
      'WAITING' in gameState ? gameState.WAITING.game_id :
      gameState.FINISHED.game_id;

    const board = 
      'RUNNING' in gameState ? gameState.RUNNING.board :
      'WAITING' in gameState ? gameState.WAITING.board :
      gameState.FINISHED.board;

    const cellIndex = x * 5 + y;
    const isBomb = board.bomb_coordinates.includes(cellIndex);

    // Play sound and reveal cell
    if (isBomb) {
      bombSound.current.play();
    } else {
      gemSound.current.play();
    }

    // Add to revealed cells
    setRevealedCells(prev => new Set([...prev, `${x}-${y}`]));

    const message = {
      MakeMove: {
        game_id: currentGameId,
        x,
        y
      }
    };
    
    console.log('Making move with message:', message);
    sendMessage(message);
  }, [gameState, sendMessage]);

  const renderGameBoard = () => {
    if (!gameState) return null;

    const board = 
      'RUNNING' in gameState ? gameState.RUNNING.board :
      'WAITING' in gameState ? gameState.WAITING.board :
      gameState.FINISHED.board;

    return (
      <div className="grid grid-cols-5 gap-2 mb-6">
        {Array(5).fill(null).map((_, row) =>
          Array(5).fill(null).map((_, col) => {
            const cellKey = `${row}-${col}`;
            const isRevealed = revealedCells.has(cellKey);
            const canMove = 'RUNNING' in gameState && 
              gameState.RUNNING.players[gameState.RUNNING.turn_idx].id === user?.id;

            const cellIndex = row * 5 + col;
            const isBomb = board.bomb_coordinates.includes(cellIndex);

            return (
              <button
                key={cellKey}
                onClick={() => makeMove(row, col)}
                disabled={!canMove || isRevealed}
                className={`
                  w-16 h-16 flex items-center justify-center rounded-md shadow-md 
                  transition-colors duration-200
                  ${isRevealed 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : canMove 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-800 cursor-not-allowed'}
                `}
              >
                {isRevealed ? (
                  isBomb ? (
                    <img src="/bomb.png" alt="Bomb" className="w-16 h-16" />
                  ) : (
                    <img src="/gems.png" alt="Gem" className="w-16 h-16" />
                  )
                ) : null}
              </button>
            );
          })
        )}
      </div>
    );
  };

  const renderGameStatus = () => {
    if (!gameState || !user) return null;

    if ('WAITING' in gameState) {
      return (
        <div className="text-xl text-blue-400 mb-4">
          <div>Waiting for opponent to join</div>
          <div className="text-sm mt-2">Share this Game ID: {gameState.WAITING.game_id}</div>
        </div>
      );
    }

    if ('RUNNING' in gameState) {
      const isMyTurn = gameState.RUNNING.players[gameState.RUNNING.turn_idx].id === user.id;
      return (
        <div className="text-xl mb-4">
          {isMyTurn ? (
            <span className="text-green-400">Your turn!</span>
          ) : (
            <span className="text-yellow-400">Opponent's turn</span>
          )}
        </div>
      );
    }

    if ('FINISHED' in gameState) {
      const winner = gameState.FINISHED.players[gameState.FINISHED.winner_idx];
      return (
        <div className="text-xl text-purple-400 mb-4">
          Game Over! {winner.id === user.id ? 'You won!' : 'Opponent won!'}
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-6">Multiplayer Mines Game</h1>
      
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      {!gameState && (
        <div className="flex flex-col gap-4 mb-6">
          <button
            onClick={createGame}
            disabled={!isConnected}
            className={`font-bold py-2 px-4 rounded ${
              isConnected 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            Create New Game
          </button>
          <div className="flex gap-2">
            <input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="Enter Game ID"
              className="px-3 py-2 bg-gray-800 rounded text-white"
            />
            <button
              onClick={joinGame}
              disabled={!isConnected || !gameId}
              className={`font-bold py-2 px-4 rounded ${
                isConnected && gameId
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              Join Game
            </button>
          </div>
        </div>
      )}

      {renderGameStatus()}
      {renderGameBoard()}

      {!isConnected && (
        <div className="text-red-500 mt-4">
          Disconnected from server. Attempting to reconnect...
        </div>
      )}

      {/* Debug State */}
      <div className="mt-8 p-4 bg-gray-800 rounded w-full max-w-2xl">
        <pre className="text-xs text-gray-400 overflow-auto">
          {JSON.stringify({isConnected, gameState, error}, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default MultiplayerGame;