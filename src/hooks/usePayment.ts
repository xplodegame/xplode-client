import { useState } from "react";
import { useSolanaPayment } from "./useSolanaPayment";
import { useWithdraw } from "./useWithdraw";
import { useWalletStore } from "../stores/walletStore";

interface UsePaymentProps {
  userId?: number;
  tx_type?: string;
  gif_id?: number;
}

export const usePayment = ({ userId, tx_type, gif_id }: UsePaymentProps) => {
  const [solanaAmount, setSolanaAmount] = useState("");
  const setBalance = useWalletStore((state) => state.setBalance);

  const {
    paymentStatus,
    processingPayment,
    initiatePayment,
    cancelPayment,
    isWalletConnected,
  } = useSolanaPayment({
    userId,
    tx_type,
    gif_id,
    onPaymentComplete: (balance) => {
      setBalance(balance); // Update global store
      setSolanaAmount("");
    },
    onPaymentFailed: (error) => {
      console.error("Payment failed:", error);
    },
  });

  const { withdrawStatus, processingWithdraw, initiateWithdraw } = useWithdraw({
    userId,
    onWithdrawComplete: (balance) => {
      setBalance(balance); // Update global store
    },
    onWithdrawFailed: (error) => {
      console.error("Withdrawal failed:", error);
    },
  });

  const handlePayment = async () => {
    if (!solanaAmount || Number(solanaAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!isWalletConnected) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      await initiatePayment(solanaAmount, tx_type, gif_id);
    } catch (error) {
      console.error("Error initiating payment:", error);
      // if (error instanceof Error) {
      //   alert(`Error: ${error.message}`);
      // }
    }
  };

  const handleWithdraw = async (amount: string, withdrawAddress: string) => {
    try {
      await initiateWithdraw(amount, withdrawAddress);
    } catch (error) {
      console.error("Error initiating withdrawal:", error);
      // if (error instanceof Error) {
      //   alert(`Error: ${error.message}`);
      // }
    }
  };

  const handleCancelPayment = () => {
    cancelPayment();
  };

  return {
    solanaAmount,
    setSolanaAmount,
    handleCancelPayment,
    handlePayment,
    handleWithdraw,
    paymentStatus,
    withdrawStatus,
    processingPayment,
    processingWithdraw,
    isWalletConnected,
  };
};