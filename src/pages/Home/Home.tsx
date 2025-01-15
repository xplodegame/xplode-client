import React, { useState, useEffect } from 'react';
import { SignedIn } from '@clerk/clerk-react';
import { DollarSign } from 'lucide-react';
import { Connection, PublicKey, Keypair, clusterApiUrl } from '@solana/web3.js';
import { encodeURL, findReference, validateTransfer, FindReferenceError } from '@solana/pay';
import BigNumber from 'bignumber.js';
import { QRCode } from 'react-qr-code'; // Import QRCode from react-qr-code

function Home({ userData }: { 
  userData?: { 
    clerk_id: string; 
    email: string; 
    name: string; 
    profile_picture: string | null; 
    wallet_balance?: number;
    id?: number;
  } 
}) {
  const [walletBalance, setWalletBalance] = useState(userData?.wallet_balance || 0);
  const [userId, setUserId] = useState(userData?.id || null);
  const [reference, setReference] = useState<PublicKey | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [solAmount, setSolAmount] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentURL, setPaymentURL] = useState<string | null>(null);

  const MERCHANT_WALLET = new PublicKey("8qE7XdQi5EweM3SBAmqAgNtUD6R9xgpyGt9dfataoqQb");

  useEffect(() => {
    setWalletBalance(userData?.wallet_balance || 0);
  }, [userData]);

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
            amount: new BigNumber(solAmount),
            reference
          },
          { commitment: 'confirmed' }
        );

        setPaymentStatus('validated');
        await verifyTransaction(signatureInfo.signature);
        setProcessingPayment(false);
        clearInterval(interval);
      } catch (error) {
        if (error instanceof FindReferenceError) {
          console.log('Waiting for transaction...');
          return;
        }
        console.error('Payment validation error:', error);
        setPaymentStatus('failed');
        setProcessingPayment(false);
        clearInterval(interval);
      }
    };

    interval = setInterval(checkPayment, 1000);
    return () => clearInterval(interval);
  }, [reference, paymentStatus, solAmount]);

  const handlePayment = async () => {
    if (!solAmount || Number(solAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setProcessingPayment(true);
      const newReference = Keypair.generate().publicKey;
      setReference(newReference);

      const url = encodeURL({
        recipient: MERCHANT_WALLET,
        amount: new BigNumber(solAmount),
        reference: newReference,
        label: "Game Wallet Deposit",
        message: "Deposit SOL to game wallet",
        memo: `Game deposit for user ${userId}`
      });

      setPaymentURL(url.toString()); // Ensure the URL is a string

      setPaymentStatus('pending');
    } catch (error) {
      console.error("Error generating payment QR:", error);
      setProcessingPayment(false);
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const verifyTransaction = async (signature: string) => {
    try {
      const response = await fetch('http://localhost:8080/update-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          amount: Number(solAmount),
          transaction_signature: signature,
        }),
      });

      if (response.ok) {
        setWalletBalance(prevBalance => prevBalance + Number(solAmount));
        setPaymentStatus('completed');
        setSolAmount('');
      } else {
        setPaymentStatus('failed');
      }
    } catch (err) {
      console.error("Error during verification:", err);
      setPaymentStatus('failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-zinc-900 text-white">
      <SignedIn>
        <div className="container mx-auto px-4 py-16">
          <div className="bg-zinc-800/50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4 flex items-center gap-2">
              <DollarSign size={24} />
              Cashier
            </h2>
            <p className="text-zinc-400 mb-4">Manage your wallet and funds.</p>
            <p className="text-lg text-emerald-400 mb-4">Wallet Balance: {walletBalance} SOL</p>

            <div className="mb-4">
              <label htmlFor="solAmount" className="text-zinc-300 text-sm font-medium">
                Enter SOL Amount
              </label>
              <input
                type="number"
                id="solAmount"
                value={solAmount}
                onChange={(e) => setSolAmount(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                disabled={processingPayment}
                className="w-full py-3 px-4 rounded-lg font-medium bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200"
              />
            </div>

            <button
              onClick={handlePayment}
              disabled={processingPayment}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                processingPayment 
                  ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' 
                  : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
              }`}
            >
              {processingPayment ? 'Processing...' : 'Add Money to Wallet'}
            </button>

            {paymentStatus === 'pending' && (
              <div className="mt-6 flex flex-col items-center">
                <div className="bg-white p-4 rounded-lg" style={{ width: '512px', height: '512px', overflow: 'hidden' }}>
                  {paymentURL && (
                    <QRCode
                      value={paymentURL} // Ensure this is a string
                      size={512}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="H"
                      style={{ maxWidth: '100%', height: 'auto' }} // Ensure the QR code fits within the container
                    />
                  )}
                </div>
                <p className="text-zinc-400 mt-4">
                  Scan the QR code with your Solana wallet to complete the payment
                </p>
              </div>
            )}

            {paymentStatus === 'validated' && (
              <p className="text-emerald-400 mt-4">Payment validated! Processing transaction...</p>
            )}

            {paymentStatus === 'completed' && (
              <p className="text-emerald-400 mt-4">Payment completed successfully!</p>
            )}

            {paymentStatus === 'failed' && (
              <p className="text-red-400 mt-4">Payment failed. Please try again.</p>
            )}
          </div>
        </div>
      </SignedIn>
    </div>
  );
}

export default Home;