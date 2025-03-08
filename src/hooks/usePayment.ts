import { useState } from 'react';
import { useMonadPayment } from './useMonadPayment';
import { useWithdraw } from './useWithdraw';
import { useWalletStore } from '../stores/walletStore';

interface UsePaymentProps {
  userId?: number;
  depositAddress?: string;
}

export const usePayment = ({ userId, depositAddress }: UsePaymentProps) => {
  const [monadAmount, setMonadAmount] = useState('');
  const setBalance = useWalletStore(state => state.setBalance);

  const {
    paymentStatus,
    processingPayment,
    initiatePayment,
    cancelPayment,
    isWalletConnected,
  } = useMonadPayment({
    userId,
    onPaymentComplete: (balance) => {
      setBalance(balance); // Update global store
      setMonadAmount('');
    },
    onPaymentFailed: (error) => {
      console.error('Payment failed:', error);
    },
  });

  const {
    withdrawStatus,
    processingWithdraw,
    initiateWithdraw,
  } = useWithdraw({
    userId,
    onWithdrawComplete: (balance) => {
      setBalance(balance); // Update global store
    },
    onWithdrawFailed: (error) => {
      console.error('Withdrawal failed:', error);
    },
  });

  const handlePayment = async () => {
    if (!monadAmount || Number(monadAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!isWalletConnected) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      await initiatePayment(monadAmount);
    } catch (error) {
      console.error("Error initiating payment:", error);
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleWithdraw = async (amount: string, withdrawAddress: string) => {
    try {
      await initiateWithdraw(amount, withdrawAddress);
    } catch (error) {
      console.error("Error initiating withdrawal:", error);
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleCancelPayment = () => {
    cancelPayment();
  };

  return {
    monadAmount,
    setMonadAmount,
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