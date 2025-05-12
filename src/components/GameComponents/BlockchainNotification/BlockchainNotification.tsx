// BlockchainNotification.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Blocks, ExternalLink, Copy, Check } from 'lucide-react';

interface BlockchainNotificationProps {
  transactionHash: string;
  updateType: string;
  show: boolean;
  onHide: () => void;
}

const BlockchainNotification: React.FC<BlockchainNotificationProps> = ({
  transactionHash,
  updateType,
  show,
  onHide
}) => {
  const [copied, setCopied] = useState(false);
  const notificationSound = useRef(new Audio('/assets/sounds/transaction_notification.wav'));
  
  useEffect(() => {
    if (show) {
      // Play sound when notification appears
      notificationSound.current.play().catch(console.error);
      
      // Auto hide after 5 seconds
      const timer = setTimeout(() => {
        onHide();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  const handleCopy = () => {
    navigator.clipboard.writeText(transactionHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const getUpdateTypeText = () => {
    switch(updateType) {
      case "MoveRecorded": return "Move Recorded";
      case "LockRecorded": return "Lock Recorded";
      case "GameStarted": return "Game Started";
      case "GameFinished": return "Game Finished";
      default: return "Blockchain Update";
    }
  };
  
  // Shorten hash for display
  const shortHash = `${transactionHash.slice(0, 12)}...${transactionHash.slice(-8)}`;
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: -50 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, x: -50 }}
          transition={{ type: "spring", damping: 20 }}
          className="fixed z-40 bottom-24 left-4 max-w-[280px]"
        >
          <div className="relative bg-black/85 backdrop-blur-md border border-emerald-500/40 rounded-lg overflow-hidden cosmic-shadow">
            {/* Blockchain energy pulse */}
            <div className="absolute inset-0 blockchain-pulse pointer-events-none"></div>
            
            {/* Energy top border */}
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent energy-flow"></div>
            
            {/* Header */}
            <div className="p-2 bg-black/80 border-b border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center">
                <Blocks className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
                <p className="text-xs font-medium text-emerald-400">BLOCKCHAIN UPDATE</p>
              </div>
              
              {/* Pulsing status indicator */}
              <div className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></div>
                <span className="text-xs text-emerald-300/70">ON-CHAIN</span>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-3">
              {/* Update type */}
              <div className="text-xs text-emerald-300 mb-2">
                {getUpdateTypeText()}
              </div>
              
              {/* Transaction hash */}
              <div className="flex items-center justify-between bg-black/80 border border-emerald-500/20 rounded px-2 py-1.5 mb-2">
                <div className="text-xs font-mono text-white/90 truncate mr-2">
                  {shortHash}
                </div>
                
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={handleCopy} 
                    className="p-1 rounded-md hover:bg-emerald-500/10 text-emerald-400/80 hover:text-emerald-400 transition-colors"
                    title="Copy transaction hash"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  {updateType === 'GameInitialized' ? (
                    <a
                      href={`https://solscan.io/tx/${transactionHash}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-md hover:bg-emerald-500/10 text-emerald-400/80 hover:text-emerald-400 transition-colors"
                      title="View on explorer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <a
                      href={`https://solscan.io/tx/${transactionHash}?cluster=custom&customUrl=https%3A%2F%2Fdevnet.magicblock.app`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-md hover:bg-emerald-500/10 text-emerald-400/80 hover:text-emerald-400 transition-colors"
                      title="View on explorer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {/* <a
                    href={`${import.meta.env.SOL_EXPLORER}/tx/${transactionHash}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded-md hover:bg-emerald-500/10 text-emerald-400/80 hover:text-emerald-400 transition-colors"
                    title="View on explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`${import.meta.env.SOL_EXPLORER}/tx/${transactionHash}?cluster=custom&customUrl=${import.meta.env.ER_RPC}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded-md hover:bg-emerald-500/10 text-emerald-400/80 hover:text-emerald-400 transition-colors"
                    title="View on explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a> */}
                </div>
              </div>
              
              {/* Success message */}
              <div className="text-[10px] text-zinc-400 flex items-center">
                <div className="w-1 h-1 rounded-full bg-emerald-500 mr-1"></div>
                Transaction confirmed on Monad blockchain
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BlockchainNotification;