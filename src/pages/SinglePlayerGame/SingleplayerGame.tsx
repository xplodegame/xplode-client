import { useEffect, useState } from "react";
import { Sparkles, Crown } from 'lucide-react';

function SingleplayerGame() {
  // Your existing state management
  const [mines, setMines] = useState<number[][]>([]);
  const [grid, setGrid] = useState<(0 | 1)[][]>(
    Array(5).fill(0).map(() => Array(5).fill(1))
  );
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highestScore, setHighestScore] = useState<number>(() => {
    const savedScore = localStorage.getItem('highestScore');
    return savedScore ? JSON.parse(savedScore) : 0;
  });

  const gemSound = new Audio('/assets/sounds/gemSound.mp3');
  const bombSound = new Audio('/assets/sounds/bombSound.mp3');

  // Your existing game logic
  const generateMines = () => {
    const newMines: number[][] = [];
    while (newMines.length < 5) {
      const row = Math.floor(Math.random() * 5);
      const col = Math.floor(Math.random() * 5);
      if (!newMines.some(([r, c]) => r === row && c === col)) {
        newMines.push([row, col]);
      }
    }
    setMines(newMines);
  };

  useEffect(() => {
    generateMines();
  }, []);

  const handleTileClick = (row: number, col: number) => {
    if (gameOver || grid[row][col] === 0) return;

    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((r) => [...r]);
      
      const isMine = mines.some(([r, c]) => r === row && c === col);
      
      if (isMine) {
        setGameOver(true);
        newGrid[row][col] = 0;
        bombSound.play();
        mines.forEach(([mineRow, mineCol]) => {
          newGrid[mineRow][mineCol] = 0;
        });
      } else {
        newGrid[row][col] = 0;
        setScore(prevScore => {
          const newScore = prevScore + 1;
          if (newScore > highestScore) {
            setHighestScore(newScore);
            localStorage.setItem('highestScore', JSON.stringify(newScore));
          }
          return newScore;
        });
        gemSound.play();
      }
      
      return newGrid;
    });
  };

  const resetGame = () => {
    generateMines();
    setGrid(Array(5).fill(0).map(() => Array(5).fill(1)));
    setGameOver(false);
    setScore(0);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-zinc-900 via-black to-zinc-900 text-white p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-12 text-center bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent inline-flex items-center gap-4 w-full justify-center">
          <Sparkles className="text-emerald-400" size={32} />
          Mines
          <Sparkles className="text-emerald-400" size={32} />
        </h1>

        <div className="flex justify-between items-center mb-8 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="text-emerald-400">
              <Crown size={24} />
            </div>
            <div>
              <div className="text-sm text-zinc-400">Score</div>
              <div className="text-xl font-bold text-emerald-400">{score}</div>
            </div>
          </div>
          <div>
            <div className="text-sm text-zinc-400">Best Score</div>
            <div className="text-xl font-bold text-emerald-400">{highestScore}</div>
          </div>
        </div>

        {gameOver && (
          <div className="mb-6 text-center bg-red-950/30 border border-red-900/50 rounded-lg p-3">
            <div className="text-red-400 text-xl font-medium">Game Over!</div>
            <div className="text-zinc-400">Final score: {score}</div>
          </div>
        )}
        
        <div className="grid grid-cols-5 gap-3 mb-8">
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isMine = mines.some(([r, c]) => r === rowIndex && c === colIndex && cell === 0);
              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleTileClick(rowIndex, colIndex)}
                  disabled={gameOver || cell === 0}
                  className={`
                    w-16 h-16 flex items-center justify-center rounded-lg
                    transition-all duration-300 ease-in-out transform
                    ${cell === 0 
                      ? isMine 
                        ? 'bg-red-900/30 border border-red-500/50'
                        : 'bg-emerald-900/30 border border-emerald-500/50'
                      : !gameOver 
                        ? 'bg-zinc-900/80 hover:bg-zinc-800 hover:scale-105 border border-zinc-700'
                        : 'bg-zinc-900/50 border border-zinc-800'}
                    shadow-lg backdrop-blur-sm
                  `}
                >
                  {cell === 0 && (
                    isMine ? (
                      <div className="text-red-500 text-2xl">💥</div>
                    ) : (
                      <div className="text-emerald-400 text-2xl">💎</div>
                    )
                  )}
                </button>
              )
            })
          )}
        </div>
        
        {gameOver && (
          <button
            onClick={resetGame}
            className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 
                     bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 
                     border border-emerald-500/30"
          >
            Play Again
          </button>
        )}
      </div>
    </div>
  );
}

export default SingleplayerGame;
