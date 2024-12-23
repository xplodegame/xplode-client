import { useEffect, useState, useRef, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';

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
                newGameState.RUNNING.board.grid.forEach((row: ('Hidden' | 'Revealed' | 'Mined')[], x: number) => {
                  row.forEach((cell: 'Hidden' | 'Revealed' | 'Mined', y: number) => {
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
                board.bomb_coordinates.forEach((index: number) => {
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

  const sendMessage = useCallback((message: {
    CreateGame?: { player_id: string };
    JoinGame?: { game_id: string; player_id: string };
    MakeMove?: { game_id: string; x: number; y: number };
  }) => {
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

  const playAgain = useCallback(() => {
    setGameState(null); // Reset game state
    setGameId(''); // Clear game ID
    setRevealedCells(new Set()); // Reset revealed cells
    setError(''); // Clear any errors
  }, []);

  const renderGameBoard = () => {
    if (!gameState) return null;

    const board = 
      'RUNNING' in gameState ? gameState.RUNNING.board :
      'WAITING' in gameState ? gameState.WAITING.board :
      gameState.FINISHED.board;

    return (
        <div className="grid grid-cols-5 gap-3 mb-8">
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
                  w-16 h-16 flex items-center justify-center rounded-lg
                  transition-all duration-300 ease-in-out transform
                  ${isRevealed 
                    ? isBomb
                      ? 'bg-red-900/30 border border-red-500/50'
                      : 'bg-emerald-900/30 border border-emerald-500/50'
                    : canMove 
                      ? 'bg-zinc-900/80 hover:bg-zinc-800 hover:scale-105 border border-zinc-700'
                      : 'bg-zinc-900/50 border border-zinc-800'}
                  shadow-lg backdrop-blur-sm
                `}
              >
                {isRevealed ? (
                  isBomb ? (
                    <div className="text-red-500 text-2xl">💥</div>
                  ) : (
                    <div className="text-emerald-400 text-2xl">💎</div>
                  )
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-lg" />
                )}
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
        <div className="flex flex-col items-center space-y-3 mb-8">
          <div className="text-zinc-400 flex items-center space-x-2">
            <Loader2 className="animate-spin" size={20} />
            <span>Waiting for opponent...</span>
          </div>
          <div className="text-sm bg-zinc-900/50 px-4 py-2 rounded-lg border border-zinc-800">
            Game ID: <span className="text-emerald-400 font-mono">{gameState.WAITING.game_id}</span>
          </div>
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
        const didWin = winner.id === user.id;
        return (
          <div className={`text-xl mb-8 font-medium ${didWin ? 'text-emerald-400' : 'text-red-400'}`}>
            {didWin ? 'Victory!' : 'Game Over'}
          </div>
      );
    }
  };

  return (
<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-12 text-center bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          Mines
        </h1>
        
        {error && (
          <div className="text-red-400 text-sm mb-6 bg-red-950/30 border border-red-900/50 rounded-lg p-3">
            {error}
          </div>
        )}

        {!gameState && (
          <div className="flex flex-col gap-6 mb-8">
            <button
              onClick={createGame}
              disabled={!isConnected}
              className={`
                py-3 px-4 rounded-lg font-medium transition-all duration-200
                ${isConnected 
                  ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                  : 'bg-zinc-800/50 text-zinc-500 border border-zinc-800 cursor-not-allowed'}
              `}
            >
              New Game
            </button>
            <div className="flex gap-3">
              <input
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                placeholder="Game ID"
                className="flex-1 px-4 py-3 bg-zinc-900/50 rounded-lg border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
              />
              <button
                onClick={joinGame}
                disabled={!isConnected || !gameId}
                className={`
                  py-3 px-6 rounded-lg font-medium transition-all duration-200
                  ${isConnected && gameId
                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                    : 'bg-zinc-800/50 text-zinc-500 border border-zinc-800 cursor-not-allowed'}
                `}
              >
                Join
              </button>
            </div>
          </div>
        )}

        {renderGameStatus()}
        {renderGameBoard()}

        {!isConnected && (
          <div className="text-zinc-400 text-sm mt-6 flex items-center justify-center space-x-2">
            <Loader2 className="animate-spin" size={16} />
            <span>Reconnecting...</span>
          </div>
        )}

        {gameState && 'FINISHED' in gameState && (
          <button
            onClick={playAgain}
            className="py-3 px-6 rounded-lg font-medium transition-all duration-200 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30"
          >
            Play Again
          </button>
        )}
      </div>
    </div>
  );
};

export default MultiplayerGame;