import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { debounce } from 'lodash';

export const PaymentForm: React.FC<PaymentFormProps> = ({
  solAmount,
  onAmountChange,
  onSubmit,
  processingPayment,
}) => {
  // Local state for immediate updates
  const [localAmount, setLocalAmount] = useState(solAmount);

  // Debounce the parent state update
  const debouncedAmountChange = useCallback(
    debounce((value: string) => {
      onAmountChange(value);
    }, 300),
    [onAmountChange]
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalAmount(value); // Update local state immediately
    debouncedAmountChange(value); // Debounce the parent update
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="solAmount" className="block text-emerald-400 text-sm font-medium mb-2">
          Amount (SOL)
        </label>
        <div className="relative">
          <input
            type="number"
            id="solAmount"
            value={localAmount} // Use controlled input with local state
            onChange={handleInputChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            disabled={processingPayment}
            className="w-full py-3 px-4 rounded-lg font-medium
                     bg-black/40 border border-emerald-500/20
                     text-emerald-400 placeholder-zinc-500
                     focus:outline-none focus:border-emerald-500
                     focus:ring-2 focus:ring-emerald-500/20
                     transition-all duration-200 backdrop-blur-sm
                     appearance-none"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400/50">
            {/* SOL */}
          </span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onSubmit}
        disabled={processingPayment}
        className={`w-full py-3 rounded-lg font-medium transition-all duration-200
                   ${processingPayment
                     ? 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed'
                     : 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 text-emerald-400 ' +
                       'hover:from-emerald-500/30 hover:to-emerald-500/20 border border-emerald-500/30'}`}
      >
        {processingPayment ? 'Processing...' : 'Add Funds'}
      </motion.button>
    </div>
  );
};