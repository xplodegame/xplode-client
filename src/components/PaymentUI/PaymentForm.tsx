// PaymentForm.tsx
import React from 'react';

interface PaymentFormProps {
  solAmount: string;
  onAmountChange: (amount: string) => void;
  onSubmit: () => void;
  processingPayment: boolean;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  solAmount,
  onAmountChange,
  onSubmit,
  processingPayment,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="solAmount" className="block text-zinc-400 text-sm font-medium mb-2">
          Amount (SOL)
        </label>
        <div className="relative">
          <input
            type="number"
            id="solAmount"
            value={solAmount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            disabled={processingPayment}
            className="w-full py-3 px-4 rounded-lg font-medium
                     bg-zinc-800/50 border border-zinc-700
                     text-emerald-400 placeholder-zinc-500
                     focus:outline-none focus:border-emerald-500
                     focus:ring-2 focus:ring-emerald-500/20
                     transition-all duration-200
                     appearance-none"
          />
          <style>
            {`
              /* Hide the default number input spinners */
              input[type=number]::-webkit-inner-spin-button,
              input[type=number]::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
              }
            `}
          </style>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">
            SOL
          </span>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={processingPayment}
        className={`w-full py-3 rounded-lg font-medium transition-all duration-200
                   ${processingPayment
                     ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                     : 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-400 ' +
                       'hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/30'}`}
      >
        {processingPayment ? 'Processing...' : 'Add Funds'}
      </button>
    </div>
  );
};
