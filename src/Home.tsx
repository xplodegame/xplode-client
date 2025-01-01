import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SignedOut, SignedIn } from '@clerk/clerk-react';
import { Sparkles, ChevronRight, Gem, Bomb, Crown, DollarSign } from 'lucide-react';

const FloatingTile = ({ children, delay = 0 }) => (
  <div 
    className="absolute w-16 h-16 rounded-lg bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm transform transition-all duration-1000"
    style={{
      animation: `float 6s ease-in-out infinite ${delay}s`,
    }}
  >
    {children}
  </div>
);

function Home({ userData }: { userData?: { clerk_id: string; email: string; name: string; profile_picture: string | null; wallet_balance?: number } }) {
  const [hoveredMode, setHoveredMode] = useState(null);
  const [walletBalance, setWalletBalance] = useState(userData?.wallet_balance || 0);

  // Update wallet balance when the userData prop changes
  useEffect(() => {
    setWalletBalance(userData?.wallet_balance || 0);
  }, [userData]);

  const handlePayment = async () => {
    const orderResponse = await fetch('http://localhost:8080/deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: parseFloat("50000"),
        currency: "INR",
      }),
    });

    const orderData = await orderResponse.json();
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: orderData.amount,
      currency: "INR",
      name: "Your Game Name",
      description: "Deposit Funds",
      order_id: orderData.id,
      handler: function (response: any) {
        console.log("Payment successful:", response);

        fetch('http://localhost:8080/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            amount: parseFloat("50000"),
          }),
        })
          .then(res => {
            if (res.ok) {
              console.log("Payment verified and database updated.");
              setWalletBalance(prevBalance => prevBalance + 500);
            } else {
              console.error("Verification failed: Status code", res.status);
            }
          })
          .catch(err => {
            console.error("Error during verification:", err);
          });
      },
      prefill: {
        name: "Player Name",
        email: "player@example.com",
      },
      theme: {
        color: "#3366cc",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handleWithdrawal = () => {
    const withdrawalAmount = 200;

    if (walletBalance >= withdrawalAmount) {
      setWalletBalance(prevBalance => prevBalance - withdrawalAmount);
      console.log(`Withdrawal of ₹${withdrawalAmount} successful!`);

      fetch('http://localhost:8080/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: withdrawalAmount,
        }),
      })
        .then(res => {
          if (res.ok) {
            console.log("Withdrawal logged successfully.");
          } else {
            console.error("Failed to log withdrawal: Status code", res.status);
          }
        })
        .catch(err => {
          console.error("Error during withdrawal logging:", err);
        });
    } else {
      console.error("Insufficient funds for withdrawal.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-zinc-900 text-white overflow-hidden relative">
      {/* Animated Background Elements */}
      <FloatingTile delay={0} className="top-20 left-[20%]">
        <div className="w-full h-full flex items-center justify-center text-emerald-400">
          <Gem size={24} />
        </div>
      </FloatingTile>
      <FloatingTile delay={2} className="top-40 right-[25%]">
        <div className="w-full h-full flex items-center justify-center text-red-400">
          <Bomb size={24} />
        </div>
      </FloatingTile>
      <FloatingTile delay={4} className="bottom-40 left-[30%]">
        <div className="w-full h-full flex items-center justify-center text-yellow-400">
          <Crown size={24} />
        </div>
      </FloatingTile>

      <SignedIn>
        <div className="container mx-auto px-4 py-16 relative z-10">
          {/* Profile Section */}
          <div className="bg-zinc-800/50 p-6 rounded-lg mb-12">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4 flex items-center gap-2">
              <DollarSign size={24} />
              Cashier
            </h2>
            <p className="text-zinc-400 mb-4">Manage your wallet and funds.</p>
            <p className="text-lg text-emerald-400 mb-4">Wallet Balance: ₹{walletBalance}</p>
            <button
              onClick={handlePayment}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30"
            >
              Add Money to Wallet
            </button>
            <button
              onClick={handleWithdrawal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 mt-4"
            >
              Withdraw Money
            </button>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="mt-12 text-center">
          <p className="text-zinc-400 text-lg mb-6">
            Ready to test your skills? Sign in to start playing!
          </p>
        </div>
      </SignedOut>

      {/* Rest of the component remains unchanged */}
    </div>
  );
}

export default Home;