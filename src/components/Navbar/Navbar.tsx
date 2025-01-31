import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { GamepadIcon, Users, User, Sparkles } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="sticky top-0 z-50">
      <nav className="backdrop-blur-md bg-zinc-900/70 border-b border-zinc-800/50 text-white">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <Sparkles className="w-8 h-8 text-emerald-400 transform group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent hover:opacity-80 transition-all duration-300">
              Mines
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-5 py-2.5 rounded-lg font-medium transition-all duration-300 
                                 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 
                                 hover:from-emerald-500/20 hover:to-teal-500/20
                                 text-emerald-400 border border-emerald-500/30 
                                 hover:border-emerald-500/50 hover:scale-105">
                  <span className="flex items-center gap-2">
                    <User size={18} />
                    Sign In
                  </span>
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center gap-3">
                {location.pathname !== '/play' && (
                  <Link
                    to="/singleplayer"
                    className="px-4 py-2.5 rounded-lg font-medium transition-all duration-300
                             bg-zinc-900/80 text-zinc-400 hover:text-emerald-400
                             hover:bg-zinc-800/80 border border-zinc-800/50
                             hover:border-emerald-500/30 hover:scale-105
                             flex items-center gap-2"
                  >
                    <GamepadIcon size={18} />
                    Single Player
                  </Link>
                )}

                {location.pathname !== '/multiplayer' && (
                  <Link
                    to="/multiplayer"
                    className="px-4 py-2.5 rounded-lg font-medium transition-all duration-300
                             bg-zinc-900/80 text-zinc-400 hover:text-emerald-400
                             hover:bg-zinc-800/80 border border-zinc-800/50
                             hover:border-emerald-500/30 hover:scale-105
                             flex items-center gap-2"
                  >
                    <Users size={18} />
                    Multiplayer
                  </Link>
                )}

                <div className="relative ml-2 transform hover:scale-105 transition-transform duration-300">
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10 rounded-lg ring-2 ring-emerald-500/30 hover:ring-emerald-500/50",
                        userButtonPopoverCard: "bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl",
                        userButtonPopoverActionButton: "hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400",
                        userButtonPopoverActionButtonText: "text-zinc-400 hover:text-emerald-400",
                        userButtonPopoverFooter: "hidden",
                      }
                    }}
                  />
                </div>
              </div>
            </SignedIn>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;