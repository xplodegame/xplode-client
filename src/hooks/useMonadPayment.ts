import { useState } from "react";
import { useSendTransaction } from "wagmi";
import { parseEther } from "viem";
import { useWallets } from "@privy-io/react-auth";

interface UseMonadPaymentProps {
  userId?: number;
  onPaymentComplete: (balance: number) => void;
  onPaymentFailed: (error: string) => void;
}

export const useMonadPayment = ({
  userId,
  onPaymentComplete,
  onPaymentFailed,
}: UseMonadPaymentProps) => {
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const { sendTransactionAsync } = useSendTransaction();

  // Use Privy's wallet hook to get the connected wallet
  const { wallets } = useWallets();
  const wallet = wallets[0]; // Assuming the first wallet is the one connected via Privy
  const walletAddress = wallet?.address;

  // This is the game's merchant wallet address where funds will be sent
  // const MERCHANT_WALLET_ADDRESS = '0xe86c30439a990d4e25eAB0f1C97F717968B74DE2';
  const MERCHANT_WALLET_ADDRESS = "0x48ec3462caE3A6D80106DFEDa648BD7a077adB3E";
  // const MERCHANT_WALLET_ADDRESS = '0x4EA4d2af92c3B24Bf832d378435046870Cc092E1';

  const initiatePayment = async (amount: string) => {
    if (!amount || Number(amount) <= 0) {
      throw new Error("Please enter a valid amount");
    }

    if (!walletAddress) {
      throw new Error("Wallet not connected");
    }

    if (!userId) {
      throw new Error("No user ID available");
    }

    try {
      setProcessingPayment(true);
      setPaymentStatus("processing");

      // Send native tokens (MONAD) to the merchant wallet
      const tx = await sendTransactionAsync({
        to: MERCHANT_WALLET_ADDRESS,
        value: parseEther(amount),
      });

      setPaymentStatus("confirming");

      // Once transaction is sent, notify the backend about the deposit
      await verifyTransaction(tx, amount);

      return tx;
    } catch (error) {
      setPaymentStatus("failed");
      onPaymentFailed(
        error instanceof Error ? error.message : "Failed to process payment"
      );
      throw error;
    } finally {
      setProcessingPayment(false);
    }
  };

  const verifyTransaction = async (txHash: string, amount: string) => {
    try {
      if (!userId) {
        throw new Error("No user ID available");
      }

      const depositData = {
        user_id: userId,
        amount: Number(amount),
        currency: "SOL",
        tx_type: "DEPOSIT",
        tx_hash: txHash,
      };

      console.log("Sending deposit data:", depositData);

      const response = await fetch("http://localhost:8080/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(depositData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Deposit failed: ${errorText}`);
      }

      const result = await response.json();

      if (typeof result.balance === "number") {
        onPaymentComplete(result.balance);
        setPaymentStatus("completed");
      } else {
        throw new Error("Invalid balance received from server");
      }
    } catch (err) {
      setPaymentStatus("failed");
      onPaymentFailed(
        err instanceof Error ? err.message : "Failed to process deposit"
      );
    }
  };

  const cancelPayment = () => {
    setPaymentStatus("cancelled");
    setProcessingPayment(false);
    onPaymentFailed("Payment cancelled by user");
  };

  return {
    paymentStatus,
    processingPayment,
    initiatePayment,
    cancelPayment,
    isWalletConnected: !!walletAddress, // Check if wallet is connected via Privy
  };
};
