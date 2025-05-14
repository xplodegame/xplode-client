import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';
import { Wallet } from 'lucide-react';
import { useEffect } from 'react';

export const WalletConnectButton = () => {
  const { login, connectWallet, ready, authenticated, user } = usePrivy();
  const { wallets } = useSolanaWallets();

  // Log Privy state and connected wallets for debugging
  useEffect(() => {
    if (ready) {
      // console.log("Privy state:", { authenticated, userId: user?.id });
      console.log("Connected wallets:", wallets);
    }
  }, [ready, authenticated, user, wallets]);

  // Handle connecting a Solana wallet
  const handleConnectSolana = async () => {
    try {
      // First make sure user is logged in with Privy
      if (!authenticated) {
        console.log("User not authenticated, logging in first");
        await login();
      }
      
      // Connect specifically to a Solana wallet
      await connectWallet();
      
      console.log("Requested Solana wallet connection");
    } catch (error) {
      console.error("Error connecting Solana wallet:", error);
    }
  };

  return (
    <button
      onClick={handleConnectSolana}
      className="px-4 py-2 rounded-xl font-medium
                bg-gradient-to-r from-emerald-500/20 to-emerald-500/10
                text-emerald-400 border border-emerald-500/20
                hover:border-emerald-500/40 hover:from-emerald-500/30 
                transition-all duration-200 flex items-center gap-2"
    >
      <Wallet size={16} className="text-emerald-400" />
      <span>Connect Solana Wallet</span>
    </button>
  );
};