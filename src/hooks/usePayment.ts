// Modified usePayment.ts
import { useState } from 'react';
import { useSolanaPayment } from './useSolanaPayment';
import { useWithdraw } from './useWithdraw';
import { useWalletStore } from '../stores/walletStore';


interface UsePaymentProps {
  userId?: number;
  depositAddress?: string;
}

export const usePayment = ({ userId, depositAddress }: UsePaymentProps) => {
  const [solAmount, setSolAmount] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const setBalance = useWalletStore(state => state.setBalance);

  const {
    paymentStatus,
    paymentURL,
    processingPayment,
    initiatePayment,
    cancelPayment,
  } = useSolanaPayment({
    userId,
    solAmount,
    depositAddress,
    onPaymentComplete: (balance) => {
      setBalance(balance); // Update global store instead of local state
      setSolAmount('');
      setShowQRModal(false);
    },
    onPaymentFailed: (error) => {
      console.error('Payment failed:', error);
      setShowQRModal(false);
    },
  });

  const {
    withdrawStatus,
    processingWithdraw,
    initiateWithdraw,
  } = useWithdraw({
    userId,
    onWithdrawComplete: (balance) => {
      setBalance(balance); // Update global store instead of local state
    },
    onWithdrawFailed: (error) => {
      console.error('Withdrawal failed:', error);
    },
  });

  const handlePayment = async () => {
    if (!solAmount || Number(solAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      await initiatePayment(solAmount);
      setShowQRModal(true);
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

  const handleCloseModal = () => {
    setShowQRModal(false);
  };

  const handleCancelPayment = () => {
    cancelPayment();
    setShowQRModal(false);
  };

  return {
    solAmount,
    setSolAmount,
    showQRModal,
    handleCloseModal,
    handleCancelPayment,
    handlePayment,
    handleWithdraw,
    paymentStatus,
    withdrawStatus,
    paymentURL,
    processingPayment,
    processingWithdraw,
  };
};
