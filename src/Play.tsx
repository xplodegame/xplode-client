// import { useEffect, useState } from "react";

// function Play() {
//   const [mines, setMines] = useState<number[][]>([]); // State to store mine coordinates
//   const [grid, setGrid] = useState<(0 | 1)[][]>(
//     Array(5)
//       .fill(0)
//       .map(() => Array(5).fill(1))
//   );

//   // Fetch mine data from the server on initial load
//   useEffect(() => {
//     const fetchMines = async () => {
//       try {
//         const response = await fetch("http://localhost:8080/mines", {
//           headers: { "Content-Type": "application/json" },
//         });
//         const data = await response.json();
//         console.log("Fetched mines:", data.mines);
//         setMines(data.mines);
//       } catch (error) {
//         console.error("Error fetching mines:", error);
//       }
//     };

//     fetchMines();
//   }, []);

//   // Handle tile click to reveal mine or safe
//   const handleTileClick = (row: number, col: number) => {
//     setGrid((prevGrid) => {
//       const newGrid = prevGrid.map((r) => [...r]); // Copy the grid
//       newGrid[row][col] = mines.some(([r, c]) => r === row && c === col) ? 0 : 1;
//       return newGrid;
//     });
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
//       <h1 className="text-2xl font-bold mb-6">5x5 Mines Game</h1>
//       <div className="grid grid-cols-5 gap-2">
//         {grid.map((row, rowIndex) =>
//           row.map((cell, colIndex) => (
//             <button
//               key={`${rowIndex}-${colIndex}`}
//               onClick={() => handleTileClick(rowIndex, colIndex)}
//               className="w-16 h-16 flex items-center justify-center bg-gray-700 text-lg font-bold rounded-md shadow-md hover:bg-gray-600"
//             >
//               {cell === 1 ? "" : cell}
//             </button>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }

// export default Play;





import React, { useEffect, useState } from "react";

function Play() {
  // State to store mine coordinates
  const [mines, setMines] = useState<number[][]>([]);
  
  // Initialize grid with all cells as unclicked (1)
  const [grid, setGrid] = useState<(0 | 1)[][]>(
    Array(5).fill(0).map(() => Array(5).fill(1))
  );

  // State to track game over condition
  const [gameOver, setGameOver] = useState(false);

  // Fetch mine data from the server on initial load
  useEffect(() => {
    const fetchMines = async () => {
      try {
        const response = await fetch("http://localhost:8080/mines", {
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        console.log("Fetched mines:", data.mines);
        setMines(data.mines);
      } catch (error) {
        console.error("Error fetching mines:", error);
        // Optionally generate random mines if server fetch fails
        const randomMines = generateRandomMines();
        setMines(randomMines);
      }
    };

    fetchMines();
  }, []);

  // Generate random mines if server fetch fails
  const generateRandomMines = (): number[][] => {
    const mineCount = 3; // You can adjust the number of mines
    const generatedMines: number[][] = [];
    while (generatedMines.length < mineCount) {
      const row = Math.floor(Math.random() * 5);
      const col = Math.floor(Math.random() * 5);
      
      // Ensure no duplicate mine locations
      if (!generatedMines.some(([r, c]) => r === row && c === col)) {
        generatedMines.push([row, col]);
      }
    }
    return generatedMines;
  };

  // Handle tile click to reveal mine or safe
  const handleTileClick = (row: number, col: number) => {
    // Prevent clicking if game is over or tile already revealed
    if (gameOver || grid[row][col] === 0) return;

    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((r) => [...r]); // Copy the grid
      
      // Check if clicked tile contains a mine
      const isMine = mines.some(([r, c]) => r === row && c === col);
      
      if (isMine) {
        // Game over if mine is clicked
        setGameOver(true);
        newGrid[row][col] = 0;
        
        // Reveal all mines
        mines.forEach(([mineRow, mineCol]) => {
          newGrid[mineRow][mineCol] = 0;
        });
      } else {
        // Mark safe tile
        newGrid[row][col] = 0;
      }
      
      return newGrid;
    });
  };

  // Reset game functionality
  const resetGame = () => {
    setGrid(Array(5).fill(0).map(() => Array(5).fill(1)));
    setGameOver(false);
    const randomMines = generateRandomMines();
    setMines(randomMines);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-6">5x5 Mines Game</h1>
      <h1>5x5 Mines Game</h1>
      
      {gameOver && (
        <div className="mb-4 text-red-500 text-xl font-semibold">
          Game Over! You hit a mine.
        </div>
      )}
      
      <div className="grid grid-cols-5 gap-2 mb-6">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleTileClick(rowIndex, colIndex)}
              disabled={gameOver}
              className={`
                w-16 h-16 flex items-center justify-center 
                rounded-md shadow-md transition-colors duration-200
                ${cell === 1 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-500 cursor-not-allowed'}
                ${gameOver ? 'opacity-50' : ''}
              `}
            >
              {cell === 0 && '💥'}
            </button>
          ))
        )}
      </div>
      
      {gameOver && (
        <button
          onClick={resetGame}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Play Again
        </button>
      )}
    </div>
  );
}

export default Play;