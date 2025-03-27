import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, ChevronRight } from 'lucide-react';
import { GameState } from '../../../types/gameTypes';

interface CurrentTurnIndicatorProps {
  gameState: GameState | null;
  userData?: { 
    privy_id: string; 
    email: string; 
    name: string; 
    wallet_balance?: number;
    id?: number;
  };
  isLockPhase: boolean;
}

const CurrentTurnIndicator: React.FC<CurrentTurnIndicatorProps> = ({ 
  gameState, 
  userData,
  isLockPhase
}) => {
  const [pulseEffect, setPulseEffect] = useState(false);
  
  // Alternate the pulse effect every 2 seconds
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
            ${isCurrentPlayerTurn 
              ? "bg-emerald-500/10 border border-emerald-500/30" 
              : "bg-gray-900/80 border border-white/10"}
          `}>
            {/* Background glow effect */}
            <motion.div 
              className={`absolute inset-0 blur-xl rounded-xl opacity-30 ${isCurrentPlayerTurn ? "bg-emerald-500" : "bg-blue-500"}`}
              animate={{ 
                opacity: pulseEffect ? 0.4 : 0.2,
                scale: pulseEffect ? 1.05 : 1
              }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Turn indicator icon */}
                <motion.div 
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full
                    ${isCurrentPlayerTurn 
                      ? "bg-emerald-500/20 text-emerald-400" 
                      : "bg-blue-500/20 text-blue-400"}
                  `}
                  animate={{ 
                    scale: pulseEffect ? 1.1 : 1,
                    rotate: isLockPhase ? [0, 15, 0, -15, 0] : 0
                  }}
                  transition={{ 
                    duration: isLockPhase ? 0.5 : 2,
                    repeat: isLockPhase ? Infinity : 0,
                    repeatType: "loop"
                  }}
                >
                  {isLockPhase 
                    ? <motion.div className="text-lg">🔒</motion.div>
                    : <Clock className="w-5 h-5" />
                  }
                </motion.div>
                
                {/* Current player info */}
                <div className="space-y-1">
                  <div className="text-xs uppercase text-gray-400">
                    {isLockPhase ? "Locking Phase" : "Current Turn"}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`
                      font-bold text-lg
                      ${isCurrentPlayerTurn ? "text-emerald-400" : "text-white"}
                    `}>
                      {currentPlayer.name}
                    </span>
                    {isCurrentPlayerTurn && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400 uppercase">
                        You
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Turn indicator */}
              <div className={`
                px-3 py-1 rounded-lg text-sm font-medium
                ${isCurrentPlayerTurn 
                  ? "bg-emerald-500/20 text-emerald-400" 
                  : "bg-gray-800 text-gray-400"}
              `}>
                {isLockPhase ? "Locking" : "Moving"}
              </div>
            </div>
          </div>
          
          {/* Player roster */}
          <div className="mt-2 grid grid-cols-1 gap-2">
            {players.length > 1 && (
              <div className="text-xs uppercase text-gray-500 ml-2">Players</div>
            )}
            <div className="flex flex-wrap gap-2">
              {playerNames.map((player) => (
                <div 
                  key={player.id}
                  className={`
                    flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm
                    ${player.isCurrent 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" 
                      : "bg-gray-800/50 text-gray-300 border border-white/5"}
                  `}
                >
                  {player.isCurrent && (
                    <motion.div
                      animate={{ x: [0, 3, 0] }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "reverse"
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

export default React.memo(CurrentTurnIndicator);