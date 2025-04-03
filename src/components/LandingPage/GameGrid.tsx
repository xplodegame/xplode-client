import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const GRID_SIZE = 5;
const DECAY_TIME = 2000;

interface GridCellProps {
  active: boolean;
  decaying: boolean;
  onActivate: () => void;
}

// Original desktop GridCell component - completely untouched
const GridCell = React.memo(function GridCell({ 
  active, 
  decaying, 
  onActivate 
}: GridCellProps) {
  return (
    <button
      onMouseEnter={onActivate}
      className={`
        w-16 h-16 rounded-2xl relative 
        transition-all duration-300 ease-out
        border border-white/10
        ${active 
          ? 'bg-gradient-to-br from-emerald-500/30 to-emerald-500/10' 
          : decaying
          ? 'bg-gradient-to-br from-emerald-500/10 to-transparent'
          : 'bg-black/40 hover:bg-black/30'
        }
      `}
    >
      {active && (
        <motion.div>
          <motion.span 
            animate={{ 
              y: [-2, 2, -2],
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-2xl"
          >
            💎
          </motion.span>
        </motion.div>
      )}
      {(active || decaying) && (
        <div 
          className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"
          style={{
            opacity: active ? 0.4 : 0.1,
            transition: 'opacity 300ms ease-out'
          }}
        />
      )}
    </button>
  );
});

// Mobile-specific GridCell component
const MobileGridCell = React.memo(function MobileGridCell({ 
  active, 
  decaying, 
  onActivate 
}: GridCellProps) {
  return (
    <button
      onMouseEnter={onActivate}
      onClick={onActivate}
      className={`
        w-11 h-11 rounded-xl relative 
        transition-all duration-300 ease-out
        border border-white/10
        ${active 
          ? 'bg-gradient-to-br from-emerald-500/30 to-emerald-500/10' 
          : decaying
          ? 'bg-gradient-to-br from-emerald-500/10 to-transparent'
          : 'bg-black/40 hover:bg-black/30'
        }
      `}
    >
      {active && (
        <motion.div>
          <motion.span 
            animate={{ 
              y: [-1, 1, -1],
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-lg"
          >
            💎
          </motion.span>
        </motion.div>
      )}
      {(active || decaying) && (
        <div 
          className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-full"
          style={{
            opacity: active ? 0.4 : 0.1,
            transition: 'opacity 300ms ease-out'
          }}
        />
      )}
    </button>
  );
});

export default function GameGrid() {
  // Use a single flat array for better performance
  const [activeStates, setActiveStates] = useState(new Array(GRID_SIZE * GRID_SIZE).fill(false));
  const [decayingStates, setDecayingStates] = useState(new Array(GRID_SIZE * GRID_SIZE).fill(false));
  
  // Use refs to track timeouts
  const timeoutRefs = useRef(new Array(GRID_SIZE * GRID_SIZE).fill(null));
  const decayTimeoutRefs = useRef(new Array(GRID_SIZE * GRID_SIZE).fill(null));

  // Detect viewport size
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Initial check
    checkSize();
    
    // Add resize listener
    window.addEventListener('resize', checkSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // Cleanup function
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => timeout && clearTimeout(timeout));
      decayTimeoutRefs.current.forEach(timeout => timeout && clearTimeout(timeout));
    };
  }, []);

  const handleCellActivate = useCallback((index: number) => {
    if (activeStates[index]) return;

    // Clear any existing timeouts for this cell
    if (timeoutRefs.current[index]) {
      clearTimeout(timeoutRefs.current[index]);
      clearTimeout(decayTimeoutRefs.current[index]);
    }

    // Activate cell
    setActiveStates(prev => {
      const next = [...prev];
      next[index] = true;
      return next;
    });

    // Set decay
    timeoutRefs.current[index] = setTimeout(() => {
      setActiveStates(prev => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
      setDecayingStates(prev => {
        const next = [...prev];
        next[index] = true;
        return next;
      });

      // Clear decay
      decayTimeoutRefs.current[index] = setTimeout(() => {
        setDecayingStates(prev => {
          const next = [...prev];
          next[index] = false;
          return next;
        });
      }, DECAY_TIME / 2);
    }, DECAY_TIME);
  }, [activeStates]);

  // Render either desktop or mobile view
  if (isMobile) {
    // Mobile version
    // Memoize the mobile grid
    const mobileGrid = useMemo(() => {
      const cells = [];
      for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        cells.push(
          <MobileGridCell
            key={i}
            active={activeStates[i]}
            decaying={decayingStates[i]}
            onActivate={() => handleCellActivate(i)}
          />
        );
      }
      return cells;
    }, [activeStates, decayingStates, handleCellActivate]);

    return (
      <div className="relative p-2">
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes pop {
            0% { transform: scale(0.8); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out forwards;
          }
          .animate-pop {
            animation: pop 0.3s ease-out forwards;
          }
        `}</style>
        <div className="relative">
          <div className="grid grid-cols-5 gap-2">
            {mobileGrid}
          </div>
        </div>
      </div>
    );
  } else {
    // Original desktop version - completely untouched
    // Memoize the grid
    const grid = useMemo(() => {
      const cells = [];
      for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        cells.push(
          <GridCell
            key={i}
            active={activeStates[i]}
            decaying={decayingStates[i]}
            onActivate={() => handleCellActivate(i)}
          />
        );
      }
      return cells;
    }, [activeStates, decayingStates, handleCellActivate]);

    return (
      <div className="relative p-6">
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes pop {
            0% { transform: scale(0.8); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out forwards;
          }
          .animate-pop {
            animation: pop 0.3s ease-out forwards;
          }
        `}</style>
        <div className="relative">
          <div className="grid grid-cols-5 gap-4">
            {grid}
          </div>
        </div>
      </div>
    );
  }
}