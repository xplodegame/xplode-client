import React from 'react';
import { Loader2 } from 'lucide-react';

interface JoiningGameIndicatorProps {
  gameId: string;
}

const JoiningGameIndicator: React.FC<JoiningGameIndicatorProps> = ({ gameId }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex flex-col items-center max-w-md text-center">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDuration: '2s' }}></div>
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-3">
          Joining Cosmic Mission
        </h2>
        
        <p className="text-zinc-300 mb-4">
          Establishing connection to game room...
        </p>
        
        <div className="bg-black/40 border border-emerald-500/10 rounded-lg p-4 mb-6 max-w-sm">
          <p className="text-zinc-400 text-sm">
            Game ID: <span className="text-emerald-400 font-mono">{gameId.substring(0, 8)}...</span>
          </p>
          <p className="text-zinc-400 text-sm mt-2">
            Waiting for the host to accept your connection. This won't take long.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoiningGameIndicator;