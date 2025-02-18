// GameBoard.tsx
import React from 'react';
import { GameState } from '../../../types/gameTypes';

interface GameBoardProps {
  gameState: GameState | null;
  userData?: {
    clerk_id: string; 
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
  gemSound: React.RefObject<HTMLAudioElement>;
  bombSound: React.RefObject<HTMLAudioElement>;
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
  gemSound,
  bombSound,
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
      {isLockPhase && isMyTurn && (
        <div className="mb-4 flex items-center justify-center space-x-2 font-medium">
          <span className="px-4 py-2 rounded-lg bg-zinc-900/80 border border-yellow-500/30 text-yellow-400/90 backdrop-blur-sm shadow-lg">
            {locksRemaining} Locks
          </span>
      </div>
      )}
      <div className="flex justify-center w-full overflow-x-auto">
        <div 
          className="grid gap-4 p-4"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            width: 'fit-content'
          }}
        >
          {board.grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
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
                      ? 'bg-yellow-900/30 border border-yellow-500/50'
                      : isCurrentPlayerLocking
                        ? 'bg-orange-900/30 border border-orange-500/50'
                        : shouldShowContent
                          ? isBomb
                            ? 'bg-red-900/30 border border-red-500/50'
                            : 'bg-emerald-900/30 border border-emerald-500/50'
                          : canInteract
                            ? 'bg-zinc-900/80 hover:bg-zinc-800 hover:scale-105 border border-zinc-700'
                            : 'bg-zinc-900/50 border border-zinc-800'}
                    shadow-lg backdrop-blur-sm
                  `}
                >
                  {isLocked ? (
                    <div className="text-xl">🔒</div>
                  ) : isCurrentPlayerLocking ? (
                    <div className="text-xl text-orange-400">🔒</div>
                  ) : shouldShowContent ? (
                    isBomb ? (
                      <div className="text-xl animate-bounce">💥</div>
                    ) : (
                      <div className="text-xl animate-pulse">💎</div>
                    )
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-lg" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(GameBoard);