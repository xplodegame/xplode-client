import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, Player } from '../../../types/gameTypes';

interface RematchDialogProps {
  gameState: GameState | null;
  userData?: Player;
  onAccept: () => void;
  onDecline: () => void;
  isRequesting: boolean;
  onRequestRematch: () => void;
  rematchRequest: { game_id: string; requester_id: string } | null;
  playerHasSufficientFunds: boolean;
  betAmount: number;
}

const RematchDialog: React.FC<RematchDialogProps> = ({
  gameState,
  userData,
  onAccept,
  onDecline,
  rematchRequest,
  playerHasSufficientFunds,
  betAmount,
}) => {
  const notificationSound = useRef(new Audio('/assets/sounds/notification.mp3'));
  
  // Play notification sound when rematch request is received
  useEffect(() => {
    if (rematchRequest && userData?.id?.toString() !== rematchRequest.requester_id) {
      notificationSound.current.play().catch(console.error);
    }
  }, [rematchRequest, userData]);
  
  if (!gameState || !userData) return null;

  // Show different UI based on game state
  const isFinishedState = 'FINISHED' in gameState;
  const isRematchState = 'REMATCH' in gameState;
  
  // Only show in FINISHED or REMATCH states
  if (!isFinishedState && !isRematchState) return null;
  
  // Don't show rematch button if we're already in REMATCH state
  if (isRematchState && !rematchRequest) return null;

  const players = isFinishedState ? gameState.FINISHED.players : gameState.REMATCH.players;
  const acceptedPlayers = isRematchState ? gameState.REMATCH.accepted : [];

  const currentPlayerIndex = players.findIndex(p => p.id?.toString() === userData.id?.toString());
  const hasAccepted = isRematchState && currentPlayerIndex !== -1 && acceptedPlayers[currentPlayerIndex] === 1;
  
  // Don't show the request dialog to the player who made the request
  const isRequester = rematchRequest && rematchRequest.requester_id === userData.id?.toString();

  // Reusable cosmic particles component
  const CosmicParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div 
        className="absolute w-2 h-2 rounded-full bg-emerald-400/80"
        initial={{ x: "20%", y: "10%" }}
        animate={{ 
          x: ["20%", "30%", "20%"],
          y: ["10%", "15%", "10%"],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute w-1.5 h-1.5 rounded-full bg-teal-400/60"
        initial={{ x: "70%", y: "30%" }}
        animate={{ 
          x: ["70%", "75%", "70%"],
          y: ["30%", "25%", "30%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute w-1 h-1 rounded-full bg-emerald-500/40"
        initial={{ x: "40%", y: "60%" }}
        animate={{ 
          x: ["40%", "45%", "40%"],
          y: ["60%", "65%", "60%"],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );

  return (
    <AnimatePresence>
      {/* Rematch Dialog (shown to other players when someone requests a rematch) */}
      {rematchRequest && !isRequester && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          {/* Cosmic backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-md mx-4 overflow-hidden rounded-xl bg-gradient-to-b from-zinc-900 to-black border border-white/10"
          >
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/30 to-emerald-500/0 rounded-3xl blur-xl opacity-50" />
            
            {/* Cosmic particle effects */}
            <CosmicParticles />

            <div className="relative p-6 space-y-5">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 mb-4 relative">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 bg-emerald-500/30 rounded-full"></div>
                  <div className="absolute inset-4 bg-emerald-400/40 rounded-full transform animate-ping opacity-75"></div>
                  <div className="absolute inset-6 bg-emerald-300/50 rounded-full"></div>
                </div>

                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  Cosmic Rematch Challenge
                </h2>
                
                <p className="text-zinc-300 mt-2 text-center leading-relaxed">
                  <span className="text-emerald-400 font-medium">
                    {players.find(p => p.id?.toString() === rematchRequest.requester_id)?.name || 'A cosmic explorer'}
                  </span>{' '}
                  invites you to a rematch among the stars! Ready for another cosmic duel?
                </p>
              </div>

              {/* Add insufficient funds warning */}
              {!playerHasSufficientFunds && (
                <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 mt-2">
                  <p className="text-red-300 text-sm text-center">
                    <span className="block font-semibold">Insufficient Funds Alert</span>
                    You need {betAmount.toFixed(2)} SOL to join this cosmic adventure.
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <motion.button
                  onClick={onAccept}
                  disabled={!playerHasSufficientFunds}
                  whileHover={playerHasSufficientFunds ? { scale: 1.03, boxShadow: "0 0 15px rgba(16, 185, 129, 0.5)" } : {}}
                  whileTap={playerHasSufficientFunds ? { scale: 0.97 } : {}}
                  className={`flex-1 py-3 rounded-lg font-medium ${
                    playerHasSufficientFunds
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-600/20 border border-emerald-500/50"
                      : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
                  }`}
                >
                  Accept Rematch
                </motion.button>
                <motion.button
                  onClick={onDecline}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-3 rounded-lg font-medium bg-zinc-800/80 border border-zinc-700 text-zinc-300 hover:bg-zinc-700/80 transition-colors"
                >
                  Decline
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Rematch Status Dialog (shown to all players during REMATCH state) */}
      {isRematchState && !rematchRequest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          {/* Cosmic backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-md mx-4 overflow-hidden rounded-xl bg-gradient-to-b from-zinc-900 to-black border border-white/10"
          >
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/30 to-emerald-500/0 rounded-3xl blur-xl opacity-50" />
            
            {/* Cosmic particle effects */}
            <CosmicParticles />

            <div className="relative p-6 space-y-5">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mb-1">
                  Rematch Fleet Status
                </h2>
                <p className="text-zinc-400 mb-4">Preparing crews for the cosmic rematch</p>
              </div>

              <div className="space-y-3 bg-black/30 rounded-lg p-4 border border-emerald-500/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-emerald-400">Explorer</span>
                  <span className="text-sm font-medium text-emerald-400">Rematch Status</span>
                </div>
                {players.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between rounded-md overflow-hidden">
                    <div className="flex items-center space-x-2 flex-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                        <span className="text-xs text-emerald-400 font-bold">{player.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="text-zinc-200">{player.name}</span>
                    </div>
                    <div className="flex items-center">
                      {acceptedPlayers[index] === 1 ? (
                        <div className="flex items-center space-x-1 bg-emerald-500/20 px-3 py-1 rounded-full">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span className="text-xs text-emerald-400">Ready</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 bg-zinc-800/50 px-3 py-1 rounded-full">
                          <span className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse"></span>
                          <span className="text-xs text-zinc-400">Awaiting</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add insufficient funds warning when applicable */}
              {!playerHasSufficientFunds && !hasAccepted && (
                <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 mt-2">
                  <p className="text-red-300 text-sm text-center">
                    <span className="block font-semibold">Insufficient Funds Alert</span>
                    You need {betAmount.toFixed(2)} SOL to join this cosmic adventure.
                  </p>
                </div>
              )}

              {!hasAccepted && (
                <div className="flex gap-3 mt-4">
                  <motion.button
                    onClick={onAccept}
                    disabled={!playerHasSufficientFunds}
                    whileHover={playerHasSufficientFunds ? { scale: 1.03, boxShadow: "0 0 15px rgba(16, 185, 129, 0.5)" } : {}}
                    whileTap={playerHasSufficientFunds ? { scale: 0.97 } : {}}
                    className={`flex-1 py-3 rounded-lg font-medium ${
                      playerHasSufficientFunds
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-600/20 border border-emerald-500/50"
                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
                    }`}
                  >
                    Ready for Rematch
                  </motion.button>
                  <motion.button
                    onClick={onDecline}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 rounded-lg font-medium bg-zinc-800/80 border border-zinc-700 text-zinc-300 hover:bg-zinc-700/80 transition-colors"
                  >
                    Abort Mission
                  </motion.button>
                </div>
              )}
              
              {hasAccepted && (
                <div className="bg-black/30 rounded-lg p-4 border border-emerald-500/20 mt-4">
                  <div className="flex items-center justify-center">
                    <div className="mr-3 relative">
                      <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping absolute"></div>
                      <div className="w-4 h-4 bg-emerald-500 rounded-full relative"></div>
                    </div>
                    <p className="text-emerald-400">You're ready! Waiting for other crew members...</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Waiting Dialog (shown to the requester) */}
      {rematchRequest && isRequester && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          {/* Cosmic backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-md mx-4 overflow-hidden rounded-xl bg-gradient-to-b from-zinc-900 to-black border border-white/10"
          >
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/30 to-emerald-500/0 rounded-3xl blur-xl opacity-50" />
            
            {/* Cosmic particle effects */}
            <CosmicParticles />

            <div className="relative p-6 space-y-5">
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mb-4">
                  Rematch Signal Transmitted
                </h2>

                {/* Cosmic Radar Animation */}
                <div className="w-20 h-20 relative mb-5">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20"></div>
                  <div className="absolute inset-2 rounded-full border-4 border-emerald-500/30 animate-ping opacity-75"></div>
                  <div className="absolute inset-4 rounded-full border-4 border-emerald-500/40"></div>
                  <div className="absolute inset-6 rounded-full border-4 border-emerald-500/50"></div>
                  <div className="absolute inset-8 rounded-full bg-emerald-500/60"></div>
                  
                  {/* Radar Sweep */}
                  <motion.div 
                    className="absolute inset-0 origin-center"
                    animate={{ rotate: 360 }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "linear"
                    }}
                  >
                    <div className="w-full h-0.5 bg-gradient-to-r from-emerald-500 to-transparent absolute top-1/2 left-0 transform -translate-y-1/2"></div>
                  </motion.div>
                </div>
                
                <p className="text-zinc-300 text-center leading-relaxed">
                  Your rematch challenge has been broadcast across the cosmos.
                  <span className="block text-emerald-400 mt-1">
                    Awaiting response from other star voyagers...
                  </span>
                </p>
              </div>

              <motion.button
                onClick={onDecline}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 mt-4 rounded-lg font-medium bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                Cancel Transmission
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RematchDialog;
