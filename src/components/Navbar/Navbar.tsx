import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { GamepadIcon, Users, User, Sparkles, Menu, X } from 'lucide-react';
import { WalletDropdown } from '../PaymentUI/WalletDropdown';

interface NavbarProps {
  userData?: { 
    clerk_id: string; 
    email: string; 
    name: string | null; 
    wallet_balance: number;
    id?: number;
    deposit_address?: string;
  } 
}

const Navbar: React.FC<NavbarProps> = ({ userData }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="sticky top-0 z-50">
      <nav className="backdrop-blur-md bg-zinc-900/70 border-b border-zinc-800/50 text-white">
        <div className="container mx-auto px-4 lg:px-6">
          {/* Desktop Navigation */}
          <div className="hidden md:grid md:grid-cols-3 items-center h-16">
            {/* Logo Section */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <Sparkles className="w-8 h-8 text-emerald-400 transform group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent hover:opacity-80 transition-all duration-300">
                  Mines
                </span>
              </Link>
            </div>

            {/* Center Section with Wallet */}
            <SignedIn>
              <div className="flex justify-center items-center">
                <WalletDropdown userData={userData} />
              </div>
            </SignedIn>

            {/* Navigation Links and User Section */}
            <div className="flex items-center justify-end gap-4">
              <SignedIn>
                <div className="flex items-center gap-3">
                  {location.pathname !== '/singleplayer' && (
                    <Link
                      to="/singleplayer"
                      className="px-4 py-2 rounded-lg font-medium transition-all duration-300
                               bg-zinc-900/80 text-zinc-400 hover:text-emerald-400
                               hover:bg-zinc-800/80 border border-zinc-800/50
                               hover:border-emerald-500/30 hover:scale-105
                               flex items-center gap-2"
                    >
                      <GamepadIcon size={18} />
                      <span>Single Player</span>
                    </Link>
                  )}

                  {location.pathname !== '/multiplayer' && (
                    <Link
                      to="/multiplayer"
                      className="px-4 py-2 rounded-lg font-medium transition-all duration-300
                               bg-zinc-900/80 text-zinc-400 hover:text-emerald-400
                               hover:bg-zinc-800/80 border border-zinc-800/50
                               hover:border-emerald-500/30 hover:scale-105
                               flex items-center gap-2"
                    >
                      <Users size={18} />
                      <span>Multiplayer</span>
                    </Link>
                  )}
                </div>
              </SignedIn>

              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-5 py-2 rounded-lg font-medium transition-all duration-300 
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
                <div className="relative transform hover:scale-105 transition-transform duration-300">
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
              </SignedIn>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <div className="flex items-center justify-between h-16">
              {/* Mobile Logo */}
              <Link to="/" className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-emerald-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Mines
                </span>
              </Link>

              {/* Mobile Controls */}
              <div className="flex items-center gap-4">
                <SignedIn>
                  <div className="flex items-center justify-center">
                    <WalletDropdown userData={userData} />
                  </div>
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8 rounded-lg ring-2 ring-emerald-500/30",
                      }
                    }}
                  />
                </SignedIn>

                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="px-4 py-2 rounded-lg text-sm font-medium
                                     bg-gradient-to-r from-emerald-500/10 to-teal-500/10 
                                     text-emerald-400 border border-emerald-500/30">
                      Sign In
                    </button>
                  </SignInButton>
                </SignedOut>

                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-lg text-emerald-400 hover:bg-zinc-800/80"
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
              <div className="px-2 pb-4 space-y-2">
                <SignedIn>
                  {location.pathname !== '/singleplayer' && (
                    <Link
                      to="/singleplayer"
                      className="flex items-center gap-2 px-4 py-3 rounded-lg
                               bg-zinc-900/80 text-zinc-400 hover:text-emerald-400
                               border border-zinc-800/50 hover:border-emerald-500/30"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <GamepadIcon size={18} />
                      <span>Single Player</span>
                    </Link>
                  )}

                  {location.pathname !== '/multiplayer' && (
                    <Link
                      to="/multiplayer"
                      className="flex items-center gap-2 px-4 py-3 rounded-lg
                               bg-zinc-900/80 text-zinc-400 hover:text-emerald-400
                               border border-zinc-800/50 hover:border-emerald-500/30"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Users size={18} />
                      <span>Multiplayer</span>
                    </Link>
                  )}
                </SignedIn>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;