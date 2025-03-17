import React, { useEffect, useRef, useState } from 'react';
import { X, Copy, CheckCheck, Diamond } from 'lucide-react';
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
    privy_id: string; 
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
      width: 300,
      height: 300,
      type: "svg",
      data: paymentURL,
      image: "/assets/images/sol-logo.svg",
      dotsOptions: {
        color: "#34d399",
        type: "rounded",
        gradient: {
          type: "radial",
          colorStops: [
            { offset: 0, color: "#34d399" },
            { offset: 1, color: "#059669" }
          ]
        }
      },
      backgroundOptions: {
        color: "transparent",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 0
      },
      cornersSquareOptions: {
        type: "extra-rounded",
        color: "#059669"
      },
      cornersDotOptions: {
        type: "dot",
        color: "#34d399"
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
        {/* Cosmic backdrop */}
        <div className="fixed inset-0 backdrop-blur-xl bg-black/40 animate-in fade-in duration-500" />
        
        {/* Animated background elements */}
        <div className="fixed inset-0">
          <div className="absolute top-1/4 right-1/4 w-[800px] h-[800px] bg-emerald-500/10 blur-[150px] rounded-full animate-pulse-slow" />
          <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/15 blur-[120px] rounded-full animate-pulse-slow" />
        </div>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-black/60 rounded-3xl overflow-hidden backdrop-blur-2xl animate-modal border border-emerald-500/20">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 z-10 p-2 rounded-full 
                       bg-emerald-500/10 hover:bg-emerald-500/20 
                       transition-all duration-200"
            >
              <X size={20} className="text-emerald-400" />
            </button>

            <div className="p-8 relative">
              {/* Header */}
              <div className="flex items-center gap-2 mb-6">
                <Diamond className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xl font-bold text-white">Cosmic Payment Portal</h3>
              </div>

              {/* QR Code Container */}
              <div className="relative mb-6">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/30 to-emerald-500/0 rounded-3xl blur-2xl" />
                <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20">
                  <div ref={qrRef} className="w-[300px] h-[300px] mx-auto transform transition-all duration-500 hover:scale-105" />
                </div>
              </div>

              {/* Wallet Address Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-emerald-400">Merchant Address</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/50 to-transparent" />
                </div>
                
                <div className="flex items-center gap-2 bg-black/40 rounded-xl p-3 border border-emerald-500/20">
                  <code className="text-sm text-zinc-300 flex-1 overflow-hidden text-ellipsis">
                    {paymentConfig.MERCHANT_WALLET.toString()}
                  </code>
                  <button
                    onClick={copyToClipboard}
                    className="p-1.5 hover:bg-emerald-500/10 rounded-lg transition-colors duration-200"
                    title="Copy address"
                  >
                    {copied ? (
                      <CheckCheck size={16} className="text-emerald-400" />
                    ) : (
                      <Copy size={16} className="text-emerald-400/70" />
                    )}
                  </button>
                </div>
              </div>

              {/* Footer Text */}
              <p className="mt-4 text-center text-sm text-emerald-400/60">
                Scan with your Solana wallet or copy the address to complete your cosmic transaction
              </p>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};