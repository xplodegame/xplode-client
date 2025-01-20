import { PublicKey } from '@solana/web3.js';

export const MERCHANT_WALLET = new PublicKey("8qE7XdQi5EweM3SBAmqAgNtUD6R9xgpyGt9dfataoqQb");

export const PAYMENT_CONFIG = {
  QR_WIDTH: 300,
  QR_HEIGHT: 300,
  COPY_TIMEOUT: 2000,
  PAYMENT_CHECK_INTERVAL: 1000,
  LABELS: {
    GAME_DEPOSIT: "Game Wallet Deposit",
    DEPOSIT_MESSAGE: "Deposit SOL to game wallet",
  }
};