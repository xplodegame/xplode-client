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

  const handleCellClick = (row: number, col: number) => {
    const cellIndex = row * 5 + col;
    const isBomb = board.bomb_coordinates.includes(cellIndex);

    if (isBomb) {
      bombSound.current?.play();
    } else {
      gemSound.current?.play();
    }

    onMove(row, col);
  };

  return (
    <div className="grid grid-cols-5 gap-3 mb-8">
      {Array(5).fill(null).map((_, row) =>
        Array(5).fill(null).map((_, col) => {
          const cellKey = `${row}-${col}`;
          const isRevealed = revealedCells.has(cellKey);
          const canMove = 'RUNNING' in gameState &&
            gameState.RUNNING.players[gameState.RUNNING.turn_idx].id === userData?.id?.toString();

          const cellIndex = row * 5 + col;
          const isBomb = board.bomb_coordinates.includes(cellIndex);

          const shouldShowContent = isRevealed || ('FINISHED' in gameState && isBomb);

          return (
            <button
              key={cellKey}
              onClick={() => canMove && !isRevealed && handleCellClick(row, col)}
              disabled={!canMove || isRevealed}
              className={`
                w-16 h-16 flex items-center justify-center rounded-lg
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
                  <div className="text-red-500 text-2xl animate-bounce">💥</div>
                ) : (
                  <div className="text-emerald-400 text-2xl animate-pulse">💎</div>
                )
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-lg" />
              )}
            </button>
          );
        })
      )}
    </div>
  );
};

export default React.memo(GameBoard);