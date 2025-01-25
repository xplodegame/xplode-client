import { useState, useEffect } from 'react';
import { SignedIn } from '@clerk/clerk-react';
import { WalletBalance } from '../../components/PaymentUI/WalletBalance';
import { PaymentForm } from '../../components/PaymentUI/PaymentForm';
import { PaymentStatus } from '../../components/PaymentUI/PaymentStatus';
import { QRModal } from '../../components/PaymentUI/QRModal';
import { usePayment } from '../../hooks/usePayment';

interface HomeProps {
  userData?: { 
    clerk_id: string; 
    email: string; 
    name: string | null; 
    wallet_balance: number;
    id?: number;
    deposit_address?: string;
  } 
}

function Home({ userData }: HomeProps) {
  const [walletBalance, setWalletBalance] = useState<number | undefined>(undefined);

  // Update wallet balance when userData changes
  useEffect(() => {
    if (userData?.wallet_balance !== undefined) {
      console.log('Setting wallet balance:', userData.wallet_balance);
      setWalletBalance(userData.wallet_balance);
    }
  }, [userData]);

  const {
    solAmount,
    setSolAmount,
    showQRModal,
    handleCloseModal,
    handleCancelPayment,
    handlePayment,
    paymentStatus,
    paymentURL,
    processingPayment,
  } = usePayment({
    userId: userData?.id,
    depositAddress: userData?.deposit_address, // Add this line
    onBalanceUpdate: (newBalance) => {
      console.log('Updating balance to:', newBalance);
      setWalletBalance(newBalance);
    },
  });

  // Don't render until we have the initial balance
  if (walletBalance === undefined) {
    return null; // Or a loading indicator
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-zinc-900 text-white">
      <SignedIn>
        <div className="container mx-auto px-4 py-16">
          <div className="bg-zinc-800/50 p-6 rounded-lg">
            <WalletBalance balance={walletBalance} />
            
            <PaymentForm
              solAmount={solAmount}
              onAmountChange={setSolAmount}
              onSubmit={handlePayment}
              processingPayment={processingPayment}
            />

            {showQRModal && paymentURL && (
              <QRModal
                paymentURL={paymentURL}
                onClose={handleCloseModal}
                onCancel={handleCancelPayment}
                userData={userData}
              />
            )}

            <PaymentStatus status={paymentStatus} />
          </div>
        </div>
      </SignedIn>
    </div>
  );
}

export default Home;