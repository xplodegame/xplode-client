import React from 'react';
import { DollarSign } from 'lucide-react';

interface WalletBalanceProps {
  balance: number;
}

export const WalletBalance: React.FC<WalletBalanceProps> = ({ balance }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-emerald-400 mb-4 flex items-center gap-2">
        <DollarSign size={24} />
        Cashier
      </h2>
      <p className="text-zinc-400 mb-4">Manage your wallet and funds.</p>
      <p className="text-lg text-emerald-400 mb-4">Wallet Balance: {balance} SOL</p>
    </div>
  );
};