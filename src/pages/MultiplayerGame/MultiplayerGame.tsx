import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import useWebSocket from '../../hooks/useWebSocket';
import { useParticles } from '../../components/GameComponents/Background/GameBackgroundParticles';
import GameBoard from '../../components/GameComponents/GameBoard/GameBoard';
import GameStatus from '../../components/GameComponents/GameStatus/GameStatus';
import LobbyDetails from '../../components/GameComponents/LobbyDetails/LobbyDetails';
import CountdownTimer from '../../components/GameComponents/CountdownTimer/CountdownTimer';
import { GameState, GameMessage } from '../../types/gameTypes';
import { useWalletStore } from '../../stores/walletStore';

const MOVE_TIMEOUT = 30000; // 30 
const MAX_LOCKS = 3;
const LOCK_PHASE_TIMEOUT = 5000; // 5 seconds

interface MultiplayerGameProps {
  userData?: { 
    privy_id: string; 
    email: string; 
    name: string; 
    wallet_balance: number;
    id?: number;
    deposit_address?: string;
  };
}


const MultiplayerGame: React.FC<MultiplayerGameProps> = ({ userData }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [movesPlayed, setMovesPlayed] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [betAmount, setBetAmount] = useState<number>(0);
  const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set());
  const [lockedCells, setLockedCells] = useState<Set<string>>(new Set());
  const [isLockPhase, setIsLockPhase] = useState<boolean>(false);
  const [locksRemaining, setLocksRemaining] = useState<number>(MAX_LOCKS);
  const [currentPlayerLockedCells, setCurrentPlayerLockedCells] = useState<Set<string>>(new Set());
  const [moveEndTime, setMoveEndTime] = useState<number>(0);
  const [lockEndTime, setLockEndTime] = useState<number>(0);
  const setBalance = useWalletStore(state => state.setBalance);

  const moveTimeoutRef = useRef<number>();
  const lockTimeoutRef = useRef<number>();
  const gemSound = useRef(new Audio('/assets/sounds/gemSound.mp3'));
  const bombSound = useRef(new Audio('/assets/sounds/bombSound.mp3'));
  const lockSound = useRef(new Audio('/assets/sounds/lockSound.wav'));

  const ParticlesComponent = useParticles();

  const handleGameMessage = useCallback((message: GameMessage) => {
    if (typeof message === "string") {
      if (message === "Pong") {
        console.log("Received pong from server");
        return;
      }
      return;
    }
  
    if ('GameUpdate' in message) {
      const newGameState = message.GameUpdate;
      setGameState(newGameState ?? null);
      
      if (newGameState) {
        if (moveTimeoutRef.current) {
          clearTimeout(moveTimeoutRef.current);
        }
  
        if ('RUNNING' in newGameState) {
          const currentPlayer = newGameState.RUNNING.players[newGameState.RUNNING.turn_idx];
          const isCurrentPlayerTurn = currentPlayer.id === userData?.id?.toString();
          
          if (isCurrentPlayerTurn) {
            setMoveEndTime(Date.now() + MOVE_TIMEOUT);
          } else {
            setMoveEndTime(0);
          }

          moveTimeoutRef.current = window.setTimeout(() => {
            sendMessage({
              Stop: {
                game_id: newGameState.RUNNING.game_id,
                abort: movesPlayed === 0,
              },
            });
          }, MOVE_TIMEOUT);

          // Update locked cells
          const newLockedCells = new Set<string>();
          if (newGameState.RUNNING.locks) {
            newGameState.RUNNING.locks.forEach((lock: [number, number]) => {
              newLockedCells.add(`${lock[0]}-${lock[1]}`);
            });
          }
          setLockedCells(newLockedCells);

          // Update revealed cells
          const newRevealedCells = new Set<string>();
          const board = newGameState.RUNNING.board;
          board.grid.forEach((row, x) => {
            row.forEach((cell, y) => {
              if (cell === 'Mined' || cell === 'Revealed') {
                newRevealedCells.add(`${x}-${y}`);
              }
            });
          });
          setRevealedCells(newRevealedCells);

          // Reset lock phase for non-current players
          if (!isCurrentPlayerTurn) {
            setIsLockPhase(false);
            setLocksRemaining(MAX_LOCKS);
            setCurrentPlayerLockedCells(new Set());
            setLockEndTime(0);
            if (lockTimeoutRef.current) {
              clearTimeout(lockTimeoutRef.current);
            }
          }
        } else if ('WAITING' in newGameState) {
          moveTimeoutRef.current = window.setTimeout(() => {
            sendMessage({
              Stop: {
                game_id: newGameState.WAITING.game_id,
                abort: true,
              },
            });
            resetGameState();
            setError('Game aborted due to inactivity.');
          }, MOVE_TIMEOUT);
        } else if ('FINISHED' in newGameState) {
          // Handle finished state
          const newRevealedCells = new Set<string>();
          const board = newGameState.FINISHED.board;
          board.grid.forEach((row, x) => {
            row.forEach((cell, y) => {
              if (cell === 'Mined' || cell === 'Revealed') {
                newRevealedCells.add(`${x}-${y}`);
              }
            });
          });
          setRevealedCells(newRevealedCells);

          // Create a separate async function for the API call
          const updateUserBalance = async () => {
            try {
              const newUserData = {
                privy_id: userData?.privy_id,
                email: userData?.email,
                name: userData?.name || '',
              };

              const userDetailsResponse = await fetch('https://mines-browser-wallet007.fly.dev/user-details', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUserData),
              });

              if (!userDetailsResponse.ok) {
                throw new Error(`HTTP error! status: ${userDetailsResponse.status}`);
              }

              const userDetailsData = await userDetailsResponse.json();
              console.log("########: ", userDetailsData.balance);

              // Update the global store
              setBalance(userDetailsData.balance);
            } catch (error) {
              console.error('Failed to update user balance:', error);
            }
          };

          // Call the async function
          updateUserBalance();
        }
      }
    } else if ('Error' in message) {
      setError(typeof message.Error === 'string' ? message.Error : 'An error occurred');
    }
  }, [userData?.id]);

  const { sendMessage, isConnected } = useWebSocket({
    onMessage: handleGameMessage,
    onError: setError,
    gameState
  });

  useEffect(() => {
    return () => {
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
      if (lockTimeoutRef.current) {
        clearTimeout(lockTimeoutRef.current);
      }
    };
  }, []);

  const handleMove = useCallback((x: number, y: number) => {
    if (!gameState || !('RUNNING' in gameState)) return;

    if (moveTimeoutRef.current) {
      clearTimeout(moveTimeoutRef.current);
    }

    sendMessage({
      MakeMove: {
        game_id: gameState.RUNNING.game_id,
        x,
        y,
      },
    });
    
    const cellIndex = x * gameState.RUNNING.board.grid.length + y;
    if (gameState.RUNNING.board.bomb_coordinates.includes(cellIndex)) {
        bombSound.current.play().catch(() => {
            console.error("Failed to play bomb sound.");
        });
    } else {
        gemSound.current.play().catch(() => {});
    }
    setMovesPlayed(prev => prev + 1);
    setIsLockPhase(true);
    setLocksRemaining(MAX_LOCKS);
    setCurrentPlayerLockedCells(new Set());
    setLockEndTime(Date.now() + LOCK_PHASE_TIMEOUT);

    lockTimeoutRef.current = window.setTimeout(() => {
      sendMessage({
        LockComplete: {
          game_id: gameState.RUNNING.game_id,
        },
      });
      setIsLockPhase(false);
      setLockEndTime(0);
    }, LOCK_PHASE_TIMEOUT);
  }, [gameState, sendMessage]);

  const handleLock = useCallback((x: number, y: number) => {
    if (!gameState || !('RUNNING' in gameState) || locksRemaining <= 0) return;

    const cellKey = `${x}-${y}`;
    if (!revealedCells.has(cellKey) && !lockedCells.has(cellKey)) {
      setCurrentPlayerLockedCells(prev => new Set([...prev, cellKey]));
      setLocksRemaining(prev => prev - 1);
      lockSound.current.play().catch(() => {});

      sendMessage({
        Lock: {
          game_id: gameState.RUNNING.game_id,
          x,
          y,
        },
      });

      if (locksRemaining === 1) {
        if (lockTimeoutRef.current) {
          clearTimeout(lockTimeoutRef.current);
        }
        sendMessage({
          LockComplete: {
            game_id: gameState.RUNNING.game_id,
          },
        });
        setIsLockPhase(false);
        setLockEndTime(0);
      }
    }
  }, [gameState, sendMessage, locksRemaining, revealedCells, lockedCells]);

  const resetGameState = useCallback(() => {
    setGameState(null);
    setRevealedCells(new Set());
    setLockedCells(new Set());
    setIsLockPhase(false);
    setLocksRemaining(MAX_LOCKS);
    setCurrentPlayerLockedCells(new Set());
    setError('');
    setBetAmount(0);
    setMoveEndTime(0);
    setLockEndTime(0);
    setMovesPlayed(0);
  }, []);

  const playGame = useCallback((grid: number, bombs: number, minPlayers: number) => {
    if (!userData?.id) return;
    resetGameState();
  
    sendMessage({
      Play: {
        player_id: userData.id.toString(),
        single_bet_size: betAmount,
        grid,
        bombs,
        min_players: minPlayers
      },
    });
  }, [userData, betAmount, sendMessage, resetGameState]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white p-4">
      {ParticlesComponent}
      
      <div className="relative w-full max-w-md z-10">
        <h1 className="text-3xl font-bold mb-12 text-center bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent invisible">Diamond Hunters</h1>

        {error && (
          <div className="text-red-400 text-sm mb-6 bg-red-950/30 border border-red-900/50 rounded-lg p-3">
            {error}
          </div>
        )}

        {(!gameState || 'ABORTED' in gameState) && (
          <LobbyDetails
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            playGame={playGame}
            isConnected={isConnected}
          />
        )}

        {gameState && 'RUNNING' in gameState && (
          <div className="mb-4 flex justify-center space-x-4">
            <CountdownTimer
              endTime={moveEndTime}
              isActive={moveEndTime > 0 && !isLockPhase}
              className="text-yellow-400"
            />
            <CountdownTimer
              endTime={lockEndTime}
              isActive={isLockPhase && lockEndTime > 0}
              className="text-emerald-400"
            />
          </div>
        )}

        <GameStatus 
          gameState={gameState} 
          userData={userData}
          isLockPhase={isLockPhase}
          locksRemaining={locksRemaining}
        />
      </div>

      <div className="relative w-auto z-10">
        <GameBoard
          gameState={gameState}
          userData={userData}
          revealedCells={revealedCells}
          lockedCells={lockedCells}
          currentPlayerLockedCells={currentPlayerLockedCells}
          onMove={handleMove}
          onLock={handleLock}
          isLockPhase={isLockPhase}
          locksRemaining={locksRemaining}
        />
      </div>

      <div className="relative w-full max-w-md z-10">
        {!isConnected && (
          <div className="text-zinc-400 text-sm mt-6 flex items-center justify-center space-x-2">
            <Loader2 className="animate-spin" size={16} />
            <span>Reconnecting...</span>
          </div>
        )}

        {(gameState && ('FINISHED' in gameState || 'ABORTED' in gameState)) && (
          <button
            onClick={resetGameState}
            className="w-full py-3 px-6 mt-6 rounded-lg font-medium transition-all duration-200 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30"
          >
            Play Again
          </button>
        )}
      </div>
    </div>
  );
};

export default MultiplayerGame;