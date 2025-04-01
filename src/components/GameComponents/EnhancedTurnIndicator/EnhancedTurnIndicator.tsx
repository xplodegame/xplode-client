import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, ChevronRight, Shield } from 'lucide-react';
import { GameState } from '../../../types/gameTypes';

interface EnhancedTurnIndicatorProps {
  gameState: GameState | null;
  userData?: { 
    privy_id: string; 
    email: string; 
    name: string; 
    wallet_balance?: number;
    id?: number;
  };
  isLockPhase: boolean;
  moveEndTime: number;
  lockEndTime: number;
}

const EnhancedTurnIndicator: React.FC<EnhancedTurnIndicatorProps> = ({ 
  gameState, 
  userData,
  isLockPhase,
  moveEndTime,
  lockEndTime
}) => {
  const [pulseEffect, setPulseEffect] = useState(false);
  const [moveTimeLeft, setMoveTimeLeft] = useState(0);
  const [lockTimeLeft, setLockTimeLeft] = useState(0);
  
  const [, setShowWarning] = useState(false);
  // console.log("Show warning", showWarning);
  
  
  // Calculate time remaining for timers
  useEffect(() => {
    if (!gameState || !('RUNNING' in gameState)) return;
    
    const calculateTimeLeft = () => {
      const now = Date.now();
      
      // Calculate move time
      if (moveEndTime > 0 && !isLockPhase) {
        const moveRemaining = Math.max(0, Math.ceil((moveEndTime - now) / 1000));
        setMoveTimeLeft(moveRemaining);
        // Only show warning during move phase, not locking phase
        setShowWarning(moveRemaining <= 3 && moveRemaining > 0);
      } else {
        setMoveTimeLeft(0);
      }
      
      // Calculate lock time
      if (lockEndTime > 0 && isLockPhase) {
        const lockRemaining = Math.max(0, Math.ceil((lockEndTime - now) / 1000));
        setLockTimeLeft(lockRemaining);
        // Don't show warning during locking phase
        setShowWarning(false);
      } else {
        setLockTimeLeft(0);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 200);
    
    return () => clearInterval(interval);
  }, [gameState, moveEndTime, lockEndTime, isLockPhase]);
  
  // Pulse effect for visual interest
  useEffect(() => {
    if (!gameState || !('RUNNING' in gameState)) return;
    
    const interval = setInterval(() => {
      setPulseEffect(prev => !prev);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [gameState]);
  
  if (!gameState || !userData || !('RUNNING' in gameState)) return null;
  
  const { players, turn_idx } = gameState.RUNNING;
  const currentPlayer = players[turn_idx];
  const isCurrentPlayerTurn = currentPlayer.id === userData.id?.toString();
  
  // Get the active time (either move or lock)
  const activeTime = isLockPhase ? lockTimeLeft : moveTimeLeft;
  const isLowTime = !isLockPhase && activeTime <= 3 && activeTime > 0; // Only show low time warning for move phase
  
  // Get all player names for the roster
  const playerNames = players.map(player => ({
    id: player.id,
    name: player.name,
    isCurrent: player.id === currentPlayer.id,
    isUser: player.id === userData.id?.toString()
  }));
  
  // Sort the roster so the current player is always first
  playerNames.sort((a, b) => {
    if (a.isCurrent) return -1;
    if (b.isCurrent) return 1;
    return 0;
  });
  
  // Use a slightly darker shade of green
  const darkGreen = "bg-emerald-600";
  const darkGreenBorder = "border-emerald-600/50";
  const darkGreenText = "text-emerald-300";
  const darkGreenBg = "bg-emerald-600/10";
  
  return (
    <div className="relative w-full mb-6">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="relative overflow-hidden"
        >
          {/* Main card with current player turn */}
          <div className={`
            relative rounded-xl backdrop-blur-sm p-4
            ${isLowTime
              ? "bg-red-900/20 border border-red-500/40"
              : isCurrentPlayerTurn 
                ? `${darkGreenBg} border ${darkGreenBorder}` 
                : "bg-gray-900/80 border border-white/10"}
            transition-all duration-300
          `}>
            {/* Background glow effect */}
            <motion.div 
              className={`
                absolute inset-0 blur-xl rounded-xl opacity-30
                ${isLowTime
                  ? "bg-red-500"
                  : isCurrentPlayerTurn 
                    ? darkGreen
                    : "bg-blue-500"}
              `}
              animate={{ 
                opacity: isLowTime 
                  ? [0.2, 0.6, 0.2] 
                  : pulseEffect ? 0.4 : 0.2,
                scale: isLowTime 
                  ? [1, 1.1, 1] 
                  : pulseEffect ? 1.05 : 1
              }}
              transition={{ 
                duration: isLowTime ? 0.5 : 2, 
                ease: "easeInOut",
                repeat: isLowTime ? Infinity : 0
              }}
            />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Turn indicator icon with countdown */}
                <div className="relative">
                  <motion.div 
                    className={`
                      flex items-center justify-center w-12 h-12 rounded-full
                      ${isLowTime
                        ? "bg-red-500/30 text-red-300"
                        : isLockPhase
                          ? "bg-yellow-500/20 text-yellow-400"
                          : isCurrentPlayerTurn 
                            ? `${darkGreenBg} ${darkGreenText}` 
                            : "bg-blue-500/20 text-blue-400"}
                    `}
                    animate={{ 
                      scale: isLowTime 
                        ? [1, 1.15, 1]
                        : pulseEffect ? 1.1 : 1,
                      rotate: isLockPhase ? [0, 15, 0, -15, 0] : 0
                    }}
                    transition={{ 
                      duration: isLowTime ? 0.5 : isLockPhase ? 0.5 : 2,
                      repeat: isLowTime || isLockPhase ? Infinity : 0,
                      repeatType: "loop"
                    }}
                  >
                    {isLockPhase 
                      ? <motion.div className="text-xl">🔒</motion.div>
                      : <Clock className="w-6 h-6" />
                    }
                  </motion.div>
                  
                  {/* Countdown circle overlay - always show timer for all players */}
                  {activeTime > 0 && (
                    <svg
                      className="absolute top-0 left-0 w-12 h-12 -rotate-90"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke={isLowTime ? "rgba(239, 68, 68, 0.5)" : "rgba(5, 150, 105, 0.2)"}
                        strokeWidth="2"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke={isLowTime ? "#ef4444" : "#059669"}
                        strokeWidth="2"
                        strokeDasharray="62.83" // 2π × 10 (radius)
                        strokeDashoffset={62.83 * (1 - activeTime / (isLockPhase ? 10 : 60))}
                        strokeLinecap="round"
                        className="transition-all duration-200 ease-linear"
                      />
                    </svg>
                  )}
                </div>
                
                {/* Current player info */}
                <div className="space-y-1">
                  <div className="text-xs uppercase text-gray-400">
                    {isLockPhase ? "LOCKING PHASE" : "CURRENT TURN"}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`
                      font-bold text-lg
                      ${isLowTime
                        ? "text-red-400"
                        : isCurrentPlayerTurn ? darkGreenText : "text-white"}
                    `}>
                      {currentPlayer.name}
                    </span>
                    {isCurrentPlayerTurn && (
                      <span className={`px-2 py-0.5 text-xs rounded-full ${darkGreenBg} ${darkGreenText} uppercase`}>
                        YOU
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Timer and phase indicator - always show timer for all players */}
              <div className="flex flex-col items-end space-y-1">
                {/* Timer display */}
                <motion.div 
                  className={`
                    flex items-center space-x-1 px-3 py-1 rounded-lg text-lg font-mono
                    ${isLowTime
                      ? "bg-red-500/30 text-red-300"
                      : isLockPhase
                        ? "bg-yellow-500/20 text-yellow-400"
                        : `${darkGreenBg} ${darkGreenText}`}
                  `}
                  animate={{
                    scale: isLowTime ? [1, 1.1, 1] : 1
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: isLowTime ? Infinity : 0
                  }}
                >
                  <span>{activeTime}s</span>
                </motion.div>
                
                {/* Phase indicator */}
                <div className={`
                  px-3 py-1 rounded-lg text-xs uppercase font-medium
                  ${isLockPhase 
                    ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30" 
                    : `${darkGreenBg} ${darkGreenText} border ${darkGreenBorder}`}
                `}>
                  {isLockPhase ? "LOCKING" : "MOVING"}
                </div>
              </div>
            </div>
            
            {/* Warning message - only show during move phase for current player */}
            <AnimatePresence>
              {isLowTime && isCurrentPlayerTurn && !isLockPhase && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 flex items-center space-x-2 text-red-400 text-sm"
                >
                  <Shield className="w-4 h-4 animate-pulse" />
                  <span>Time running out! Make your move now!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Player roster */}
          <div className="mt-2 grid grid-cols-1 gap-2">
            {players.length > 1 && (
              <div className="text-xs uppercase text-gray-500 ml-2">PLAYERS</div>
            )}
            <div className="flex flex-wrap gap-2">
              {playerNames.map((player) => (
                <div 
                  key={player.id}
                  className={`
                    flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm
                    ${player.isCurrent 
                      ? isLowTime && !isLockPhase
                        ? "bg-red-500/10 text-red-400 border border-red-500/30"
                        : `${darkGreenBg} ${darkGreenText} border ${darkGreenBorder}` 
                      : "bg-gray-800/50 text-gray-300 border border-white/5"}
                  `}
                >
                  {player.isCurrent && (
                    <motion.div
                      animate={{ 
                        x: isLowTime && !isLockPhase ? [0, 4, 0] : [0, 3, 0],
                        transition: {
                          duration: isLowTime && !isLockPhase ? 0.5 : 1.5,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }
                      }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  )}
                  <User className="w-3.5 h-3.5 opacity-70" />
                  <span>{player.name}</span>
                  {player.isUser && !player.isCurrent && (
                    <span className="text-xs text-gray-400">(You)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default React.memo(EnhancedTurnIndicator);