import { usePrivy } from '@privy-io/react-auth';
import { Wallet } from 'lucide-react';
import { monadNetwork } from '../../chains';

export const WalletConnectButton = () => {
  const { connectWallet } = usePrivy();

  const switchToMonad = async () => {
    if (typeof window.ethereum === 'undefined') return;

    const monadChainHex = `0x${monadNetwork.id.toString(16)}`;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: monadChainHex }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added yet
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: monadChainHex,
            chainName: monadNetwork.name,
            nativeCurrency: monadNetwork.nativeCurrency,
            rpcUrls: monadNetwork.rpcUrls.default.http,
            blockExplorerUrls: [monadNetwork.blockExplorers?.default?.url || ''],
          }],
        });
      }
    }
  };

  const handleConnect = async () => {
    await connectWallet();
    await switchToMonad();
  };

  return (
    <button
      onClick={handleConnect}
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
