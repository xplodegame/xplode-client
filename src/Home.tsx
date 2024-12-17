import React from 'react';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import { SignedOut, SignedIn } from '@clerk/clerk-react';

function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-6 text-blue-400">Welcome to Mines Game</h1>
        
        <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-8 shadow-xl">
          <p className="text-lg mb-6">
            Test your luck and strategy in this exciting Mines Game! 
            Navigate through a 5x5 grid, avoiding hidden mines while collecting gems.
          </p>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-blue-300">How to Play</h2>
            <ul className="list-disc list-inside text-left mx-auto max-w-md space-y-2">
              <li>Click on tiles to reveal them</li>
              <li>Avoid clicking on mines</li>
              <li>Collect as many gems as possible</li>
              <li>Game ends if you hit a mine</li>
            </ul>
          </div>
          
          <SignedOut>
            <div className="mt-8">
              <p className="mb-4 text-lg">
                Sign in to start playing and challenge yourself!
              </p>
            </div>
          </SignedOut>
          
          <SignedIn>
            <div className="mt-8">
              <Link 
                to="/play" 
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition inline-block"
              >
                Start Playing Now
              </Link>
            </div>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}

export default Home;