import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { GamepadIcon, Users, User, Menu, X, Diamond } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { WalletDropdown } from '../PaymentUI/WalletDropdown';
import { motion } from 'framer-motion';

interface NavbarProps {
  userData?: { 
    clerk_id: string; 
    email: string; 
    name: string | null; 
    wallet_balance: number;
    id?: number;
    deposit_address?: string;
  };
}

const Navbar: React.FC<NavbarProps> = ({ userData }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <nav className="backdrop-blur-xl bg-gradient-to-b from-black/80 to-transparent border-b border-white/5">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="hidden md:grid md:grid-cols-3 items-center h-20">
            {/* Logo Section */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <Diamond className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                  Diamond Hunter
                </span>
              </Link>
            </div>

            {/* Center Section */}
            <SignedIn>
              <div className="flex justify-center items-center">
                <motion.div whileHover={{ scale: 1.02 }}>
                  <WalletDropdown userData={userData} />
                </motion.div>
              </div>
            </SignedIn>

            {/* Navigation Links and User Section */}
            <div className="flex items-center justify-end gap-4">
              <SignedIn>
                <div className="flex items-center gap-3">
                  {/* Rainbow Kit Connect Button */}
                  <motion.div whileHover={{ scale: 1.05 }} className="mr-2">
                    <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
                  </motion.div>

                  {location.pathname !== '/singleplayer' && (
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Link
                        to="/singleplayer"
                        className="px-4 py-2.5 rounded-xl font-medium
                                 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5
                                 text-emerald-400 border border-emerald-500/20
                                 hover:border-emerald-500/40 hover:from-emerald-500/20 hover:to-emerald-500/10
                                 transition-all duration-300 flex items-center gap-2"
                      >
                        <GamepadIcon size={18} />
                        <span>Single Player</span>
                      </Link>
                    </motion.div>
                  )}

                  {location.pathname !== '/multiplayer' && (
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Link
                        to="/multiplayer"
                        className="px-4 py-2.5 rounded-xl font-medium
                                 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5
                                 text-emerald-400 border border-emerald-500/20
                                 hover:border-emerald-500/40 hover:from-emerald-500/20 hover:to-emerald-500/10
                                 transition-all duration-300 flex items-center gap-2"
                      >
                        <Users size={18} />
                        <span>Multiplayer</span>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </SignedIn>

              <SignedOut>
                <motion.div whileHover={{ scale: 1.05 }} className="mr-2">
                  <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <SignInButton mode="modal">
                    <button className="px-6 py-2.5 rounded-xl font-medium
                                   bg-gradient-to-r from-emerald-400 to-emerald-500
                                   text-black hover:shadow-lg hover:shadow-emerald-500/20
                                   transition-all duration-300">
                      <span className="flex items-center gap-2">
                        <User size={18} />
                        Sign In
                      </span>
                    </button>
                  </SignInButton>
                </motion.div>
              </SignedOut>

              <SignedIn>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10 rounded-xl ring-2 ring-emerald-500/30 hover:ring-emerald-500/50",
                        userButtonPopoverCard: "bg-black/90 backdrop-blur-xl border border-emerald-500/20 rounded-xl shadow-xl",
                        userButtonPopoverActionButton: "hover:bg-emerald-500/10 text-emerald-400",
                        userButtonPopoverActionButtonText: "text-emerald-400",
                        userButtonPopoverFooter: "hidden",
                      }
                    }}
                  />
                </motion.div>
              </SignedIn>
            </div>
          </div>

          {/* Mobile Navigation (simplified for brevity) */}
          <div className="md:hidden">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-2">
                <Diamond className="w-6 h-6 text-emerald-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                  Diamond Hunter
                </span>
              </Link>
              
              <div className="flex items-center gap-3">
                <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
                <button onClick={toggleMenu} className="text-emerald-400">
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
            
            {/* Mobile menu - add if needed */}
          </div>
        </div>
      </nav>
    </motion.div>
  );
};

export default Navbar;