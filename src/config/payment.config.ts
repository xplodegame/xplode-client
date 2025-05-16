import { PublicKey } from "@solana/web3.js";

export const getPaymentConfig = (depositAddress: string | undefined) => {
  if (!depositAddress) {
    return null; // Return null instead of throwing
  }

  return {
    MERCHANT_WALLET: new PublicKey(depositAddress),
    QR_WIDTH: 300,
    QR_HEIGHT: 300,
    COPY_TIMEOUT: 2000,
    PAYMENT_CHECK_INTERVAL: 1000,
    LABELS: {
      GAME_DEPOSIT: "Game Wallet Deposit",
      DEPOSIT_MESSAGE: "Deposit SOL to game wallet",
    },
  };
};
