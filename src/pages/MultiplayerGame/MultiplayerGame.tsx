import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import useWebSocket from '../../hooks/useWebSocket';
import GameBoard from '../../components/GameBoard/GameBoard';
import GameStatus from '../../components/GameStatus/GameStatus';
import BetInput from '../../components/BetInput/BetInput';
import { GameState, GameMessage } from '../../types/gameTypes';

const MOVE_TIMEOUT = 5000; // 5 seconds

interface MultiplayerGameProps {
  userData?: {
    clerk_id: string; 
    email: string; 
    name: string | null; 
    wallet_balance?: number | null;
    id?: number;
  };
}

const MultiplayerGame: React.FC<MultiplayerGameProps> = ({ userData }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string>('');
  const [betAmount, setBetAmount] = useState<number>(0);
  const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set());
  const [turnCount, setTurnCount] = useState<number>(0);

  const moveTimeoutRef = useRef<number>();
  const gemSound = useRef(new Audio('/assets/sounds/gemSound.mp3'));
  const bombSound = useRef(new Audio('/assets/sounds/bombSound.mp3'));

  // Handle game message updates
  const handleGameMessage = useCallback((message: GameMessage) => {
    if ('GameUpdate' in message) {
      const newGameState = message.GameUpdate;
      setGameState(newGameState ?? null);
      
      if (newGameState) {
        // Clear existing timeout
        if (moveTimeoutRef.current) {
          clearTimeout(moveTimeoutRef.current);
        }

        // Set timeouts based on game state
        if ('RUNNING' in newGameState) {
          moveTimeoutRef.current = window.setTimeout(() => {
            setTurnCount((prevCount) => {
              let abort = true;
              if (prevCount > 0) {
                abort = false;
              }
              sendMessage({
                Stop: {
                  game_id: newGameState.RUNNING.game_id,
                  abort: abort,
                },
              });
              return prevCount;
            });
          }, MOVE_TIMEOUT);
        } else if ('WAITING' in newGameState) {
          moveTimeoutRef.current = window.setTimeout(() => {
            sendMessage({
              Stop: {
                game_id: newGameState.WAITING.game_id,
                abort: true,
              },
            });
            setGameState(null);
            setRevealedCells(new Set());
            setError('Game aborted due to inactivity.');
          }, MOVE_TIMEOUT);
        }

        // Update revealed cells
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
  }, []);

  const { sendMessage, isConnected } = useWebSocket({
    onMessage: handleGameMessage,
    onError: setError,
  });

  useEffect(() => {
    return () => {
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
    };
  }, []);

  const handleMove = useCallback((x: number, y: number) => {
    if (!gameState) return;

    if (moveTimeoutRef.current) {
      clearTimeout(moveTimeoutRef.current);
    }

    const board = 'RUNNING' in gameState ? gameState.RUNNING.board :
               'WAITING' in gameState ? gameState.WAITING.board :
               'FINISHED' in gameState ? gameState.FINISHED.board : undefined;

    if (!board) return;

    const currentGameId = 'RUNNING' in gameState ? gameState.RUNNING.game_id :
                       'WAITING' in gameState ? gameState.WAITING.game_id :
                       'FINISHED' in gameState ? gameState.FINISHED.game_id : '';

    sendMessage({
      MakeMove: {
        game_id: currentGameId,
        x,
        y,
      },
    });

    setTurnCount(prev => prev + 1);

    if ('RUNNING' in gameState) {
      moveTimeoutRef.current = window.setTimeout(() => {
        sendMessage({
          Stop: {
            game_id: currentGameId,
            abort: false,
          },
        });
      }, MOVE_TIMEOUT);
    }
  }, [gameState, sendMessage]);

  const playGame = useCallback(() => {
    if (!userData?.id) return;
    setRevealedCells(new Set());
    setTurnCount(0);

    sendMessage({
      Play: {
        player_id: userData.id.toString(),
        single_bet_size: betAmount,
      },
    });
  }, [userData, betAmount, sendMessage]);

  const playAgain = useCallback(() => {
    setGameState(null);
    setRevealedCells(new Set());
    setError('');
    setBetAmount(0);
    setTurnCount(0);
  }, []);

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
          <BetInput
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            playGame={playGame}
            isConnected={isConnected}
          />
        )}

        <GameStatus 
          gameState={gameState} 
          userData={userData} 
        />

        <GameBoard
          gameState={gameState}
          userData={userData}
          revealedCells={revealedCells}
          onMove={handleMove}
          gemSound={gemSound}
          bombSound={bombSound}
        />

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