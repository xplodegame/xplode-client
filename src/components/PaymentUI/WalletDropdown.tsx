import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Wallet as WalletIcon, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { PaymentForm } from './PaymentForm';
import { WithdrawForm } from './WithdrawForm';
import { usePayment } from '../../hooks/usePayment';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore } from '../../stores/walletStore';
import { useAccount } from 'wagmi';

type StatusType = 'success' | 'error' | 'processing' | null;
interface StatusMessage {
  type: StatusType;
  message: string;
}

interface WalletDropdownProps {
  userData?: {
    id?: number;
    deposit_address?: string;
    wallet_balance: number;
    clerk_id: string;
    email: string;
    name: string | null;
  };
}

export const WalletDropdown: React.FC<WalletDropdownProps> = ({ userData }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('deposit');
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const walletBalance = useWalletStore(state => state.balance);
  const { isConnected } = useAccount();

  const {
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
  } = usePayment({
    userId: userData?.id,
    depositAddress: userData?.deposit_address
  });

  useEffect(() => {
    const mapStatus = (status: string): StatusType => {
      if (status.toLowerCase().includes('completed')) return 'success';
      if (status.toLowerCase().includes('processing') || status.toLowerCase().includes('confirming')) return 'processing';
      if (status.toLowerCase().includes('failed') || status.toLowerCase().includes('error')) return 'error';
      return null;
    };

    if (paymentStatus) {
      setStatus({
        type: mapStatus(paymentStatus),
        message: paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)
      });
      const timer = setTimeout(() => setStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus]);

  useEffect(() => {
    const mapStatus = (status: string): StatusType => {
      if (status.toLowerCase().includes('completed')) return 'success';
      if (status.toLowerCase().includes('processing')) return 'processing';
      if (status.toLowerCase().includes('failed') || status.toLowerCase().includes('error')) return 'error';
      return null;
    };

    if (withdrawStatus) {
      setStatus({
        type: mapStatus(withdrawStatus),
        message: withdrawStatus.charAt(0).toUpperCase() + withdrawStatus.slice(1)
      });
      const timer = setTimeout(() => setStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [withdrawStatus]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const StatusMessage = ({ status }: { status: StatusMessage }) => {
    const statusConfig = {
      success: {
        color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        icon: <CheckCircle size={16} className="text-emerald-400" />
      },
      error: {
        color: 'bg-red-500/10 text-red-400 border-red-500/30',
        icon: <XCircle size={16} className="text-red-400" />
      },
      processing: {
        color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        icon: <Loader2 size={16} className="text-emerald-400 animate-spin" />
      }
    };
  
    // Add null check and default to error state if type is invalid
    const currentStatus = statusConfig[status.type] || statusConfig.error;
  
    return (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-center gap-2 p-3 rounded-lg border ${currentStatus.color} mb-4`}
      >
        {currentStatus.icon}
        <span className="text-sm">{status.message}</span>
      </motion.div>
    );
  };

  return (
    <div className="relative flex items-center gap-2" ref={dropdownRef}>
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-emerald-500/20"
      >
        <p className="text-emerald-400 font-medium">
          {walletBalance.toFixed(2)} <span className="text-sm">MONAD</span>
        </p>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium 
                   bg-gradient-to-r from-emerald-500/10 to-emerald-500/5
                   hover:from-emerald-500/20 hover:to-emerald-500/10
                   text-emerald-400 border border-emerald-500/20 
                   backdrop-blur-sm transition-all duration-200"
      >
        <WalletIcon size={18} />
        <span>Wallet</span>
        {showDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </motion.button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-14 w-96 bg-black/95 backdrop-blur-xl rounded-xl 
                      shadow-2xl border border-emerald-500/20 p-6 space-y-6 z-50"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-emerald-400 to-emerald-500 
                            bg-clip-text text-transparent">
                Wallet Management
              </h2>
            </div>

            {!isConnected && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg mb-4"
              >
                <p className="text-sm">Please connect your wallet to make deposits</p>
              </motion.div>
            )}

            <AnimatePresence>
              {status && <StatusMessage status={status} />}
            </AnimatePresence>

            <motion.div 
              className="flex gap-2 p-1 bg-black/40 rounded-lg backdrop-blur-sm border border-emerald-500/10"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('deposit')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200
                           ${activeTab === 'deposit' 
                             ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                             : 'text-zinc-400 hover:text-emerald-400'}`}
              >
                Deposit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('withdraw')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200
                           ${activeTab === 'withdraw' 
                             ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                             : 'text-zinc-400 hover:text-emerald-400'}`}
              >
                Withdraw
              </motion.button>
            </motion.div>

            <div className="mt-4">
              <AnimatePresence mode="wait">
                {activeTab === 'deposit' ? (
                  <PaymentForm
                    monadAmount={monadAmount}
                    onAmountChange={setMonadAmount}
                    onSubmit={handlePayment}
                    processingPayment={processingPayment}
                    isWalletConnected={isConnected}
                  />
                ) : (
                  <WithdrawForm
                    onSubmit={handleWithdraw}
                    processingWithdraw={processingWithdraw}
                    wallet_balance={walletBalance}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};