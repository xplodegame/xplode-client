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
  processingPayment
}) => {
  return (
    <div>
      <div className="mb-4">
        <label htmlFor="solAmount" className="text-zinc-300 text-sm font-medium">
          Enter SOL Amount
        </label>
        <input
          type="number"
          id="solAmount"
          value={solAmount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0"
          min="0"
          step="0.01"
          disabled={processingPayment}
          className="w-full py-3 px-4 rounded-lg font-medium bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200"
        />
      </div>

      <button
        onClick={onSubmit}
        disabled={processingPayment}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          processingPayment 
            ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' 
            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
        }`}
      >
        {processingPayment ? 'Processing...' : 'Add Money to Wallet'}
      </button>
    </div>
  );
};