import { usePrivy } from '@privy-io/react-auth';
import { Wallet } from 'lucide-react';

export const WalletConnectButton = () => {
  const { connectWallet } = usePrivy();

  return (
    <button
      onClick={connectWallet}
      className="px-4 py-2 rounded-xl font-medium
                bg-gradient-to-r from-emerald-500/20 to-emerald-500/10
                text-emerald-400 border border-emerald-500/20
                hover:border-emerald-500/40 hover:from-emerald-500/30 
                transition-all duration-200 flex items-center gap-2"
    >
      <Wallet size={16} className="text-emerald-400" />
      <span>Connect Wallet</span>
    </button>
  );
};