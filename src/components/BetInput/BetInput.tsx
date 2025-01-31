import React from 'react';

interface BetInputProps {
  betAmount: number;
  setBetAmount: (amount: number) => void;
  playGame: () => void;
  isConnected: boolean;
}

const BetInput: React.FC<BetInputProps> = ({ 
  betAmount, 
  setBetAmount, 
  playGame, 
  isConnected 
}) => {
  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBetAmount(value === "" ? 0 : Number(value));
  };

  return (
    <div className="flex flex-col space-y-6 bg-zinc-900/50 p-8 rounded-xl border border-zinc-800 shadow-lg">
      <div className="flex flex-col space-y-3">
        <label htmlFor="betAmount" className="text-zinc-300 text-sm font-medium">
          Enter Bet Amount
        </label>
        <div className="relative">
          <input
            type="number"
            id="betAmount"
            value={betAmount === 0 ? "" : betAmount}
            onChange={handleBetChange}
            placeholder="0"
            min="0"
            step="1"
            className="w-full py-3 px-4 pl-10 rounded-lg font-medium bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500">
            ₹
          </span>
        </div>
      </div>
      <button
        onClick={playGame}
        disabled={!isConnected || betAmount <= 0}
        className={`
          w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200
          bg-gradient-to-r from-emerald-500 to-teal-500 text-white
          hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-emerald-500/50
        `}
      >
        Start Game
      </button>
    </div>
  );
};

export default React.memo(BetInput);