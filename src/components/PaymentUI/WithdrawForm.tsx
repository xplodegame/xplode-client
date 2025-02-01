import React, { useState } from 'react';

interface WithdrawFormProps {
  onSubmit: (amount: string, address: string) => void;
  processingWithdraw: boolean;
}

export const WithdrawForm: React.FC<WithdrawFormProps> = ({
  onSubmit,
  processingWithdraw,
}) => {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && address) {
      onSubmit(amount, address);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="withdraw-amount" className="text-zinc-300 text-sm font-medium">
          Withdraw Amount (SOL)
        </label>
        <input
          id="withdraw-amount"
          type="number"
          step="0.000001"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={processingWithdraw}
          className="w-full py-2 px-3 rounded-lg font-medium bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200"
          placeholder="0.00"
          required
        />
      </div>

      <div>
        <label htmlFor="withdraw-address" className="text-zinc-300 text-sm font-medium">
          Solana Wallet Address
        </label>
        <input
          id="withdraw-address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={processingWithdraw}
          className="w-full py-2 px-3 rounded-lg font-medium bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200"
          placeholder="Enter your Solana wallet address"
          required
        />
      </div>

      <button
        type="submit"
        disabled={processingWithdraw}
        className={`w-full py-2 rounded-lg font-medium transition-all duration-200 ${
          processingWithdraw
            ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
        }`}
      >
        {processingWithdraw ? 'Processing...' : 'Withdraw Funds'}
      </button>
    </form>
  );
};