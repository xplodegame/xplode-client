// Updated QRModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import { X, Copy, CheckCheck } from 'lucide-react';
import QRCodeStyling from 'qr-code-styling';
import { getPaymentConfig } from '../../config/payment.config';
import { ModalPortal } from './ModalPortal';

interface QRModalProps {
  paymentURL: string;
  onClose: () => void;
  onCancel: () => void;
  userData?: { 
    deposit_address?: string;
    id?: number;
    clerk_id: string; 
    email: string; 
    name: string | null; 
    wallet_balance: number;
  };
}

export const QRModal: React.FC<QRModalProps> = ({ 
  paymentURL, 
  onClose, 
  onCancel, 
  userData 
}) => {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  
  const paymentConfig = userData?.deposit_address 
    ? getPaymentConfig(userData.deposit_address) 
    : null;

  useEffect(() => {
    if (!paymentURL || !qrRef.current || !paymentConfig) return;
    
    qrRef.current.innerHTML = '';

    const qrCode = new QRCodeStyling({
      width: paymentConfig.QR_WIDTH,
      height: paymentConfig.QR_HEIGHT,
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
  }, [paymentURL, paymentConfig]);

  const copyToClipboard = async () => {
    if (!paymentConfig) return;
    
    try {
      await navigator.clipboard.writeText(paymentConfig.MERCHANT_WALLET.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), paymentConfig.COPY_TIMEOUT);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClose = () => {
    onCancel();
    onClose();
  };

  if (!paymentConfig) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[9999]">
        <div className="fixed inset-0 backdrop-blur-xl bg-black/30 animate-in fade-in duration-500" />
        
        <div className="fixed inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-conic from-sky-500 via-cyan-300 to-sky-500 animate-spin-slow" 
               style={{ '--tw-gradient-stops': 'var(--tw-gradient-from) 0%, var(--tw-gradient-via) 50%, var(--tw-gradient-to) 100%' } as React.CSSProperties} />
        </div>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="relative bg-zinc-900/50 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl animate-modal border border-white/10 group">
            <button
              onClick={handleClose}
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
                    {paymentConfig.MERCHANT_WALLET.toString()}
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
    </ModalPortal>
  );
};