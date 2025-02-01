import React, { useState } from 'react';
import { PaymentForm } from './PaymentForm';
import { WithdrawForm } from './WithdrawForm';
import { WalletBalance } from './WalletBalance';
import { QRModal } from './QRModal';
import { PaymentStatus } from './PaymentStatus';
import { usePayment } from '../../hooks/usePayment';

interface WalletProps {
  userData?: {
    id?: number;
    deposit_address?: string;
    wallet_balance: number;
    clerk_id: string;
    email: string;
    name: string | null;
  };
}

export const Wallet: React.FC<WalletProps> = ({ userData }) => {
  const [walletBalance, setWalletBalance] = useState<number>(userData?.wallet_balance || 0);

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
    <div className="bg-zinc-800/50 p-6 rounded-lg">
      <WalletBalance balance={walletBalance} />
      
      <PaymentForm
        solAmount={solAmount}
        onAmountChange={setSolAmount}
        onSubmit={handlePayment}
        processingPayment={processingPayment}
      />

      <WithdrawForm
        onSubmit={handleWithdraw}
        processingWithdraw={processingWithdraw}
      />

      {showQRModal && paymentURL && (
        <QRModal
          paymentURL={paymentURL}
          onClose={handleCloseModal}
          onCancel={handleCancelPayment}
          userData={userData}
        />
      )}

      <PaymentStatus status={paymentStatus || withdrawStatus} />
    </div>
  );
};