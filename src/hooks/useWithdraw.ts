// src/hooks/useWithdraw.ts
import { useState } from 'react';

interface UseWithdrawProps {
  userId?: number;
  onWithdrawComplete: (balance: number) => void;
  onWithdrawFailed: (error: string) => void;
}

export const useWithdraw = ({
  userId,
  onWithdrawComplete,
  onWithdrawFailed,
}: UseWithdrawProps) => {
  const [withdrawStatus, setWithdrawStatus] = useState<string>('');
  const [processingWithdraw, setProcessingWithdraw] = useState(false);

  const initiateWithdraw = async (amount: string, withdrawAddress: string) => {
    if (!amount || Number(amount) <= 0) {
      throw new Error("Please enter a valid amount");
    }

    if (!userId) {
      throw new Error("No user ID available");
    }

    try {
      setProcessingWithdraw(true);
      setWithdrawStatus('processing');

      const withdrawData = {
        user_id: userId,
        amount: Number(amount),
        currency: "SOL",
        withdraw_address: withdrawAddress,
      };

      const response = await fetch('http://localhost:8080/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(withdrawData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Withdrawal failed: ${errorText}`);
      }

      const result = await response.json();
      
      if (typeof result.balance === 'number') {
        onWithdrawComplete(result.balance);
        setWithdrawStatus('completed');
      } else {
        throw new Error('Invalid balance received from server');
      }
    } catch (error) {
      setWithdrawStatus('failed');
      onWithdrawFailed(error instanceof Error ? error.message : 'Failed to process withdrawal');
    } finally {
      setProcessingWithdraw(false);
    }
  };

  return {
    withdrawStatus,
    processingWithdraw,
    initiateWithdraw,
  };
};
