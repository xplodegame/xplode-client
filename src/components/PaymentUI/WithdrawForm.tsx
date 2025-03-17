import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { debounce } from 'lodash';

interface WithdrawFormProps {
  onSubmit: (amount: string, address: string) => void;
  processingWithdraw: boolean;
  wallet_balance: number;
}

export const WithdrawForm: React.FC<WithdrawFormProps> = ({
  onSubmit,
  processingWithdraw,
  wallet_balance
}) => {
  // Local states for immediate updates
  const [localAmount, setLocalAmount] = useState('');
  const [localAddress, setLocalAddress] = useState('');
  
  // Parent state updates
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');

  // Debounced handlers for parent state updates
  const debouncedSetAmount = useCallback(
    debounce((value: string) => {
      setAmount(value);
    }, 300),
    []
  );

  const debouncedSetAddress = useCallback(
    debounce((value: string) => {
      setAddress(value);
    }, 300),
    []
  );

  // Handle input changes
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalAmount(value); // Update local state immediately
    debouncedSetAmount(value); // Debounce the parent update
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalAddress(value); // Update local state immediately
    debouncedSetAddress(value); // Debounce the parent update
  };

  // Handle max button click
  const handleMaxButtonClick = () => {
    const maxAmount = wallet_balance.toString();
    setLocalAmount(maxAmount); // Update local state immediately
    setAmount(maxAmount); // Update parent state directly (no need for debounce here)
  };

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
          Withdraw Amount (MON)
        </label>
        <div className="relative">
          <input
            id="withdraw-amount"
            type="number"
            step="0.000001"
            min="0"
            value={localAmount}
            onChange={handleAmountChange}
            disabled={processingWithdraw}
            className="w-full py-3 px-4 rounded-lg font-medium 
                    bg-black/40 border border-emerald-500/20
                    text-emerald-400 placeholder-zinc-500
                    focus:outline-none focus:border-emerald-500
                    focus:ring-2 focus:ring-emerald-500/20
                    transition-all duration-200 backdrop-blur-sm
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="0.00"
            required
          />
          <button
            type="button"
            onClick={handleMaxButtonClick}
            disabled={processingWithdraw}
            className="absolute right-3 top-1/2 transform -translate-y-1/2
                    px-2 py-1 text-xs font-medium rounded
                    bg-emerald-500/20 text-emerald-400
                    hover:bg-emerald-500/30 transition-colors duration-200
                    border border-emerald-500/30 focus:outline-none"
          >
            MAX
          </button>
        </div>
        <div className="text-emerald-400/60 text-xs mt-1">
          Available: {wallet_balance} MON
        </div>
      </div>

      <div>
        <label htmlFor="withdraw-address" className="text-emerald-400 text-sm font-medium">
          Monad Wallet Address
        </label>
        <input
          id="withdraw-address"
          type="text"
          value={localAddress}
          onChange={handleAddressChange}
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