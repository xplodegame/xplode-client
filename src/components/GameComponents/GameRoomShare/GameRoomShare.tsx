import React, { useState } from 'react';
import { Copy, Check, Share2, Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameRoomShareProps {
  gameId: string;
  onClose: () => void;
  onCancel: () => void;
}

const GameRoomShare: React.FC<GameRoomShareProps> = ({ gameId, onClose, onCancel }) => {
  const [copied, setCopied] = useState(false);

  const copyGameLink = () => {
    const baseUrl = window.location.origin;
    const gameLink = `${baseUrl}/multiplayer/${gameId}`;
    
    navigator.clipboard.writeText(gameLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
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
          
          <div className="relative p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-medium">Cosmic Room Created</span>
              </div>
              
              <motion.button
                onClick={onClose}
                className="text-zinc-400 hover:text-emerald-400 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={20} />
              </motion.button>
            </div>
            
            <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              Share Your Interstellar Coordinates
            </h2>
            
            <p className="text-zinc-300 text-center">
              Invite your crew to embark on this cosmic mission together
            </p>
            
            <div className="relative">
              <div className="flex bg-black/60 rounded-lg border border-white/10 overflow-hidden shadow-inner">
                <div className="flex-1 p-3 font-mono text-emerald-400 truncate">
                  {window.location.origin}/multiplayer/{gameId}
                </div>
                <motion.button 
                  onClick={copyGameLink}
                  className="bg-emerald-500/20 px-4 text-emerald-400 hover:bg-emerald-500/30 transition-all flex items-center"
                  whileHover={{ backgroundColor: "rgba(16, 185, 129, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </motion.button>
              </div>
              
              {/* Copy confirmation */}
              {/* <AnimatePresence>
                {copied && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute -bottom-5 left-0 right-0 text-center text-emerald-400 text-sm"
                  >
                    Coordinates copied to your data bank!
                  </motion.div>
                )}
              </AnimatePresence> */}
            </div>
            
            <div className="bg-black/40 border border-emerald-500/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-emerald-400 mb-2">
                <Users size={16} />
                <span className="text-sm font-medium">Awaiting Crew Members</span>
              </div>
              <p className="text-zinc-400 text-sm">
                The mission will launch automatically once all players have joined. Stay in orbit while we gather your team.
              </p>
            </div>
            
            <div className="flex space-x-3 pt-2">
              <motion.button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-lg font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 transition-all"
                whileHover={{ 
                  scale: 1.02,
                  backgroundColor: "rgba(16, 185, 129, 0.2)",
                  boxShadow: "0 0 15px rgba(16, 185, 129, 0.3)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                Continue
              </motion.button>
              <motion.button
                onClick={onCancel}
                className="flex-1 py-3 px-4 rounded-lg font-medium bg-zinc-900/80 border border-zinc-700 text-zinc-400 transition-all"
                whileHover={{ 
                  scale: 1.02,
                  backgroundColor: "rgba(63, 63, 70, 0.8)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                Abort Mission
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GameRoomShare;