import React, { useState, useEffect } from 'react';
import { PaymentForm } from './PaymentForm';
import { WithdrawForm } from './WithdrawForm';
import { WalletBalance } from './WalletBalance';
import { QRModal } from './QRModal';
import { PaymentStatus } from './PaymentStatus';
import { usePayment } from '../../hooks/usePayment';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
  const [walletBalance, setWalletBalance] = useState<number>(userData?.wallet_balance || 0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  // Sync walletBalance with userData.wallet_balance
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
    onBalanceUpdate: (newBalance) => {
      setWalletBalance(newBalance);
    },
  });

  return (
    <div className="relative">
      {/* Wallet Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-zinc-800/50 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800/80 border border-zinc-800/50 hover:border-emerald-500/30"
      >
        <span>Wallet</span>
        {showDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Dropdown Content */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-zinc-900 rounded-lg shadow-lg border border-zinc-800/50 z-50">
          <div className="p-6">
            {/* Wallet Balance */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-emerald-400 mb-2">Cashier</h2>
              <p className="text-zinc-400 mb-4">Manage your wallet and funds.</p>
              <div className="bg-zinc-800/50 p-4 rounded-lg">
                <p className="text-lg text-emerald-400">Wallet Balance: {walletBalance} SOL</p>
              </div>
            </div>

            {/* Deposit Section */}
            <div className="mb-6">
              <button
                onClick={() => setShowDeposit(!showDeposit)}
                className="w-full flex items-center justify-between py-3 px-4 rounded-lg font-medium bg-zinc-800/50 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800/80 border border-zinc-800/50 hover:border-emerald-500/30 transition-all duration-200"
              >
                <span>Deposit Funds</span>
                {showDeposit ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showDeposit && (
                <div className="mt-4">
                  <PaymentForm
                    solAmount={solAmount}
                    onAmountChange={setSolAmount}
                    onSubmit={handlePayment}
                    processingPayment={processingPayment}
                  />
                </div>
              )}
            </div>

            {/* Withdraw Section */}
            <div>
              <button
                onClick={() => setShowWithdraw(!showWithdraw)}
                className="w-full flex items-center justify-between py-3 px-4 rounded-lg font-medium bg-zinc-800/50 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800/80 border border-zinc-800/50 hover:border-emerald-500/30 transition-all duration-200"
              >
                <span>Withdraw Funds</span>
                {showWithdraw ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showWithdraw && (
                <div className="mt-4">
                  <WithdrawForm
                    onSubmit={handleWithdraw}
                    processingWithdraw={processingWithdraw}
                  />
                </div>
              )}
            </div>
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

      {/* Payment/Withdrawal Status */}
      <PaymentStatus status={paymentStatus || withdrawStatus} />
    </div>
  );
};