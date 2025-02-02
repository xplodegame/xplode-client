import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Wallet as WalletIcon, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { PaymentForm } from './PaymentForm';
import { WithdrawForm } from './WithdrawForm';
import { QRModal } from './QRModal';
import { usePayment } from '../../hooks/usePayment';

type StatusType = 'success' | 'error' | 'processing';
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
  const [walletBalance, setWalletBalance] = useState<number>(userData?.wallet_balance || 0);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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
  }, []);

  useEffect(() => {
    if (userData?.wallet_balance !== undefined) {
      setWalletBalance(userData.wallet_balance);
    }
  }, [userData?.wallet_balance]);

  const {
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
  } = usePayment({
    userId: userData?.id,
    depositAddress: userData?.deposit_address,
    onBalanceUpdate: (newBalance) => setWalletBalance(newBalance),
  });

  // Helper function to map status strings to StatusType
  const mapStatus = (status: string): StatusType => {
    if (status.toLowerCase().includes('completed')) return 'success';
    if (status.toLowerCase().includes('processing')) return 'processing';
    return 'error'; // Default to error if no matches
  };

  // Handle payment status updates
  useEffect(() => {
    if (paymentStatus) {
      setStatus({
        type: mapStatus(paymentStatus),
        message: paymentStatus,
      });
      const timer = setTimeout(() => setStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus]);

  // Handle withdrawal status updates
  useEffect(() => {
    if (withdrawStatus) {
      setStatus({
        type: mapStatus(withdrawStatus),
        message: withdrawStatus,
      });
      const timer = setTimeout(() => setStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [withdrawStatus]);

  // StatusMessage component to display status messages
  const StatusMessage = ({ status }: { status: StatusMessage }) => {
    const statusConfig = {
      success: {
        color: 'bg-green-500/10 text-green-400 border-green-500/30',
        icon: <CheckCircle size={16} className="text-green-400" />,
      },
      error: {
        color: 'bg-red-500/10 text-red-400 border-red-500/30',
        icon: <XCircle size={16} className="text-red-400" />,
      },
      processing: {
        color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        icon: <Loader2 size={16} className="text-blue-400 animate-spin" />,
      },
    };

    const currentStatus = statusConfig[status.type] || statusConfig.error;

    return (
      <div className={`flex items-center gap-2 p-3 rounded-lg border ${currentStatus.color} mb-4`}>
        {currentStatus.icon}
        <span className="text-sm">{status.message}</span>
      </div>
    );
  };

  return (
    <div className="relative flex items-center gap-2" ref={dropdownRef}>
      {/* Balance Display */}
      <div className="bg-zinc-800/30 px-4 py-2 rounded-lg border border-zinc-700/50">
        <p className="text-green-400 font-medium">
          {walletBalance.toFixed(2)} <span className="text-sm">SOL</span>
        </p>
      </div>

      {/* Wallet Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium 
                   bg-gradient-to-r from-green-500/10 to-teal-500/10 
                   hover:from-green-500/20 hover:to-teal-500/20
                   text-green-400 border border-green-500/30 
                   hover:border-green-500/50 transition-all duration-200"
      >
        <WalletIcon size={18} />
        <span>Wallet</span>
        {showDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Dropdown Panel */}
      {showDropdown && (
        <div className="absolute right-0 top-14 w-96 bg-zinc-900/95 backdrop-blur-lg rounded-xl 
                        shadow-2xl border border-zinc-800/50 p-6 space-y-6 z-50">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-green-400 to-teal-400 
                          bg-clip-text text-transparent">
              Wallet Management
            </h2>
          </div>

          {/* Status Message */}
          {status && <StatusMessage status={status} />}

          {/* Tab Navigation */}
          <div className="flex gap-2 p-1 bg-zinc-800/30 rounded-lg">
            <button
              onClick={() => setActiveTab('deposit')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200
                         ${activeTab === 'deposit' 
                           ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                           : 'text-zinc-400 hover:text-green-400'}`}
            >
              Deposit
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200
                         ${activeTab === 'withdraw' 
                           ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                           : 'text-zinc-400 hover:text-green-400'}`}
            >
              Withdraw
            </button>
          </div>

          {/* Forms */}
          <div className="mt-4">
            {activeTab === 'deposit' ? (
              <PaymentForm
                solAmount={solAmount}
                onAmountChange={setSolAmount}
                onSubmit={handlePayment}
                processingPayment={processingPayment}
              />
            ) : (
              <WithdrawForm
                onSubmit={handleWithdraw}
                processingWithdraw={processingWithdraw}
              />
            )}
          </div>
        </div>
      )}

      {/* QR Modal for Deposit */}
      {showQRModal && paymentURL && (
        <QRModal
          paymentURL={paymentURL}
          onClose={handleCloseModal}
          onCancel={handleCancelPayment}
          userData={userData}
        />
      )}
    </div>
  );
};