import React from 'react';
import { GameState, Player } from '../../types/gameTypes';

interface GameBoardProps {
  gameState: GameState | null;
  userData?: Player;
  revealedCells: Set<string>;
  onMove: (x: number, y: number) => void;
  gemSound: React.RefObject<HTMLAudioElement>;
  bombSound: React.RefObject<HTMLAudioElement>;
}

const GameBoard: React.FC<GameBoardProps> = ({ 
  gameState, 
  userData, 
  revealedCells, 
  onMove,
  gemSound,
  bombSound
}) => {
  if (!gameState) return null;

  const board = 'WAITING' in gameState ? gameState.WAITING.board :
                'RUNNING' in gameState ? gameState.RUNNING.board :
                'FINISHED' in gameState ? gameState.FINISHED.board : null;

  if (!board) return null;

  const gridSize = board.grid.length;

  const handleCellClick = (row: number, col: number) => {
    const cellIndex = row * gridSize + col;
    const isBomb = board.bomb_coordinates.includes(cellIndex);

    if (isBomb) {
      bombSound.current?.play();
    } else {
      gemSound.current?.play();
    }

    onMove(row, col);
  };

  return (
    <div className="flex justify-center w-full mb-8 overflow-x-auto">
      <div 
        className="grid gap-4 p-4"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          width: 'fit-content'
        }}
      >
        {Array(gridSize).fill(null).map((_, row) =>
          Array(gridSize).fill(null).map((_, col) => {
            const cellKey = `${row}-${col}`;
            const isRevealed = revealedCells.has(cellKey);
            const canMove = 'RUNNING' in gameState &&
              gameState.RUNNING.players[gameState.RUNNING.turn_idx].id === userData?.id?.toString();

            const cellIndex = row * gridSize + col;
            const isBomb = board.bomb_coordinates.includes(cellIndex);

            const shouldShowContent = isRevealed || ('FINISHED' in gameState && isBomb);

            return (
              <button
                key={cellKey}
                onClick={() => canMove && !isRevealed && handleCellClick(row, col)}
                disabled={!canMove || isRevealed}
                className={`
                  w-14 h-14 flex items-center justify-center rounded-lg
                  transition-all duration-300 ease-in-out transform
                  ${shouldShowContent
                    ? isBomb
                      ? 'bg-red-900/30 border border-red-500/50'
                      : 'bg-emerald-900/30 border border-emerald-500/50'
                    : canMove
                      ? 'bg-zinc-900/80 hover:bg-zinc-800 hover:scale-105 border border-zinc-700'
                      : 'bg-zinc-900/50 border border-zinc-800'}
                  shadow-lg backdrop-blur-sm
                `}
              >
                {shouldShowContent ? (
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
  );
};

export default React.memo(GameBoard);