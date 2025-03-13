import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import Navbar from './components/Navbar/Navbar';
import SingleplayerGame from './pages/SinglePlayerGame/SingleplayerGame';
import MultiplayerGame from './pages/MultiplayerGame/MultiplayerGame';
import Leaderboard from './pages/Leaderboard/Leaderboard';
import Home from './pages/Home/Home';
import './index.css';
import { useWalletStore } from './stores/walletStore';
import { WagmiProvider, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { createConfig } from 'wagmi';
import { monadNetwork } from './chains';
import {useWallets} from '@privy-io/react-auth';

const config = createConfig({
  chains: [monadNetwork],
  transports: {
    [monadNetwork.id]: http('https://testnet-rpc.monad.xyz/'),
  },
});

const queryClient = new QueryClient();

const customTheme = darkTheme({
  accentColor: '#10b981',
  accentColorForeground: 'black',
  borderRadius: 'large',
  fontStack: 'system',
  overlayBlur: 'small',
});

interface UserData {
  id?: number;
  privy_id: string;
  email: string;
  name: string | null;
  wallet_balance: number;
  deposit_address?: string;
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { authenticated } = usePrivy();
  return authenticated ? children : <Navigate to="/" replace />;
};

const MainApp: React.FC = () => {
  const { authenticated, user } = usePrivy();
  const [userData, setUserData] = useState<UserData | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const setBalance = useWalletStore((state) => state.setBalance);

  const {wallets} = useWallets();
  const wallet = wallets[0];

  useEffect(() => {
    const fetchUserData = async () => {
      console.log("authentication check:", authenticated)
      
      if (!authenticated || !user ) {
        setIsLoading(false);
        return;
      }
      console.log("############")
      

      try {
        // Prepare user data to send to the backend
        const newUserData = {
          // privy_id: user.id,
          clerk_id: user.id,
          email: "exampl@gmail.com",
          name: "aryan",
        };

        console.log("00000000000", newUserData)

        console.log("22222222222222")
        console.log("1111111111111", wallet.address)

        // Fetch user details from the backend
        const userDetailsResponse = await fetch('http://127.0.0.1:8080/user-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUserData),
        });

        if (!userDetailsResponse.ok) {
          throw new Error(`HTTP error! status: ${userDetailsResponse.status}`);
        }

        const userDetailsData = await userDetailsResponse.json();

        // Validate the balance received from the backend
        if (typeof userDetailsData.balance !== 'number') {
          console.error('Invalid balance received:', userDetailsData.balance);
          throw new Error('Invalid balance received from server');
        }

        // Update the global wallet balance
        setBalance(userDetailsData.balance);

        // Update the user data state
        const updatedUserData = {
          ...newUserData,
          id: userDetailsData.id,
          wallet_balance: userDetailsData.balance,
          deposit_address: userDetailsData.user_pda,
        };

        setUserData(updatedUserData);
        console.log('Updated user data:', updatedUserData);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [authenticated, user, setBalance]);

  if (isLoading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-emerald-400 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
            <div className="bg-gray-900 min-h-screen">
              <Navbar userData={userData} />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/singleplayer"
                  element={
                    <ProtectedRoute>
                      <SingleplayerGame />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/multiplayer"
                  element={
                    <ProtectedRoute>
                      <MultiplayerGame userData={userData} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leaderboard"
                  element={
                    <ProtectedRoute>
                      <Leaderboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
              <div id="modal-root" />
            </div>
        </QueryClientProvider>
      </WagmiProvider>
    </Router>
  );
};

export default MainApp;