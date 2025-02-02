// WithdrawForm.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

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
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={handleSubmit} 
      className="space-y-4"
    >
      <div>
        <label htmlFor="withdraw-amount" className="text-emerald-400 text-sm font-medium">
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
          className="w-full py-3 px-4 rounded-lg font-medium 
                   bg-black/40 border border-emerald-500/20
                   text-emerald-400 placeholder-zinc-500
                   focus:outline-none focus:border-emerald-500
                   focus:ring-2 focus:ring-emerald-500/20
                   transition-all duration-200 backdrop-blur-sm"
          placeholder="0.00"
          required
        />
      </div>

      <div>
        <label htmlFor="withdraw-address" className="text-emerald-400 text-sm font-medium">
          Solana Wallet Address
        </label>
        <input
          id="withdraw-address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={processingWithdraw}
          className="w-full py-3 px-4 rounded-lg font-medium 
                   bg-black/40 border border-emerald-500/20
                   text-emerald-400 placeholder-zinc-500
                   focus:outline-none focus:border-emerald-500
                   focus:ring-2 focus:ring-emerald-500/20
                   transition-all duration-200 backdrop-blur-sm"
          placeholder="Enter your Solana wallet address"
          required
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={processingWithdraw}
        className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
          processingWithdraw
            ? 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 text-emerald-400 ' +
              'hover:from-emerald-500/30 hover:to-emerald-500/20 border border-emerald-500/30'
        }`}
      >
        {processingWithdraw ? 'Processing...' : 'Withdraw Funds'}
      </motion.button>
    </motion.form>
  );
};