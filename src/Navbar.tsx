import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-gray-300 transition">
          Mines Game
        </Link>
        
        <div className="flex items-center space-x-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          
          <SignedIn>
            {location.pathname !== '/play' && (
              <Link 
                to="/play" 
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1 rounded transition shadow-lg"
              >
                Play Mines
              </Link>
            )}
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;