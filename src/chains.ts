// src/config/chains.ts
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

export const solanaNetwork = {
  id: WalletAdapterNetwork.Devnet, // or WalletAdapterNetwork.Devnet for testnet
  name: 'Solana',
  nativeCurrency: {
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9,
  },
  rpcUrls: {
    default: clusterApiUrl(WalletAdapterNetwork.Devnet), // or WalletAdapterNetwork.Devnet for testnet
  },
  blockExplorers: {
    default: {
      name: 'Solana Explorer',
      url: 'https://explorer.solana.com',
    },
  },
};