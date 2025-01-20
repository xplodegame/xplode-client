import { PublicKey } from '@solana/web3.js';

export const MERCHANT_WALLET = new PublicKey("8qE7XdQi5EweM3SBAmqAgNtUD6R9xgpyGt9dfataoqQb");

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};