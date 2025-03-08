// Create wallet connect project ID
// const projectId = 'afbf5cba0993a8447e19af62ce001115';

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import Navbar from './components/Navbar/Navbar';
import SingleplayerGame from './pages/SinglePlayerGame/SingleplayerGame';
import MultiplayerGame from './pages/MultiplayerGame/MultiplayerGame';
import Home from './pages/Home/Home';
import './index.css';
import { useWalletStore } from './stores/walletStore';

import { WagmiProvider, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { createConfig } from 'wagmi';
import { monadNetwork } from './chains';

// Create wagmi config with Monad
const config = createConfig({
  chains: [monadNetwork],
  transports: {
    [monadNetwork.id]: http('https://testnet-rpc.monad.xyz/'),
  }
});

// Create React Query client
const queryClient = new QueryClient();

// Custom RainbowKit theme to match app aesthetics
const customTheme = darkTheme({
  accentColor: '#10b981', // emerald-500
  accentColorForeground: 'black',
  borderRadius: 'large',
  fontStack: 'system',
  overlayBlur: 'small',
});

interface UserData {
  id?: number;
  clerk_id: string;
  email: string;
  name: string | null;
  wallet_balance: number;
  deposit_address?: string;
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/" replace />
      </SignedOut>
    </>
  );
};

const MainApp: React.FC = () => {
  const { user } = useUser();
  const [userData, setUserData] = useState<UserData | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const setBalance = useWalletStore(state => state.setBalance);

  useEffect(() => {
    const sendUserData = async () => {
      if (!user || !user.primaryEmailAddress) {
        setIsLoading(false);
        return;
      }

      try {
        const newUserData = {
          clerk_id: user.id,
          email: user.primaryEmailAddress.emailAddress,
          name: user.fullName,
        };

        // Send user details
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

        // Validate the balance
        if (typeof userDetailsData.balance !== 'number') {
          console.error('Invalid balance received:', userDetailsData.balance);
          throw new Error('Invalid balance received from server');
        }

        // Update the global store
        setBalance(userDetailsData.balance);

        // Update user data
        const updatedUserData = {
          ...newUserData,
          id: userDetailsData.id,
          wallet_balance: userDetailsData.balance,
          deposit_address: userDetailsData.user_pda,
        };
        
        setUserData(updatedUserData);
        console.log('Updated user data:', updatedUserData);
      } catch (error) {
        console.error('Failed to send/receive user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    sendUserData();
  }, [user, setBalance]);

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
          <RainbowKitProvider theme={customTheme} modalSize="compact">
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
              </Routes>
              <div id="modal-root" />
            </div>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </Router>
  );
};

export default MainApp;