import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import Navbar from './components/Navbar/Navbar';
import SingleplayerGame from './pages/SinglePlayerGame/SingleplayerGame';
import MultiplayerGame from './pages/MultiplayerGame/MultiplayerGame';
import Home from './pages/Home/Home';
import './index.css';

import { DepositProvider } from './contexts/DepositContext';

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

        // First, send user details
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

        // Generate deposit address using the backend user ID
        const depositAddressResponse = await fetch('http://127.0.0.1:3001/generate-deposit-address', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: userDetailsData.id }),
        });

        if (!depositAddressResponse.ok) {
          throw new Error(`HTTP error! status: ${depositAddressResponse.status}`);
        }

        const depositAddressData = await depositAddressResponse.json();

        // Ensure we have the balance from the backend
        if (typeof userDetailsData.balance !== 'number') {
          console.error('Invalid balance received:', userDetailsData.balance);
          throw new Error('Invalid balance received from server');
        }

        setUserData({
          ...newUserData,
          id: userDetailsData.id,
          wallet_balance: userDetailsData.balance,
          deposit_address: depositAddressData.depositAddress
        });

        console.log('Updated user data:', {
          ...newUserData,
          id: userDetailsData.id,
          wallet_balance: userDetailsData.balance,
          deposit_address: depositAddressData.depositAddress
        });
      } catch (error) {
        console.error('Failed to send/receive user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    sendUserData();
  }, [user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <DepositProvider depositAddress={userData?.deposit_address}>
      <div className="bg-gray-900 min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home userData={userData} />} />
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
      </div>
      </DepositProvider>
    </Router>
  );
};

export default MainApp;