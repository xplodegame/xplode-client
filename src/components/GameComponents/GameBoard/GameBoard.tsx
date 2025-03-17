import React from 'react';
import { GameState } from '../../../types/gameTypes';

interface GameBoardProps {
  gameState: GameState | null;
  userData?: {
    privy_id: string; 
    email: string; 
    name: string;
    wallet_balance?: number | null;
    id?: number;
  };
  revealedCells: Set<string>;
  lockedCells: Set<string>;
  currentPlayerLockedCells: Set<string>;
  onMove: (x: number, y: number) => void;
  onLock: (x: number, y: number) => void;
  isLockPhase: boolean;
  locksRemaining: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ 
  gameState, 
  userData, 
  revealedCells,
  lockedCells,
  currentPlayerLockedCells, 
  onMove,
  onLock,
  isLockPhase,
  locksRemaining
}) => {
  if (!gameState || !userData) return null;

  const board = 'WAITING' in gameState ? gameState.WAITING.board :
                'RUNNING' in gameState ? gameState.RUNNING.board :
                'FINISHED' in gameState ? gameState.FINISHED.board : null;

  if (!board) return null;

  const gridSize = board.grid.length;
  const isMyTurn = 'RUNNING' in gameState && 
    gameState.RUNNING.players[gameState.RUNNING.turn_idx].id === userData.id?.toString();

  const handleCellClick = (row: number, col: number) => {
    if (!isMyTurn) return;

    const cellKey = `${row}-${col}`;
    // Check if cell is revealed or locked (by any player including current player's locks)
    if (revealedCells.has(cellKey) || lockedCells.has(cellKey) || currentPlayerLockedCells.has(cellKey)) return;
    
    if (isLockPhase) {
      onLock(row, col);
    } else {
      onMove(row, col);
    }
  };

  return (
    <div className="flex flex-col items-center w-full mb-8">
    <div className="flex justify-center w-full overflow-x-auto">
      <div 
        className="grid gap-4 p-4"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          width: 'fit-content'
        }}
      >
          {board.grid.map((row, rowIndex) =>
            row.map((_, colIndex) => {
              const cellKey = `${rowIndex}-${colIndex}`;
              const isRevealed = revealedCells.has(cellKey);
              const isLocked = lockedCells.has(cellKey);
              const isCurrentPlayerLocking = currentPlayerLockedCells.has(cellKey);
              const cellIndex = rowIndex * gridSize + colIndex;
              const isBomb = board.bomb_coordinates.includes(cellIndex);
              const shouldShowContent = isRevealed || ('FINISHED' in gameState && isBomb);
              const canInteract = isMyTurn && !isRevealed && !isLocked && !isCurrentPlayerLocking;
  
              return (
                <button
                  key={cellKey}
                  onClick={() => canInteract && handleCellClick(rowIndex, colIndex)}
                  disabled={!canInteract}
                  className={`
                    w-14 h-14 flex items-center justify-center rounded-lg
                    transition-all duration-300 ease-in-out transform
                    ${isLocked 
                      ? 'bg-yellow-900/30 border border-yellow-500/50 shadow-lg shadow-yellow-500/10'
                      : isCurrentPlayerLocking
                        ? 'bg-orange-900/30 border border-orange-500/50 shadow-lg shadow-orange-500/10'
                        : shouldShowContent
                          ? isBomb
                            ? 'bg-red-900/30 border border-red-500/50 shadow-lg shadow-red-500/10'
                            : 'bg-emerald-900/30 border border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                          : canInteract
                            ? 'bg-black/40 hover:bg-black/50 hover:scale-105 border border-emerald-500/20 shadow-lg shadow-emerald-500/10'
                            : 'bg-black/30 border border-emerald-500/10 shadow-lg shadow-emerald-500/5'}
                    backdrop-blur-sm
                  `}
                >
                  {isLocked ? (
                    <div className="text-xl text-yellow-400">🔒</div>
                  ) : isCurrentPlayerLocking ? (
                    <div className="text-xl text-orange-400">🔒</div>
                  ) : shouldShowContent ? (
                    isBomb ? (
                      <div className="text-xl animate-bounce">💥</div>
                    ) : (
                      <div className="text-xl animate-pulse">💎</div>
                    )
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-black/40 to-black/50 rounded-lg" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
      
      {/* Message container with consistent height and visibility */}
      <div className="h-12 mt-4 flex items-center justify-center">
  <div 
    className={`h-8 min-w-[150px] flex items-center justify-center transition-opacity duration-300 ${isLockPhase && isMyTurn ? 'opacity-100' : 'opacity-0'}`}
  >
    <span className="px-4 py-2 rounded-lg bg-black/40 border border-emerald-500/20 text-emerald-400/90 backdrop-blur-sm shadow-lg shadow-emerald-500/10">
      {locksRemaining} Locks Remaining
    </span>
  </div>
</div>

    </div>
  );
};

export default React.memo(GameBoard);