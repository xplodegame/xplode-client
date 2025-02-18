import React, { useState, useRef } from 'react';
import { Coins, Grid, Bomb, Users } from 'lucide-react';

interface LobbyDetailsProps {
  betAmount: number;
  setBetAmount: (amount: number) => void;
  playGame: (gridSize: number, bombs: number, minPlayers: number) => void;
  isConnected: boolean;
  walletBalance: number;
}

const LobbyDetails: React.FC<LobbyDetailsProps> = ({
  betAmount,
  setBetAmount,
  playGame,
  isConnected,
  walletBalance
}) => {
  const [gridSize, setGridSize] = useState<number>(5);
  const [bombs, setBombs] = useState<number>(3);
  const [minPlayers, setMinPlayers] = useState<number>(2);

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = value === "" ? 0 : Number(value);
    setBetAmount(Math.min(numValue, walletBalance));
  };

  const quickBets = [0.05, 0.1, 0.25, 0.5, 1, 2];
  const gridSizes = [3, 4, 5, 6, 7, 8];

  const clickSound = useRef(new Audio('/assets/sounds/click.wav'));
  const startGameSound = useRef(new Audio('/assets/sounds/start_game.wav'));

  const playClickSound = () => {
    clickSound.current.play();
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto space-y-8">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-emerald-400" />
          <span className="text-zinc-400">Balance:</span>
          <span className="text-emerald-400 font-mono">{walletBalance.toFixed(3)} SOL</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
          <span className="text-zinc-400">{isConnected ? 'Connected' : 'Connecting...'}</span>
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-black/40 backdrop-blur-sm border border-zinc-800/50 rounded-lg overflow-hidden">
        {/* Bet Amount Section */}
        <div className="p-6 border-b border-zinc-800/50">
          <h3 className="text-zinc-400 text-sm font-medium mb-4">PLACE YOUR BET</h3>
          <div className="space-y-4">
            <input
              type="number"
              value={betAmount || ''}
              onChange={handleBetChange}
              placeholder="Enter bet amount"
              className="w-full bg-zinc-900/50 px-4 py-3 rounded-lg font-mono text-emerald-400 border border-zinc-800 focus:outline-none focus:border-emerald-500/50"
            />
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {quickBets.map(bet => (
                <button
                  key={bet}
                  onClick={() => {
                    playClickSound();
                    setBetAmount(Math.min(bet, walletBalance));
                  }}
                  className="py-2 font-mono text-sm bg-zinc-900/50 text-zinc-400 border border-zinc-800 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
                >
                  {bet}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Game Settings */}
        <div className="p-6 space-y-6">
          {/* Grid Size */}
          <div>
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-3">
              <Grid className="w-4 h-4" />
              <h3 className="font-medium">GRID SIZE</h3>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {gridSizes.map(size => (
                <button
                  key={size}
                  onClick={() => {
                    playClickSound();
                    setGridSize(size);
                  }}
                  className={`p-3 rounded-lg font-mono text-sm border transition-colors ${
                    gridSize === size
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-emerald-500/5 hover:text-emerald-400'
                  }`}
                >
                  {size}×{size}
                </button>
              ))}
            </div>
          </div>

          {/* Mines */}
          <div>
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-3">
              <Bomb className="w-4 h-4" />
              <h3 className="font-medium">NUMBER OF MINES</h3>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {Array.from({ length: 8 }, (_, i) => i + 1).map(mines => (
                <button
                  key={mines}
                  onClick={() => {
                    playClickSound();
                    setBombs(mines);
                  }}
                  className={`p-3 rounded-lg font-mono text-sm border transition-colors ${
                    bombs === mines
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-emerald-500/5 hover:text-emerald-400'
                  }`}
                >
                  {mines}
                </button>
              ))}
            </div>
          </div>

          {/* Players */}
          <div>
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-3">
              <Users className="w-4 h-4" />
              <h3 className="font-medium">MINIMUM PLAYERS</h3>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {Array.from({ length: 7 }, (_, i) => i + 2).map(players => (
                <button
                  key={players}
                  onClick={() => {
                    playClickSound();
                    setMinPlayers(players);
                  }}
                  className={`p-3 rounded-lg font-mono text-sm border transition-colors ${
                    minPlayers === players
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-emerald-500/5 hover:text-emerald-400'
                  }`}
                >
                  {players}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="p-6 border-t border-zinc-800/50">
          <button
            onClick={() => {
              startGameSound.current.play();
              playGame(gridSize, bombs, minPlayers);
            }}
            disabled={!isConnected || betAmount <= 0 || betAmount > walletBalance}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500
              text-black font-bold py-3 rounded-lg transition-colors"
          >
            START GAME
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LobbyDetails);