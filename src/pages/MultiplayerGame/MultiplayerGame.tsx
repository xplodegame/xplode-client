import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import useWebSocket from '../../hooks/useWebSocket';
import { useParticles } from '../../components/GameComponents/Background/GameBackgroundParticles';
import GameBoard from '../../components/GameComponents/GameBoard/GameBoard';
import GameStatus from '../../components/GameComponents/GameStatus/GameStatus';
import LobbyDetails from '../../components/GameComponents/LobbyDetails/LobbyDetails';
import CountdownTimer from '../../components/GameComponents/CountdownTimer/CountdownTimer';
import MatchmakingAnimation from '../../components/GameComponents/MatchmakingAnimation/MatchmakingAnimation'
import { GameState, GameMessage } from '../../types/gameTypes';
import { useWalletStore } from '../../stores/walletStore';

const MOVE_TIMEOUT = 30000; // 30 seconds
const LOCK_PHASE_TIMEOUT = 10000; // 30 seconds

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
  const [, setTurnCount] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [betAmount, setBetAmount] = useState<number>(0);
  const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set());
  const [lockedCells, setLockedCells] = useState<Set<string>>(new Set());
  const [isLockPhase, setIsLockPhase] = useState<boolean>(false);
  const [locksRemaining, setLocksRemaining] = useState<number>(0);
  const previousTurnIdxRef = useRef<number>(-1);
  const [currentPlayerLockedCells, setCurrentPlayerLockedCells] = useState<Set<string>>(new Set());
  const [moveEndTime, setMoveEndTime] = useState<number>(0);
  const [lockEndTime, setLockEndTime] = useState<number>(0);
  const setBalance = useWalletStore(state => state.setBalance);

  const moveTimeoutRef = useRef<number>();
  const lockTimeoutRef = useRef<number>();
  const locksRemainingRef = useRef<number>(0);

  const gemSound = useRef(new Audio('/assets/sounds/gemSound.mp3'));
  const bombSound = useRef(new Audio('/assets/sounds/bombSound.mp3'));
  const lockSound = useRef(new Audio('/assets/sounds/lockSound.wav'));

  const ParticlesComponent = useParticles();

  const userDataRef = useRef(userData);

  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  const [matchmakingParams, setMatchmakingParams] = useState<{
    gridSize: number;
    bombs: number;
    betAmount: number;
  } | null>(null);

  const calculateMaxLocks = useCallback((gameState: GameState) => {
    if (!('RUNNING' in gameState)) {
      console.error('Cannot calculate locks: Not in RUNNING state');
      return 0;
    }
  
    const board = gameState.RUNNING.board;
    const gridSize = board.grid.length;
    const maxPossibleLocks = gridSize * 2;
    
    // Count unopened cells
    let unopenedCells = 0;
    board.grid.forEach((row) => {
      row.forEach((cell) => {
        if (cell !== 'Revealed' && cell !== 'Mined') {
          unopenedCells++;
        }
      });
    });
  
    let calculatedLocks;
    if (unopenedCells > maxPossibleLocks + 1) {
      calculatedLocks = maxPossibleLocks;
    } else {
      calculatedLocks = Math.max(0, unopenedCells - 2); // Ensure non-negative
    }
  
    // console.group('Lock Calculation Debug');
    // console.log(`Grid Size: ${gridSize}`);
    // console.log(`Total Cells: ${gridSize * gridSize}`);
    // console.log(`Unopened Cells: ${unopenedCells}`);
    // console.log(`Max Possible Locks: ${maxPossibleLocks}`);
    // console.log(`Calculated Locks: ${calculatedLocks}`);
    // console.groupEnd();
  
    return calculatedLocks;
  }, []);
  

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
      
      // Clear matchmaking parameters when game state changes from WAITING
      if (newGameState && ('RUNNING' in newGameState || 'FINISHED' in newGameState)) {
        setMatchmakingParams(null);
      }
      
      if (newGameState) {
        if (moveTimeoutRef.current) {
          clearTimeout(moveTimeoutRef.current);
        }
  
        if ('RUNNING' in newGameState) {
          const currentUserData = userDataRef.current;
          const currentTurnIdx = newGameState.RUNNING.turn_idx;
          const currentPlayer = newGameState.RUNNING.players[currentTurnIdx];
          const isCurrentPlayerTurn = currentPlayer.id === currentUserData?.id?.toString();

          if (isCurrentPlayerTurn) {
            // Recalculate max locks ONLY if the turn has changed
            if (previousTurnIdxRef.current !== currentTurnIdx) {
              const maxLocks = calculateMaxLocks(newGameState);
              locksRemainingRef.current = maxLocks;
              setLocksRemaining(maxLocks);
              previousTurnIdxRef.current = currentTurnIdx; // Update ref
            }

            setMoveEndTime(Date.now() + MOVE_TIMEOUT);
          } else {
            setMoveEndTime(0);
            previousTurnIdxRef.current = -1; // Reset for non-current players
          }        

          moveTimeoutRef.current = window.setTimeout(() => {
            setTurnCount((prevCount) => {
              const abort = prevCount === 0;
              sendMessage({
                Stop: {
                  game_id: newGameState.RUNNING.game_id,
                  abort,
                },
              });
              return prevCount;
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
            const currentUserData = userDataRef.current;
            try {
              const newUserData = {
                privy_id: currentUserData?.privy_id,
                email: currentUserData?.email,
                name: currentUserData?.name || '',
              };

              const userDetailsResponse = await fetch(import.meta.env.VITE_USER_DETAILS_ENDPOINT_URL, {
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
  }, [calculateMaxLocks]);

  const { sendMessage, isConnected, isRedirecting } = useWebSocket({
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
    setTurnCount(prev => prev + 1);
    setIsLockPhase(true);
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
    if (!gameState || !('RUNNING' in gameState)) {
      console.error('Cannot lock: Invalid game state');
      return;
    }

    // Strict lock check
    if (locksRemainingRef.current <= 0) {
      console.error('No locks remaining');
      return;
    }

    const cellKey = `${x}-${y}`;
    
    // Prevent locking revealed or already locked cells
    if (revealedCells.has(cellKey) || lockedCells.has(cellKey)) {
      console.error(`Cannot lock cell ${cellKey}: Already revealed or locked`);
      return;
    }

    // Decrement locks
    locksRemainingRef.current -= 1;
    setLocksRemaining(locksRemainingRef.current);

    // console.group('Lock Action Debug');
    // console.log(`Locking cell: ${cellKey}`);
    // console.log(`Locks remaining: ${locksRemainingRef.current}`);
    // console.groupEnd();

    // Update locked cells
    setCurrentPlayerLockedCells(prev => {
      const updated = new Set(prev);
      updated.add(cellKey);
      return updated;
    });

    // Play lock sound
    lockSound.current.play().catch(console.error);

    // Send lock message to server
    sendMessage({
      Lock: {
        game_id: gameState.RUNNING.game_id,
        x,
        y,
      },
    });

    // Check if lock phase should complete
    if (locksRemainingRef.current === 0) {
      // console.log('Lock phase completed - no more locks');
      
      // Clear lock timeout
      if (lockTimeoutRef.current) {
        clearTimeout(lockTimeoutRef.current);
      }

      // Send lock complete message
      sendMessage({
        LockComplete: {
          game_id: gameState.RUNNING.game_id,
        },
      });

      // Reset lock phase
      setIsLockPhase(false);
      setLockEndTime(0);
    }
  }, [gameState, sendMessage, revealedCells, lockedCells]);

  const resetGameState = useCallback(() => {
    setGameState(null);
    setRevealedCells(new Set());
    setLockedCells(new Set());
    setIsLockPhase(false);
    // setLocksRemaining(MAX_LOCKS);
    setCurrentPlayerLockedCells(new Set());
    setError('');
    setBetAmount(0);
    setMoveEndTime(0);
    setLockEndTime(0);
    setTurnCount(0);
  }, []);

  const playGame = useCallback((gridSize: number, bombs: number, minPlayers: number) => {
    if (!userData?.id) return;
    resetGameState();
  
    // Store matchmaking parameters
    setMatchmakingParams({ gridSize, bombs, betAmount });

    sendMessage({
      Play: {
        player_id: userData.id.toString(),
        single_bet_size: betAmount,
        grid: gridSize,
        bombs,
        min_players: minPlayers
      },
    });
  }, [userData, betAmount, sendMessage, resetGameState]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white p-4">

      {/* Matchmaking overlay */}
      {matchmakingParams && (
        <MatchmakingAnimation 
          gridSize={matchmakingParams.gridSize}
          bombs={matchmakingParams.bombs}
          betAmount={matchmakingParams.betAmount}
        />
      )}

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
        {!isConnected && !isRedirecting && (
          <div className="text-zinc-400 text-sm mt-6 flex items-center justify-center space-x-2">
            <Loader2 className="animate-spin" size={16} />
            <span>Reconnecting...</span>
          </div>
        )}

        {isRedirecting && (
          <div className="text-emerald-400 text-sm mt-6 flex items-center justify-center space-x-2">
            <Loader2 className="animate-spin" size={16} />
            <span>Connecting to optimal game server...</span>
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