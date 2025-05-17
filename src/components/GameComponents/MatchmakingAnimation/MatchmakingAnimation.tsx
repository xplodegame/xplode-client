import React, { useState, useEffect } from 'react';
import {Users, Coins, Grid, Bomb } from 'lucide-react';


interface MatchmakingAnimationProps {
  gridSize: number; 
  bombs: number; 
  betAmount: number;
}

// Add a new MatchmakingAnimation component
const MatchmakingAnimation: React.FC<MatchmakingAnimationProps> = ({ gridSize, bombs, betAmount }) => {
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStage(prev => (prev + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const dots = '.'.repeat(animationStage + 1);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="text-center space-y-6">
        <div className="flex justify-center mb-6">
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping"></div>
            <div className="relative z-10 w-full h-full bg-emerald-500/20 rounded-full flex items-center justify-center">
              <Users className="w-24 h-24 text-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-emerald-400">Matchmaking</h2>
          <div className="flex items-center justify-center space-x-2 text-zinc-300">
            <span>Finding opponents</span>
            <span className="text-emerald-400">{dots}</span>
          </div>
          
          <div className="bg-black/40 border border-emerald-500/20 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Grid className="w-4 h-4 text-emerald-400" />
                <span className="text-zinc-300">Grid Size</span>
              </div>
              <span className="text-emerald-400">{gridSize}×{gridSize}</span>
            </div>
            <div className="flex justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Bomb className="w-4 h-4 text-emerald-400" />
                <span className="text-zinc-300">Mines</span>
              </div>
              <span className="text-emerald-400">{bombs}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center space-x-2">
                <Coins className="w-4 h-4 text-emerald-400" />
                <span className="text-zinc-300">Bet</span>
              </div>
              <span className="text-emerald-400">{betAmount.toFixed(3)} SOL</span>
            </div>
          </div>
          
          <p className="text-zinc-400 text-sm">
            Searching for a fair match with similar settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default MatchmakingAnimation;