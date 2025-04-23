import React, { useState, useEffect } from 'react';
import {Rocket, Clock, Star, Sparkles } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MaintenanceModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAnimateIn(true);
    } else {
      setAnimateIn(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={`relative z-10 w-full max-w-md bg-black/90 border border-emerald-500/30 rounded-lg shadow-xl shadow-emerald-500/20 transform transition-all duration-500 overflow-hidden ${
          animateIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Glowing edges */}
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 via-emerald-400/20 to-emerald-600/20 blur opacity-40 animate-pulse"></div>
        </div>
        
        {/* Header with space particles */}
        <div className="relative py-6 px-8 border-b border-emerald-500/20 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(15)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-1 h-1 bg-emerald-400/70 rounded-full animate-pulse"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${Math.random() * 3 + 2}s`
                }}
              />
            ))}
          </div>
          
          <div className="relative flex items-center justify-center mb-2">
            <Rocket className="w-8 h-8 text-emerald-400 mr-2 animate-bounce" style={{ animationDuration: '3s' }} />
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              COSMIC EXPLORATION
            </h2>
          </div>
          <p className="text-emerald-400/90 text-center font-medium">Multiplayer Universe Under Construction</p>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 p-1">
              <Clock className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-emerald-300 font-semibold mb-1">Interstellar Matchmaking</h3>
              <p className="text-zinc-300/90 text-sm">Our cosmic matchmaking system is being enhanced to provide faster player connections across the galaxy.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 p-1">
              <Star className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-emerald-300 font-semibold mb-1">Coming Soon</h3>
              <p className="text-zinc-300/90 text-sm">We're adding new stellar features including instant matchmaking, AI opponents, and exclusive cosmic rewards.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 p-1">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-emerald-300 font-semibold mb-1">Alternative Options</h3>
              <p className="text-zinc-300/90 text-sm">While waiting, create a Game Room and share the link with friends to start exploring the Cosmic Grid together!</p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-emerald-500/20 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-emerald-500/20 flex items-center"
          >
            <span>RETURN TO SHIP</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceModal;