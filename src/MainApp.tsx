import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import Navbar from './components/Navbar/Navbar';
import SingleplayerGame from './pages/SinglePlayerGame/SingleplayerGame';
import MultiplayerGame from './pages/MultiplayerGame/MultiplayerGame';
import Home from './pages/Home/Home';
import './index.css';

interface UserData {
  id?: number;
  clerk_id: string;
  email: string;
  name: string | null;
  wallet_balance?: number | null;
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
  const [userData, setUserData] = useState<UserData>();

  useEffect(() => {
    const sendUserData = async () => {
      if (!user || !user.primaryEmailAddress) return;

      try {
        const newUserData = {
          clerk_id: user.id,
          email: user.primaryEmailAddress.emailAddress,
          name: user.fullName,
        };

        console.log('Sending user data:', newUserData);

        const response = await fetch('http://127.0.0.1:8080/user-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUserData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Backend response:', data);

        setUserData({
          ...newUserData,
          id: data.id,
        });
      } catch (error) {
        console.error('Failed to send/receive user data:', error);
      }
    };

    sendUserData();
  }, [user]);

  return (
    <Router>
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
    </Router>
  );
};

export default MainApp;