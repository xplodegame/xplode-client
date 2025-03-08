// src/config/chains.ts
import { Chain } from "wagmi/chains";

export const monadNetwork: Chain = {
  id: 10143, // Replace with correct Monad chain ID
  name: 'Monad',
  nativeCurrency: {
    name: 'Monad Testnet',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz/'], // Replace with appropriate Monad RPC URL
    },
    public: {
      http: ['https://testnet-rpc.monad.xyz/'], // Replace with appropriate Monad RPC URL
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://testnet.monadexplorer.com/', // Replace with Monad explorer URL
    },
  },
};
