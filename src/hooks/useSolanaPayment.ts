import { useState, useEffect } from 'react';
import { PublicKey, Connection, Keypair, clusterApiUrl } from '@solana/web3.js';
import { encodeURL, findReference, validateTransfer, FindReferenceError } from '@solana/pay';
import BigNumber from 'bignumber.js';
import { MERCHANT_WALLET, PAYMENT_CONFIG } from '../config/payment.config';

interface UseSolanaPaymentProps {
  userId?: number;
  solAmount: string;
  onPaymentComplete: (balance: number) => void;
  onPaymentFailed: (error: string) => void;
}

export const useSolanaPayment = ({
  userId,
  solAmount,
  onPaymentComplete,
  onPaymentFailed
}: UseSolanaPaymentProps) => {
  const [reference, setReference] = useState<PublicKey | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [paymentURL, setPaymentURL] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [currentAmount, setCurrentAmount] = useState<string>(solAmount);

  useEffect(() => {
    setCurrentAmount(solAmount);
  }, [solAmount]);

  useEffect(() => {
    if (!reference || paymentStatus !== 'pending') return;

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    let interval: NodeJS.Timeout;

    const checkPayment = async () => {
      try {
        const signatureInfo = await findReference(connection, reference, { finality: 'confirmed' });
        console.log('Found signature:', signatureInfo.signature);

        await validateTransfer(
          connection,
          signatureInfo.signature,
          {
            recipient: MERCHANT_WALLET,
            amount: new BigNumber(currentAmount),
            reference
          },
          { commitment: 'confirmed' }
        );

        setPaymentStatus('validated');
        await verifyTransaction(signatureInfo.signature);
        setProcessingPayment(false);
        return true;
      } catch (error) {
        if (error instanceof FindReferenceError) {
          console.log('Waiting for transaction...');
          return false;
        }
        console.error('Payment validation error:', error);
        setPaymentStatus('failed');
        setProcessingPayment(false);
        onPaymentFailed(error instanceof Error ? error.message : 'Payment validation failed');
        return false;
      }
    };

    interval = setInterval(checkPayment, PAYMENT_CONFIG.PAYMENT_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [reference, paymentStatus, currentAmount]);

  const verifyTransaction = async (signature: string) => {
    try {
      if (!userId) {
        throw new Error("No user ID available");
      }

      const depositData = {
        user_id: userId,
        amount: Number(currentAmount),
        currency: "SOL",
        tx_type: "DEPOSIT",
        tx_hash: signature,
      };

      console.log('Sending deposit data:', depositData);

      const response = await fetch('http://localhost:8080/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(depositData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Deposit failed: ${errorText}`);
      }

      const result = await response.json();
      
      if (typeof result.balance === 'number') {
        onPaymentComplete(result.balance);
        setPaymentStatus('completed');
      } else {
        throw new Error('Invalid balance received from server');
      }
    } catch (err) {
      setPaymentStatus('failed');
      onPaymentFailed(err instanceof Error ? err.message : 'Failed to process deposit');
    }
  };

  const initiatePayment = async (amount: string) => {
    if (!amount || Number(amount) <= 0) {
      throw new Error("Please enter a valid amount");
    }

    try {
      setProcessingPayment(true);
      const newReference = Keypair.generate().publicKey;
      setReference(newReference);
      setCurrentAmount(amount);

      const url = encodeURL({
        recipient: MERCHANT_WALLET,
        amount: new BigNumber(amount),
        reference: newReference,
        label: PAYMENT_CONFIG.LABELS.GAME_DEPOSIT,
        message: PAYMENT_CONFIG.LABELS.DEPOSIT_MESSAGE,
        memo: `Game deposit for user ${userId}`
      });

      setPaymentURL(url.toString());
      setPaymentStatus('pending');
      return url.toString();
    } catch (error) {
      setProcessingPayment(false);
      throw error;
    }
  };

  const cancelPayment = () => {
    setPaymentStatus('failed');
    setProcessingPayment(false);
    setReference(null);
    onPaymentFailed('Payment cancelled by user');
  };

  return {
    paymentStatus,
    paymentURL,
    processingPayment,
    initiatePayment,
    cancelPayment,
  };
};