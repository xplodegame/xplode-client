// GifTauntFeature.tsx - Enhanced Sleek Cosmic Edition
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Zap, Star } from 'lucide-react';

interface GifTauntProps {
  onSelectGif: (gifId: number) => void;
  ownedGifs: Array<{id: number, name: string, url: string, rarity: string}>;
  incomingGif: {id: number, url: string, playerId: string, playerName: string} | null;
  players: any[];
}

const GifTauntFeature: React.FC<GifTauntProps> = ({ 
  onSelectGif, 
  ownedGifs, 
  incomingGif,
  players 
}) => {
  const [showSelector, setShowSelector] = useState(false);
  
  // Auto hide incoming gif after 5 seconds
  useEffect(() => {
    let timer: number;
    if (incomingGif) {
      timer = window.setTimeout(() => {
        // This will trigger when the parent clears incomingGif
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [incomingGif]);

  // Find sender name from player ID
  const getSenderName = () => {
    if (!incomingGif || !players) return "";
    const sender = players.find(p => p.id?.toString() === incomingGif.playerId);
    return sender ? sender.name : "Opponent";
  };

  const rarityColors = {
    "Common": {
      border: "border-emerald-500/50",
      text: "text-emerald-400",
      gradient: "from-emerald-500/0 to-emerald-500/20",
      glow: "emerald-glow",
      icon: null
    },
    "Rare": {
      border: "border-blue-500/50",
      text: "text-blue-400",
      gradient: "from-blue-500/0 to-blue-500/20",
      glow: "blue-glow",
      icon: null
    },
    "Epic": {
      border: "border-purple-500/50",
      text: "text-purple-400",
      gradient: "from-purple-500/0 to-purple-500/20",
      glow: "purple-glow",
      icon: null
    },
    "Legendary": {
      border: "border-yellow-500/50",
      text: "text-yellow-400",
      gradient: "from-yellow-500/0 to-yellow-500/20",
      glow: "yellow-glow",
      icon: <Star className="w-3 h-3 text-yellow-400 mr-1" />
    },
    "Mythic": {
      border: "border-red-500/50",
      text: "text-red-400",
      gradient: "from-red-500/0 to-red-500/20",
      glow: "red-glow",
      icon: <Star className="w-3 h-3 text-red-400 mr-1" />
    }
  };

  return (
    <>
      {/* Enhanced Cosmic Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative">
          {/* Subtle orbit ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-1 rounded-full border border-emerald-500/20 pointer-events-none"
          />
          
          {/* Main button with cosmic glow */}
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSelector(!showSelector)}
            className="relative p-3 rounded-full bg-black backdrop-blur-sm 
                     border border-emerald-500/50 flex items-center justify-center
                     shadow-lg cosmic-glow group"
          >
            {/* Subtle nebula effect inside button */}
            <div className="absolute inset-0 rounded-full overflow-hidden opacity-60">
              <div className="absolute inset-0 nebula-bg"></div>
            </div>
            
            <MessageSquare className="w-5 h-5 text-emerald-400 relative z-10 group-hover:text-emerald-300 transition-colors" />
            
            {/* Notification pulse */}
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </motion.button>
        </div>
      </div>

      {/* Enhanced Sleek GIF Pop-up */}
      <AnimatePresence>
        {showSelector && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            className="fixed bottom-20 right-6 z-50 w-64 bg-black/85 backdrop-blur-md 
                     border border-emerald-500/40 rounded-lg overflow-hidden
                     shadow-lg cosmic-shadow"
          >
            {/* Cool Energy Top Border */}
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent energy-flow"></div>
            
            {/* Header */}
            <div className="p-2 bg-black/90 flex items-center justify-between">
              <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500 font-medium text-sm flex items-center">
                <Zap className="w-3 h-3 mr-1 text-emerald-400" />
                SELECT TAUNT
              </h3>
              
              {/* Cool targeting reticle decoration */}
              <div className="w-4 h-4 relative">
                <div className="absolute inset-0 targeting-reticle"></div>
              </div>
            </div>
            
            {/* GIF List */}
            <div className="max-h-72 overflow-y-auto space-y-2 p-2 custom-scrollbar">
              {ownedGifs.map(gif => (
                <motion.div
                  key={gif.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ x: 3, backgroundColor: "rgba(0,0,0,0.8)" }}
                  onClick={() => {
                    onSelectGif(gif.id);
                    setShowSelector(false);
                  }}
                  className={`relative flex items-center space-x-2 p-1.5 rounded-md cursor-pointer 
                            bg-black/60 border-l-2 ${rarityColors[gif.rarity as keyof typeof rarityColors].border}
                            hover:border-l-4 transition-all duration-200 group overflow-hidden`}
                >
                  {/* Rarity-based gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${rarityColors[gif.rarity as keyof typeof rarityColors].gradient} 
                                 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                  </div>
                  
                  {/* GIF Thumbnail with subtle glow effect */}
                  <div className={`w-12 h-12 rounded overflow-hidden flex-shrink-0 border border-zinc-800/50 
                                 relative ${rarityColors[gif.rarity as keyof typeof rarityColors].glow}`}>
                    <img src={gif.url} alt={gif.name} className="w-full h-full object-cover" />
                  </div>
                  
                  {/* GIF Info */}
                  <div className="flex-grow relative z-10">
                    <p className="text-white text-xs font-medium truncate">{gif.name}</p>
                    <p className={`text-xs flex items-center ${rarityColors[gif.rarity as keyof typeof rarityColors].text}`}>
                      {rarityColors[gif.rarity as keyof typeof rarityColors].icon}
                      {gif.rarity}
                    </p>
                  </div>
                  
                  {/* Send Icon with laser effect */}
                  <div className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-1 rounded-full bg-black/50 border border-emerald-500/30">
                      <Zap className="w-3 h-3 text-emerald-400" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Incoming GIF Display */}
      <AnimatePresence>
        {incomingGif && (
          <motion.div
            initial={{ opacity: 0, y: -10, x: 10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -10, x: 10 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed z-40 top-20 right-4 max-w-[200px]"
          >
            <div className="relative bg-black/80 backdrop-blur-sm border border-emerald-500/40 rounded-md overflow-hidden cosmic-shadow">
              {/* Top energy border */}
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent energy-flow"></div>
              
              {/* Header */}
              <div className="p-1.5 bg-black/70 border-b border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-ping absolute"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></div>
                  <p className="text-xs text-emerald-400">{getSenderName()}</p>
                </div>
                
                <div className="text-xs text-emerald-500/70">BROADCASTING</div>
              </div>
              
              {/* GIF with scan effect */}
              <div className="p-1.5 relative">
                <div className="rounded overflow-hidden">
                  <img 
                    src={incomingGif.url} 
                    alt="Taunt" 
                    className="w-full object-contain max-h-[160px]" 
                  />
                  
                  {/* Subtle scan effect */}
                  <div className="absolute inset-0 pointer-events-none scan-effect"></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GifTauntFeature;