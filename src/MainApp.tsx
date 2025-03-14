import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import Navbar from './components/Navbar/Navbar';
import SingleplayerGame from './pages/SinglePlayerGame/SingleplayerGame';
import MultiplayerGame from './pages/MultiplayerGame/MultiplayerGame';
import Leaderboard from './pages/Leaderboard/Leaderboard';
import Home from './pages/Home/Home';
import './index.css';
import { useWalletStore } from './stores/walletStore';
import { WagmiProvider, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
  // const wallet = wallets[0];

  useEffect(() => {
    if (authenticated && wallets.length === 0) {
      // alert('Please connect a wallet for transactions.');
      console.log("please connect a wallet for transactions")
    }
  }, [authenticated, wallets]);
  


  useEffect(() => {
    const fetchUserData = async () => {
      console.log("authentication check:", authenticated);
      
      if (!authenticated || !user) {
        setIsLoading(false);
        return;
      }

      // console.log("##############: ", wallets)
  
      // Wait until a wallet is available
      if (wallets.length === 0) {
        console.log("No wallet found, waiting...");
        return;
      }
  
      const wallet = wallets[0]; // Re-fetch the first wallet
      
      console.log("Wallet detected:", wallet?.address);
  
      try {
        const newUserData = {
          clerk_id: user.id,
          email: "exampl@gmail.com",
          name: "aryan",
        };
  
        // console.log("User data being sent:", newUserData);
  
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

        // console.log("User details being received from the backend:", userDetailsData);
  
        if (typeof userDetailsData.balance !== 'number') {
          console.error('Invalid balance received:', userDetailsData.balance);
          throw new Error('Invalid balance received from server');
        }
  
        setBalance(userDetailsData.balance);
  
        // setUserData({
        //   ...newUserData,
        //   id: userDetailsData.id,
        //   wallet_balance: userDetailsData.balance,
        //   deposit_address: userDetailsData.user_pda,
        //   privy_id: user.id, // Added missing property
        // });

        const updatedUserData = {
          ...newUserData,
          id: userDetailsData.id,
          wallet_balance: userDetailsData.balance,
          deposit_address: userDetailsData.user_pda,
          privy_id: user.id,
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
  }, [authenticated, user, wallets, setBalance]); // Include `wallets` as a dependency  

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