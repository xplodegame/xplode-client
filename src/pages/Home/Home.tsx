import React, { useState, useEffect, useRef } from 'react';
import { SignedIn } from '@clerk/clerk-react';
import { DollarSign, X, Copy, CheckCheck } from 'lucide-react';
import { Connection, PublicKey, Keypair, clusterApiUrl } from '@solana/web3.js';
import { encodeURL, createQR, findReference, validateTransfer, FindReferenceError } from '@solana/pay';
import BigNumber from 'bignumber.js';
import QRCodeStyling from 'qr-code-styling';

function Home({ userData }: { 
  userData?: { 
    clerk_id: string; 
    email: string; 
    name: string | null; 
    wallet_balance?: number | null;
    id?: number;
  } 
}) {
  const [walletBalance, setWalletBalance] = useState(userData?.wallet_balance || 0);
  const [userId, setUserId] = useState(userData?.id || undefined);
  const [reference, setReference] = useState<PublicKey | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [solAmount, setSolAmount] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentURL, setPaymentURL] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const [currency, setCurrency] = useState('SOL');  // Add currency state
  const [error, setError] = useState<string | null>(null);

  const MERCHANT_WALLET = new PublicKey("8qE7XdQi5EweM3SBAmqAgNtUD6R9xgpyGt9dfataoqQb");

  useEffect(() => {
    setWalletBalance(userData?.wallet_balance || 0);
  }, [userData]);

  useEffect(() => {
    setUserId(userData?.id);
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
        setShowQRModal(false);
        clearInterval(interval);
      } catch (error) {
        if (error instanceof FindReferenceError) {
          console.log('Waiting for transaction...');
          return;
        }
        console.error('Payment validation error:', error);
        setPaymentStatus('failed');
        setProcessingPayment(false);
        setShowQRModal(false);
        clearInterval(interval);
      }
    };

    interval = setInterval(checkPayment, 1000);
    return () => clearInterval(interval);
  }, [reference, paymentStatus, solAmount]);

  useEffect(() => {
    if (paymentURL && qrRef.current) {
      qrRef.current.innerHTML = '';

      const qrCode = new QRCodeStyling({
        width: 300,
        height: 300,
        type: "svg",
        data: paymentURL,
        image: "/assets/images/sol-logo.svg",
        dotsOptions: {
          color: "#ffffff",
          type: "dots",
          gradient: {
            type: "radial",
            colorStops: [
              { offset: 0, color: "#22d3ee" },
              { offset: 1, color: "#0ea5e9" }
            ]
          }
        },
        backgroundOptions: {
          color: "transparent",
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 0,
          imageSize: 0.2
        },
        cornersSquareOptions: {
          type: "extra-rounded",
          color: "#0ea5e9"
        },
        cornersDotOptions: {
          type: "dot",
          color: "#22d3ee"
        }
      });

      qrCode.append(qrRef.current);
    }
  }, [paymentURL]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(MERCHANT_WALLET.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

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

      setPaymentURL(url.toString());
      setPaymentStatus('pending');
      setShowQRModal(true);
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
      // First, ensure we have a valid user ID
      if (!userId) {
        console.error("No user ID available");
        setPaymentStatus('failed');
        return;
      }

      // Convert userId to string since backend expects TEXT
      const depositData = {
        user_id: userId,
        amount: Number(solAmount),
        currency: "SOL",
        tx_type: "DEPOSIT",
        tx_hash: signature,
      };

      console.log('Sending deposit request:', depositData);

      const response = await fetch('http://localhost:8080/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(depositData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Deposit failed:', errorText);
        throw new Error(`Deposit failed: ${errorText}`);
      }

      const result = await response.json();
      console.log('Deposit result:', result);
      
      // Update balance from the server response
      if (typeof result.balance === 'number') {
        setWalletBalance(result.balance);
        setPaymentStatus('completed');
        setSolAmount('');
      } else {
        throw new Error('Invalid balance received from server');
      }
    } catch (err) {
      console.error("Error during deposit verification:", err);
      setPaymentStatus('failed');
      alert(err instanceof Error ? err.message : 'Failed to process deposit');
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

            {showQRModal && (
              <div className="fixed inset-0 z-50">
                <div className="absolute inset-0 backdrop-blur-xl bg-black/30 animate-in fade-in duration-500" />
                
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute inset-0 bg-gradient-conic from-sky-500 via-cyan-300 to-sky-500 animate-spin-slow" 
                       style={{ '--tw-gradient-stops': 'var(--tw-gradient-from) 0%, var(--tw-gradient-via) 50%, var(--tw-gradient-to) 100%' } as React.CSSProperties} />
                </div>

                <div className="relative h-full flex items-center justify-center p-4">
                  <div className="relative bg-zinc-900/50 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl animate-modal border border-white/10 group">
                    <button
                      onClick={() => {
                        setShowQRModal(false);
                        setPaymentStatus('failed');
                        setProcessingPayment(false);
                      }}
                      className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-200 group-hover:opacity-100 opacity-60"
                    >
                      <X size={20} className="transform transition-transform hover:rotate-90" />
                    </button>

                    <div className="p-8 relative flex flex-col items-center justify-center">
                      <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-sky-500/30 via-cyan-300/30 to-transparent blur-2xl rounded-full animate-pulse-slow" />
                      
                      <div className="relative flex flex-col items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 to-cyan-300/20 blur-xl rounded-2xl transform -rotate-6 scale-105" />
                        
                        <div className="relative bg-zinc-900/50 rounded-2xl p-6 backdrop-blur-sm transform transition-transform duration-300 hover:scale-102 border border-white/5 flex flex-col items-center justify-center">
                          <div ref={qrRef} className="w-[300px] h-[300px] transform transition-all duration-500 hover:scale-105 hover:rotate-1" />
                        </div>
                      </div>

                      <div className="mt-6 bg-zinc-900/50 rounded-xl p-4 border border-white/5 backdrop-blur-sm">
                        <p className="text-sm text-zinc-400/80 mb-2">Merchant Address</p>
                        <div className="flex items-center gap-2 bg-zinc-950/50 rounded-lg p-3 border border-white/5">
                          <code className="text-xs text-white/70 flex-1 overflow-hidden text-ellipsis">
                            {MERCHANT_WALLET.toString()}
                          </code>
                          <button
                            onClick={copyToClipboard}
                            className="p-1.5 hover:bg-white/5 rounded-md transition-colors duration-200"
                            title="Copy address"
                          >
                            {copied ? (
                              <CheckCheck size={16} className="text-emerald-400" />
                            ) : (
                              <Copy size={16} className="text-white/70" />
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="mt-4 text-center text-sm text-zinc-400/80 font-light">
                        Scan with your Solana wallet or copy the address to complete payment
                      </p>
                    </div>
                  </div>
                </div>
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