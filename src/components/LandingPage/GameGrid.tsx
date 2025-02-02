import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GRID_SIZE = 5;
const TRAIL_DURATION = 2000;

export default function GameGrid() {
  const [grid, setGrid] = useState(
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill({ 
      active: false, 
      timestamp: null,
      trail: false 
    }))
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setGrid(prevGrid => {
        let hasChanges = false;
        const newGrid = prevGrid.map(row => 
          row.map(cell => {
            if (cell.active && cell.timestamp && now - cell.timestamp > TRAIL_DURATION) {
              hasChanges = true;
              return { ...cell, active: false, trail: true };
            }
            if (cell.trail && cell.timestamp && now - cell.timestamp > TRAIL_DURATION + 1000) {
              hasChanges = true;
              return { active: false, trail: false, timestamp: null };
            }
            return cell;
          })
        );
        return hasChanges ? newGrid : prevGrid;
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

  const handleHover = (row: number, col: number) => {
    if (!grid[row][col].active) {
      setGrid(prev => {
        const newGrid = prev.map(r => [...r]);
        newGrid[row][col] = { active: true, trail: false, timestamp: Date.now() };
        return newGrid;
      });
    }
  };

  return (
    <div className="relative p-6">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full animate-pulse" />
      
      <div className="grid grid-cols-5 gap-4 relative">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <motion.div
              key={`${rowIndex}-${colIndex}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: (rowIndex * GRID_SIZE + colIndex) * 0.02,
                duration: 0.3,
                ease: "easeOut"
              }}
              className="relative"
            >
              <motion.button
                whileHover={{ 
                  scale: 1.08,
                  transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 20
                  }
                }}
                onHoverStart={() => handleHover(rowIndex, colIndex)}
                className={`
                  group w-16 h-16 rounded-2xl relative overflow-hidden
                  transition-all duration-500 ease-out transform
                  ${cell.active 
                    ? 'bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-emerald-500/5' 
                    : cell.trail
                    ? 'bg-gradient-to-br from-emerald-500/5 via-emerald-400/5 to-transparent'
                    : 'bg-black/40 hover:bg-black/30'}
                  border border-white/10 backdrop-blur-xl
                `}
              >
                {/* Subtle shimmer effect */}
                <div className={`
                  absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent
                  translate-x-[-200%] group-hover:translate-x-[200%]
                  transition-transform duration-1000 ease-in-out
                `} />

                {/* Subtle gradient overlay */}
                <div className={`
                  absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300
                `} />

                {/* Subtle trail effect */}
                <AnimatePresence>
                  {(cell.active || cell.trail) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: cell.active ? 0.6 : 0.2 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 -z-10"
                    >
                      <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur-xl" />
                      <div className="absolute inset-0 bg-emerald-400/5 rounded-2xl blur-lg animate-pulse" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Enhanced diamond animation */}
                <AnimatePresence>
                  {cell.active && (
                    <motion.div
                      initial={{ scale: 0, rotate: -120, opacity: 0 }}
                      animate={{ 
                        scale: [0, 1.2, 1],
                        rotate: [0, 0],
                        opacity: 1
                      }}
                      exit={{ 
                        scale: [1, 1.1, 0],
                        rotate: 120,
                        opacity: 0
                      }}
                      transition={{
                        duration: 0.6,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
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
                </AnimatePresence>
              </motion.button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}



// export default function GameGrid() {

//   return (
//     <div className="relative p-6">
//     </div>
//   );
// }