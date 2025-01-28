// Modified usePayment.ts
import { useState } from 'react';
import { useSolanaPayment } from './useSolanaPayment';
import { useWithdraw } from './useWithdraw';

interface UsePaymentProps {
  userId?: number;
  onBalanceUpdate: (balance: number) => void;
  depositAddress?: string;
}

export const usePayment = ({ userId, onBalanceUpdate, depositAddress }: UsePaymentProps) => {
  const [solAmount, setSolAmount] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);

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
      onBalanceUpdate(balance);
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
      onBalanceUpdate(balance);
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
