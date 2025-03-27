import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import Navbar from './components/Navbar/Navbar';
import MultiplayerGame from './pages/MultiplayerGame/MultiplayerGame';
import Leaderboard from './pages/Leaderboard/Leaderboard';
import CosmicUsernameModal from './components/GameComponents/CosmicUsernameModal/CosmicUsernameModal';
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
  name: string;
  wallet_balance: number;
  deposit_address?: string;
}

// Original ProtectedRoute without modifications
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { authenticated, ready } = usePrivy();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  useEffect(() => {
    if (ready) {
      setIsCheckingAuth(false);
    }
  }, [ready]);
  
  // Show loading indicator while checking auth status
  if (isCheckingAuth) {
    return (
      <div className="bg-gradient-to-b from-zinc-900 to-black min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-emerald-400 text-lg">Loading...</p>
        </div>
      </div>
    );
  }
  
  return authenticated ? children : <Navigate to="/" replace />;
};

const MainApp: React.FC = () => {
  const { authenticated, user } = usePrivy();
  const [userData, setUserData] = useState<UserData | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  
  const setBalance = useWalletStore((state) => state.setBalance);
  const {wallets} = useWallets();

  useEffect(() => {
    if (authenticated && wallets.length === 0) {
      console.log("please connect a wallet for transactions");
    }
  }, [authenticated, wallets]);

  // User Data Fetching
  useEffect(() => {
    const fetchUserData = async () => {
      if (!authenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const newUserData = {
          privy_id: user.id,
          email: "exampl@gmail.com",
          name: "", // Start with empty name
        };

        const userDetailsResponse = await fetch(import.meta.env.VITE_USER_DETAILS_ENDPOINT_URL, {
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
        // console.log("userDetailsData #######:", userDetailsData);

        if (typeof userDetailsData.balance !== 'number') {
          console.error('Invalid balance received:', userDetailsData.balance);
          throw new Error('Invalid balance received from server');
        }

        setBalance(userDetailsData.balance);

        const updatedUserData: UserData = {
          ...newUserData,
          id: userDetailsData.user_id, // Using user_id from the response instead of id
          wallet_balance: userDetailsData.balance,
          deposit_address: userDetailsData.wallet_address || "",
          name: userDetailsData.name || ""
        };

        // Store userData in localStorage for persistence
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        setUserData(updatedUserData);

        console.log('Updated user data:', updatedUserData);

        if (wallets.length > 0) {
          console.log("Wallet detected:", wallets[0]?.address);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [authenticated, user, wallets, setBalance]);

  // Handle username setting
  const handleUsernameSet = async (username: string) => {
    if (!userData || userData.id === undefined) {
      console.error("Cannot update username: User ID is missing");
      return;
    }
    
    try {
      // Create the request body according to the expected format
      const updateRequest = {
        name: username,
        email: userData.email,
        wallet_address: undefined // Optional field
      };
      
      // Log for debugging
      console.log("Updating user with ID:", userData.id);
      console.log("Update request:", updateRequest);
      
      // Build the URL with the user_id
      const updateUrl = `${import.meta.env.VITE_USER_DETAILS_ENDPOINT_URL}/${userData.id}`;
      console.log("Update URL:", updateUrl);
      
      const updateResponse = await fetch(updateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateRequest),
      });
      
      // First get the response as text for debugging
      const responseText = await updateResponse.text();
      console.log("Raw response:", responseText);
      
      if (!updateResponse.ok) {
        throw new Error(`HTTP error! status: ${updateResponse.status}, response: ${responseText}`);
      }
      
      // Update local state with new username
      const updatedUserData = {
        ...userData,
        name: username
      };
      
      setUserData(updatedUserData);
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      setIsUsernameModalOpen(false);
      
      console.log('Username set successfully:', username);
    } catch (error) {
      console.error('Failed to update username:', error);
      // Keep modal open when there's an error
    }
  };

  // Check for empty username when route changes
  const checkUsernameRequired = (Component: React.ComponentType<any>, props: any) => {
    // If user is not authenticated or still loading, don't check username
    if (!authenticated || isLoading) {
      return <Component {...props} />;
    }
    
    // Show modal if no username is set
    const shouldShowModal = userData && !userData.name;
    if (shouldShowModal && !isUsernameModalOpen) {
      setIsUsernameModalOpen(true);
    }
    
    return (
      <>
        {shouldShowModal && (
          <CosmicUsernameModal 
            isOpen={isUsernameModalOpen}
            onUsernameSet={handleUsernameSet}
          />
        )}
        <Component {...props} />
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-emerald-400 text-lg">Plotting Cosmic Course...</p>
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
                  path="/multiplayer"
                  element={
                    <ProtectedRoute>
                      {checkUsernameRequired(MultiplayerGame, { userData })}
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leaderboard"
                  element={
                    <ProtectedRoute>
                      {checkUsernameRequired(Leaderboard, {})}
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