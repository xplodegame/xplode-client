import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import Navbar from './Navbar';
import SingleplayerGame from './SingleplayerGame';
import MultiplayerGame from './MultiplayerGame';
import Home from './Home';

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
  const [userData, setUserData] = useState<{
    clerk_id: string;
    email: string;
    name: string;
    profile_picture: string | null;
    wallet_balance?: number;
  }>();

  useEffect(() => {
    if (user) {
      const newUserData = {
        clerk_id: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        name: user.fullName || '',
        profile_picture: user.imageUrl || null,
      };
      setUserData(newUserData);

      fetch('http://127.0.0.1:8080/user-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUserData),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to send user data to the backend');
          }
          return response.json();
        })
        .then(data => {
          console.log('User data successfully sent to the backend:', data);
          setUserData(prev => ({
            ...prev!,
            wallet_balance: data.wallet_amount,
          }));
        })
        .catch(error => {
          console.error('Error sending user data to the backend:', error);
        });
    }
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
                <MultiplayerGame />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default MainApp;