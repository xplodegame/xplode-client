import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import Navbar from './components/Navbar/Navbar';
import MultiplayerGame from './pages/MultiplayerGame/MultiplayerGame';
import Leaderboard from './pages/Leaderboard/Leaderboard';
import CosmicGifMarketplace from './pages/MarketPlace/MarketPlace.tsx';
import CosmicUsernameModal from './components/GameComponents/CosmicUsernameModal/CosmicUsernameModal';
import Home from './pages/Home/Home';
import './index.css';
import { useWalletStore } from './stores/walletStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';
import {useSolanaWallets} from '@privy-io/react-auth';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';


// Configure Solana connection
const solanaNetwork = WalletAdapterNetwork.Mainnet; // Or use WalletAdapterNetwork.Devnet for testing
const endpoint = import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl(solanaNetwork);


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

// Wrapper component for checking username before accessing protected content
const UsernameRequiredWrapper = ({ 
  children,
  userData,
  isUsernameModalOpen,
  setIsUsernameModalOpen,
  handleUsernameSet
}: { 
  children: React.ReactNode,
  userData?: UserData,
  isUsernameModalOpen: boolean,
  setIsUsernameModalOpen: (isOpen: boolean) => void,
  handleUsernameSet: (username: string) => Promise<void>
}) => {
  // Check if username is required
  useEffect(() => {
    if (userData && !userData.name) {
      setIsUsernameModalOpen(true);
    }
  }, [userData, setIsUsernameModalOpen]);
  
  return (
    <>
      <CosmicUsernameModal 
        isOpen={isUsernameModalOpen}
        onUsernameSet={handleUsernameSet}
      />
      {children}
    </>
  );
};

const MainApp: React.FC = () => {
  const { authenticated, user } = usePrivy();
  const [userData, setUserData] = useState<UserData | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  
  const setBalance = useWalletStore((state) => state.setBalance);
  const {wallets} = useSolanaWallets();

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
  
      const newUserData = {
        privy_id: user.id,
        email: "exampl@gmail.com",
        name: "", // Start with empty name
      };
  
      let retryCount = 0;
      const maxRetries = 3;
      const retryDelay = 1000; // 1 second delay between retries
      
      while (retryCount <= maxRetries) {
        try {
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
          // console.log(`Attempt ${retryCount + 1} - User details response:`, userDetailsData);
          
          // Check if all required fields are present
          if (userDetailsData.id === undefined || 
              typeof userDetailsData.balance !== 'number') {
            
            // console.warn(`Attempt ${retryCount + 1} - Incomplete user data received:`, userDetailsData);
            
            if (retryCount < maxRetries) {
              retryCount++;
              // console.log(`Retrying in ${retryDelay}ms... (${retryCount}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              continue; // Retry the request
            } else {
              throw new Error('Max retries reached with incomplete user data');
            }
          }
  
          // If we reached here, we have valid data
          setBalance(userDetailsData.balance);
  
          const updatedUserData = {
            ...newUserData,
            id: userDetailsData.id,
            wallet_balance: userDetailsData.balance,
            deposit_address: userDetailsData.wallet_address || "",
            name: userDetailsData.name || ""
          };
  
          // Store userData in localStorage for persistence
          localStorage.setItem('userData', JSON.stringify(updatedUserData));
          setUserData(updatedUserData);
  
          console.log('Updated user data successfully:', updatedUserData);
  
          if (wallets.length > 0) {
            console.log("Wallet detected:", wallets[0]?.address);
          }
          
          // Break out of the retry loop as we got valid data
          break;
          
        } catch (error) {
          if (retryCount < maxRetries) {
            retryCount++;
            console.error(`Attempt ${retryCount} failed:`, error);
            console.log(`Retrying in ${retryDelay}ms... (${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          } else {
            console.error('Failed to fetch user data after max retries:', error);
            break;
          }
        }
      }
      
      setIsLoading(false);
    };
  
    fetchUserData();
  }, [authenticated, user, wallets[0]?.address, setBalance]);

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
      
      console.log("Updating user with ID:", userData.id);
      
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
      
      // Get response as text first for debugging
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
    }
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
      <ConnectionProvider endpoint={endpoint}>
        <QueryClientProvider client={queryClient}>
            <div className="bg-gray-900 min-h-screen">
              <Navbar userData={userData} />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/marketplace" element={<CosmicGifMarketplace />} />
                <Route
                  path="/multiplayer"
                  element={
                    <ProtectedRoute>
                      <UsernameRequiredWrapper
                        userData={userData}
                        isUsernameModalOpen={isUsernameModalOpen}
                        setIsUsernameModalOpen={setIsUsernameModalOpen}
                        handleUsernameSet={handleUsernameSet}
                      >
                        <MultiplayerGame userData={userData} />
                      </UsernameRequiredWrapper>
                    </ProtectedRoute>
                  }
                />
                {/* New route for direct game joining */}
                <Route
                  path="/multiplayer/:gameId"
                  element={
                    <ProtectedRoute>
                      <UsernameRequiredWrapper
                        userData={userData}
                        isUsernameModalOpen={isUsernameModalOpen}
                        setIsUsernameModalOpen={setIsUsernameModalOpen}
                        handleUsernameSet={handleUsernameSet}
                      >
                        <MultiplayerGame userData={userData} />
                      </UsernameRequiredWrapper>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leaderboard"
                  element={
                    <ProtectedRoute>
                      <UsernameRequiredWrapper
                        userData={userData}
                        isUsernameModalOpen={isUsernameModalOpen}
                        setIsUsernameModalOpen={setIsUsernameModalOpen}
                        handleUsernameSet={handleUsernameSet}
                      >
                        <Leaderboard />
                      </UsernameRequiredWrapper>
                    </ProtectedRoute>
                  }
                />
              </Routes>
              <div id="modal-root" />
            </div>
        </QueryClientProvider>
      </ConnectionProvider>
    </Router>
  );
};
export default MainApp;