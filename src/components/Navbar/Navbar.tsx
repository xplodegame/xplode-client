import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { GamepadIcon, Users, User, Menu, X, Diamond, Trophy, ChevronDown, PlayCircle } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { WalletDropdown } from '../PaymentUI/WalletDropdown';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  userData?: { 
    privy_id: string; 
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
  const [isGameHubOpen, setIsGameHubOpen] = useState(false);
  const gameHubRef = useRef<HTMLDivElement>(null);
  const { authenticated, user, login, logout } = usePrivy();

  // console.log("userID in the navbar: ", userData?.id)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleGameHub = () => setIsGameHubOpen(!isGameHubOpen);

  // Close the game hub dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (gameHubRef.current && !gameHubRef.current.contains(event.target as Node)) {
        setIsGameHubOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get current active route
  const isActiveRoute = (path: string) => location.pathname === path;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <nav className="backdrop-blur-xl bg-gradient-to-b from-black/80 to-transparent border-b border-white/5">
        <div className="container mx-auto px-4 lg:px-6">
          {/* Desktop and Tablet Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center h-20">
              {/* Logo Section - Fixed Width */}
              <div className="w-1/4">
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

              {/* Wallet Section - Always Centered */}
              <div className="flex-1 flex justify-center items-center">
                {authenticated && (
                  <motion.div whileHover={{ scale: 1.02 }}>
                    <WalletDropdown userData={userData} />
                  </motion.div>
                )}
              </div>

              {/* Navigation Links and User Section - Fixed Width */}
              <div className="w-1/4 flex items-center justify-end gap-4">
                {authenticated ? (
                  <div className="flex items-center gap-3">
                    {/* Full Connect Button that will only show at larger screens */}

                    {/* Game Hub Dropdown */}
                    <div className="relative" ref={gameHubRef}>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        onClick={toggleGameHub}
                        className={`px-4 py-2.5 rounded-xl font-medium
                                 bg-gradient-to-r ${isGameHubOpen ? 'from-emerald-500/20 to-emerald-500/10' : 'from-emerald-500/10 to-emerald-500/5'}
                                 text-emerald-400 border ${isGameHubOpen ? 'border-emerald-500/40' : 'border-emerald-500/20'}
                                 hover:border-emerald-500/40 hover:from-emerald-500/20 hover:to-emerald-500/10
                                 transition-all duration-300 flex items-center gap-2`}
                      >
                        <GamepadIcon size={18} />
                        <span className="hidden lg:inline whitespace-nowrap">Game Hub</span>
                        <ChevronDown size={16} className={`transition-transform duration-300 ${isGameHubOpen ? 'rotate-180' : ''}`} />
                      </motion.button>

                      <AnimatePresence>
                        {isGameHubOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.05 }}
                            className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden
                                    border border-emerald-500/20 shadow-lg shadow-emerald-500/5
                                    backdrop-blur-xl bg-black/90 z-50"
                          >
                            <div className="p-1">
                              <Link
                                to="/multiplayer"
                                onClick={() => setIsGameHubOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                                        ${isActiveRoute('/multiplayer') ? 'bg-emerald-500/20 text-emerald-300' : 'hover:bg-emerald-500/10 text-emerald-400'}`}
                              >
                                <Users size={18} />
                                <span>Multiplayer</span>
                                {isActiveRoute('/multiplayer') && (
                                  <motion.span 
                                    layoutId="navbar-pill"
                                    className="ml-auto h-2 w-2 rounded-full bg-emerald-400" 
                                  />
                                )}
                              </Link>
                              
                              <Link
                                to="/leaderboard"
                                onClick={() => setIsGameHubOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                                        ${isActiveRoute('/leaderboard') ? 'bg-emerald-500/20 text-emerald-300' : 'hover:bg-emerald-500/10 text-emerald-400'}`}
                              >
                                <Trophy size={18} />
                                <span>Leaderboard</span>
                                {isActiveRoute('/leaderboard') && (
                                  <motion.span 
                                    layoutId="navbar-pill"
                                    className="ml-auto h-2 w-2 rounded-full bg-emerald-400" 
                                  />
                                )}
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Sign Out Button */}
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <button
                        onClick={logout}
                        className="px-6 py-2.5 rounded-xl font-medium
                                 bg-gradient-to-r from-emerald-400 to-emerald-500
                                 text-black hover:shadow-lg hover:shadow-emerald-500/20
                                 transition-all duration-300 whitespace-nowrap"
                      >
                        <span className="flex items-center gap-2">
                          <User size={18} />
                          <span className="hidden lg:inline">Sign Out</span>
                        </span>
                      </button>
                    </motion.div>
                  </div>
                ) : (
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <button
                      onClick={login}
                      className="px-6 py-2.5 rounded-xl font-medium
                               bg-gradient-to-r from-emerald-400 to-emerald-500
                               text-black hover:shadow-lg hover:shadow-emerald-500/20
                               transition-all duration-300"
                    >
                      <span className="flex items-center gap-2">
                        <User size={18} />
                        <span className="hidden lg:inline">Sign In</span>
                      </span>
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-2">
                <Diamond className="w-6 h-6 text-emerald-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                  Diamond Hunter
                </span>
              </Link>
              
              <div className="flex items-center gap-3">
                <button onClick={toggleMenu} className="text-emerald-400">
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
            
            {/* Mobile menu dropdown */}
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-4 px-2 border-t border-white/5 backdrop-blur-xl bg-black/60"
              >
                {authenticated ? (
                  <>
                    <div className="flex justify-center mb-4">
                      <WalletDropdown userData={userData} />
                    </div>
                    
                    {/* Game Hub options for mobile */}
                    <div className="space-y-2 mb-4">
                      <div className="px-4 py-2 text-sm font-medium text-emerald-500 flex items-center gap-2">
                        <GamepadIcon size={16} />
                        <span>Game Hub</span>
                      </div>
                      
                      <Link
                        to="/multiplayer"
                        className={`block w-full px-4 py-3 rounded-xl font-medium text-center
                                bg-gradient-to-r ${isActiveRoute('/multiplayer') ? 'from-emerald-500/20 to-emerald-500/10' : 'from-emerald-500/10 to-emerald-500/5'}
                                text-emerald-400 border ${isActiveRoute('/multiplayer') ? 'border-emerald-500/40' : 'border-emerald-500/20'}
                                hover:border-emerald-500/40 transition-all duration-300`}
                        onClick={toggleMenu}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Users size={18} />
                          Multiplayer
                        </span>
                      </Link>
                      
                      <Link
                        to="/leaderboard"
                        className={`block w-full px-4 py-3 rounded-xl font-medium text-center
                                bg-gradient-to-r ${isActiveRoute('/leaderboard') ? 'from-emerald-500/20 to-emerald-500/10' : 'from-emerald-500/10 to-emerald-500/5'}
                                text-emerald-400 border ${isActiveRoute('/leaderboard') ? 'border-emerald-500/40' : 'border-emerald-500/20'}
                                hover:border-emerald-500/40 transition-all duration-300`}
                        onClick={toggleMenu}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Trophy size={18} />
                          Leaderboard
                        </span>
                      </Link>
                    </div>

                    <button
                      onClick={logout}
                      className="block w-full px-4 py-3 rounded-xl font-medium
                               bg-gradient-to-r from-emerald-400 to-emerald-500
                               text-black hover:shadow-lg hover:shadow-emerald-500/20
                               transition-all duration-300 text-center"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <User size={18} />
                        Sign Out
                      </span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={login}
                    className="block w-full px-4 py-3 rounded-xl font-medium
                               bg-gradient-to-r from-emerald-400 to-emerald-500
                               text-black hover:shadow-lg hover:shadow-emerald-500/20
                               transition-all duration-300 text-center"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <User size={18} />
                      Sign In
                    </span>
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </nav>
    </motion.div>
  );
};

export default Navbar;