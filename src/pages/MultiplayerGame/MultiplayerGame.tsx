import { useEffect, useState, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

// Types matching Rust backend exactly
type Player = {
  id: string;
};

type Board = {
  n: number;
  grid: ('Hidden' | 'Revealed' | 'Mined')[][];
  bomb_coordinates: number[];
};

type GameState =
  | { WAITING: { game_id: string; creator: Player; board: Board; single_bet_size: number } }
  | { RUNNING: { game_id: string; players: Player[]; board: Board; turn_idx: number; single_bet_size: number } }
  | { FINISHED: { game_id: string; winner_idx: number; board: Board; players: Player[]; single_bet_size: number } }
  | { ABORTED: { game_id: string } }; // Added ABORTED state

type GameMessage = {
  Play?: { player_id: string; single_bet_size: number };
  MakeMove?: { game_id: string; x: number; y: number };
  Stop?: { game_id: string; abort: boolean };
  GameUpdate?: GameState;
  Error?: string;
};

const WEBSOCKET_URL = 'ws://127.0.0.1:3000';
const RECONNECT_DELAY = 2000;
const MOVE_TIMEOUT = 5000; // 5 seconds

const MultiplayerGame = ({ userData }: {
  userData?: {
    clerk_id: string;
    email: string;
    name: string;
    profile_picture: string | null;
    wallet_balance?: number;
    id?: number;
  }
}) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [betAmount, setBetAmount] = useState<number>(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number>();
  const moveTimeoutRef = useRef<number>();
  const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set());
  const [turnCount, setTurnCount] = useState<number>(0);

  const gemSound = useRef(new Audio('/assets/sounds/gemSound.mp3'));
  const bombSound = useRef(new Audio('/assets/sounds/bombSound.mp3'));

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
            const message = JSON.parse(messageStr) as GameMessage;
            console.log('Received message:', message);

            // 
            if ('GameUpdate' in message) {
              const newGameState = message.GameUpdate;
              setGameState(newGameState ?? null);
              
              if (newGameState) {
                // console.log('Updated game state:', newGameState);
                // console.log("gamestateeeeee#####:", message);
                // console.log("newgamestateeeeee#####:", newGameState);
                // console.log("### turn count:", turnCount);
                
                // // Update turnCount when the turn index changes
                // if ('RUNNING' in newGameState) {
                //   const newTurnIdx = newGameState.RUNNING.turn_idx;
                //   if (gameState && 'RUNNING' in gameState) {
                //     const previousTurnIdx = gameState.RUNNING.turn_idx;
                //     if (newTurnIdx !== previousTurnIdx) {
                //       setTurnCount((prevCount) => prevCount + 1);
                //     }
                //   } else {
                //     // If gameState is null or not RUNNING, initialize turnCount
                //     setTurnCount(1); // Start counting from 1 for the first turn
                //   }
                // }

                // Clear existing timeout
                if (moveTimeoutRef.current) {
                  clearTimeout(moveTimeoutRef.current);
                }

                if ('RUNNING' in newGameState) {
                  // Set timeout for move inactivity
                  moveTimeoutRef.current = window.setTimeout(() => {
                    setTurnCount((prevCount) => {
                      let abort = true;
                      console.log("Prevcount count:", prevCount); 
                      
                      if (prevCount > 0) {
                        abort = false;
                        console.log("########## turn Counter greater than one now, abort set to false ");
                      }
                      const stopMessage: GameMessage = {
                        Stop: {
                          game_id: newGameState.RUNNING.game_id,
                          abort: abort,
                        },
                      };
                      sendMessage(stopMessage);
                      return prevCount;
                    });
                  }, MOVE_TIMEOUT);
                } else if ('WAITING' in newGameState) {
                  // Set timeout for game start inactivity
                  moveTimeoutRef.current = window.setTimeout(() => {
                    const stopMessage: GameMessage = {
                      Stop: {
                        game_id: newGameState.WAITING.game_id,
                        abort: true, // At the start, set abort: true
                      },
                    };
                    sendMessage(stopMessage);
                    setGameState(null);
                    setRevealedCells(new Set());
                    setError('Game aborted due to inactivity.');
                  }, MOVE_TIMEOUT);
                }

                // Update revealed cells based on the grid state
                if ('RUNNING' in newGameState || 'FINISHED' in newGameState) {
                  const newRevealedCells = new Set<string>();
                  const board = 'RUNNING' in newGameState ? newGameState.RUNNING.board : newGameState.FINISHED.board;
                  board.grid.forEach((row, x) => {
                    row.forEach((cell, y) => {
                      if (cell === 'Mined' || cell === 'Revealed') {
                        newRevealedCells.add(`${x}-${y}`);
                        const cellIndex = x * 5 + y;
                        if (board.bomb_coordinates.includes(cellIndex)) {
                          bombSound.current.play();
                        } else {
                          gemSound.current.play();
                        }
                      }
                    });
                  });
                  setRevealedCells(newRevealedCells);
                }
              }
            } else if ('Error' in message) {
              setError(message.Error ?? '');
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
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
    };
  }, [connect]);

  useEffect(() => {
    console.log("Turn count updated:", turnCount);
}, [turnCount]);

  const sendMessage = useCallback((message: GameMessage) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      setError('Not connected to server');
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
      setError('Failed to send message');
    }
  }, []);

  const playGame = useCallback(() => {
    if (!userData?.id) return;
    setRevealedCells(new Set());

    const message: GameMessage = {
      Play: {
        player_id: userData.id.toString(),
        single_bet_size: betAmount,
      },
    };

    console.log('Starting game with message:', message);
    sendMessage(message);
  }, [userData, betAmount, sendMessage]);

  const makeMove = useCallback((x: number, y: number) => {
    if (!gameState) return;

    // Clear existing timeout
    if (moveTimeoutRef.current) {
      clearTimeout(moveTimeoutRef.current);
    }

    let currentGameId: string;
    let board: Board | undefined;

    if ('RUNNING' in gameState) {
      currentGameId = gameState.RUNNING.game_id;
      board = gameState.RUNNING.board;
    } else if ('WAITING' in gameState) {
      currentGameId = gameState.WAITING.game_id;
      board = gameState.WAITING.board;
    } else if ('FINISHED' in gameState) {
      currentGameId = gameState.FINISHED.game_id;
      board = gameState.FINISHED.board;
    } else {
      return; // Return early if gameState is invalid
    }

    if (!board) return; // Return early if board is undefined

    const cellIndex = x * 5 + y;
    const isBomb = board.bomb_coordinates.includes(cellIndex);

    if (isBomb) {
      bombSound.current.play();
    } else {
      gemSound.current.play();
    }

    const message: GameMessage = {
      MakeMove: {
        game_id: currentGameId,
        x,
        y,
      },
    };

    console.log('Making move with message:', message);
    sendMessage(message);
    console.log("Turn count before:", turnCount);
    setTurnCount(prev => prev + 1);
    console.log("Turn count after:", turnCount);
    

    // Reset move timeout after making a move
    if ('RUNNING' in gameState) {
      moveTimeoutRef.current = window.setTimeout(() => {
        const abort = false; // In the middle of the game, set abort: false
        const stopMessage: GameMessage = {
          Stop: {
            game_id: currentGameId,
            abort: abort,
          },
        };
        console.log("STOPPPP MESSAAAAGEEE!!!: ",stopMessage);
        sendMessage(stopMessage);
      }, MOVE_TIMEOUT);
    }
  }, [gameState, sendMessage]);

  const playAgain = useCallback(() => {
    setGameState(null); // Reset game state to show the bet input form
    setRevealedCells(new Set()); // Reset revealed cells
    setError(''); // Clear any errors
    setBetAmount(0); // Reset bet amount to 0
  }, []);

  const renderGameBoard = () => {
    if (!gameState) return null;

    let board: Board | undefined;
    if ('WAITING' in gameState) {
      board = gameState.WAITING.board;
    } else if ('RUNNING' in gameState) {
      board = gameState.RUNNING.board;
    } else if ('FINISHED' in gameState) {
      board = gameState.FINISHED.board;
    }

    if (!board) return null; // Return early if board is undefined

    return (
      <div className="grid grid-cols-5 gap-3 mb-8">
        {Array(5).fill(null).map((_, row) =>
          Array(5).fill(null).map((_, col) => {
            const cellKey = `${row}-${col}`;
            const isRevealed = revealedCells.has(cellKey);
            const canMove = 'RUNNING' in gameState &&
              gameState.RUNNING.players[gameState.RUNNING.turn_idx].id === userData?.id?.toString();

            const cellIndex = row * 5 + col;
            const isBomb = board.bomb_coordinates.includes(cellIndex);

            const shouldShowContent = isRevealed || ('FINISHED' in gameState && isBomb);

            return (
              <button
                key={cellKey}
                onClick={() => canMove && !isRevealed && makeMove(row, col)}
                disabled={!canMove || isRevealed}
                className={`
                  w-16 h-16 flex items-center justify-center rounded-lg
                  transition-all duration-300 ease-in-out transform
                  ${shouldShowContent
                    ? isBomb
                      ? 'bg-red-900/30 border border-red-500/50'
                      : 'bg-emerald-900/30 border border-emerald-500/50'
                    : canMove
                      ? 'bg-zinc-900/80 hover:bg-zinc-800 hover:scale-105 border border-zinc-700'
                      : 'bg-zinc-900/50 border border-zinc-800'}
                  shadow-lg backdrop-blur-sm
                `}
              >
                {shouldShowContent ? (
                  isBomb ? (
                    <div className="text-red-500 text-2xl animate-bounce">💥</div>
                  ) : (
                    <div className="text-emerald-400 text-2xl animate-pulse">💎</div>
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
    if (!gameState || !userData) return null;

    if ('WAITING' in gameState) {
      return (
        <div className="flex flex-col items-center space-y-3 mb-8">
          <div className="text-zinc-400 flex items-center space-x-2">
            <Loader2 className="animate-spin" size={20} />
            <span>Finding opponent...</span>
          </div>
        </div>
      );
    }

    if ('RUNNING' in gameState) {
      const isMyTurn = gameState.RUNNING.players[gameState.RUNNING.turn_idx].id === userData?.id?.toString();
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
      const didWin = winner.id === userData?.id?.toString();
      return (
        <div className={`text-xl mb-8 font-medium ${didWin ? 'text-emerald-400' : 'text-red-400'}`}>
          {didWin ? 'Victory!' : 'Game Over'}
        </div>
      );
    }

    if ('ABORTED' in gameState) {
      return (
        <div className="text-xl mb-8 font-medium text-yellow-400">
          Game Aborted Due to Inactivity
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

        {(!gameState || 'ABORTED' in gameState) && (
          <div className="flex flex-col space-y-6 bg-zinc-900/50 p-8 rounded-xl border border-zinc-800 shadow-lg">
            <div className="flex flex-col space-y-3">
              <label htmlFor="betAmount" className="text-zinc-300 text-sm font-medium">
                Enter Bet Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="betAmount"
                  value={betAmount === 0 ? "" : betAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    setBetAmount(value === "" ? 0 : Number(value));
                  }}
                  placeholder="0"
                  className="w-full py-3 px-4 pl-10 rounded-lg font-medium bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500">
                  ₹
                </span>
              </div>
            </div>
            <button
              onClick={playGame}
              disabled={!isConnected || betAmount <= 0}
              className={`
                w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200
                bg-gradient-to-r from-emerald-500 to-teal-500 text-white
                hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-emerald-500/50
              `}
            >
              Start Game
            </button>
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

        {(gameState && ('FINISHED' in gameState || 'ABORTED' in gameState)) && (
          <button
            onClick={playAgain}
            className="w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30"
          >
            Play Again
          </button>
        )}
      </div>
    </div>
  );
};

export default MultiplayerGame;