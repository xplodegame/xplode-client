import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { GamepadIcon, Users, User, Menu, X, Diamond } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { WalletDropdown } from '../PaymentUI/WalletDropdown';
import { motion } from 'framer-motion';

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
  const { authenticated, user, login, logout } = usePrivy();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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
                    <motion.div whileHover={{ scale: 1.05 }} className="hidden xl:block">
                      <ConnectButton.Custom>
                        {({
                          account,
                          chain,
                          openAccountModal,
                          openChainModal,
                          openConnectModal,
                          mounted,
                        }) => {
                          const ready = mounted;
                          const connected = ready && account && chain;

                          return (
                            <div
                              {...(!ready && {
                                'aria-hidden': true,
                                style: {
                                  opacity: 0,
                                  pointerEvents: 'none',
                                  userSelect: 'none',
                                },
                              })}
                            >
                              {(() => {
                                if (!connected) {
                                  return (
                                    <button
                                      onClick={openConnectModal}
                                      className="px-3 py-2.5 rounded-xl font-medium whitespace-nowrap
                                              bg-gradient-to-r from-emerald-500/10 to-emerald-500/5
                                              text-emerald-400 border border-emerald-500/20
                                              hover:border-emerald-500/40 hover:from-emerald-500/20 hover:to-emerald-500/10
                                              transition-all duration-300 flex items-center gap-2"
                                    >
                                      <Diamond size={18} />
                                      <span className="hidden sm:inline">Connect Wallet</span>
                                    </button>
                                  );
                                }

                                return (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={openChainModal}
                                      className="px-3 py-2.5 rounded-xl font-medium whitespace-nowrap
                                              bg-gradient-to-r from-emerald-500/10 to-emerald-500/5
                                              text-emerald-400 border border-emerald-500/20
                                              hover:border-emerald-500/40 transition-all duration-300 flex items-center gap-2"
                                    >
                                      {chain.hasIcon && (
                                        <div
                                          style={{
                                            background: chain.iconBackground,
                                            width: 16,
                                            height: 16,
                                            borderRadius: 999,
                                            overflow: 'hidden',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                          }}
                                        >
                                          {chain.iconUrl && (
                                            <img
                                              alt={chain.name ?? 'Chain icon'}
                                              src={chain.iconUrl}
                                              style={{ width: 16, height: 16 }}
                                            />
                                          )}
                                        </div>
                                      )}
                                      <span className="max-w-[60px] truncate">{chain.name}</span>
                                    </button>

                                    <button
                                      onClick={openAccountModal}
                                      className="px-3 py-2.5 rounded-xl font-medium whitespace-nowrap
                                              bg-gradient-to-r from-emerald-500/10 to-emerald-500/5
                                              text-emerald-400 border border-emerald-500/20
                                              hover:border-emerald-500/40 transition-all duration-300 flex items-center gap-2"
                                    >
                                      <span className="truncate max-w-[80px]">
                                        {account.address.substring(0, 4)}...{account.address.substring(account.address.length - 2)}
                                      </span>
                                    </button>
                                  </div>
                                );
                              })()}
                            </div>
                          );
                        }}
                      </ConnectButton.Custom>
                    </motion.div>

                    {/* Compact Connect Button for narrower screens */}
                    <motion.div whileHover={{ scale: 1.05 }} className="xl:hidden">
                      <ConnectButton.Custom>
                        {({
                          account,
                          chain,
                          openAccountModal,
                          openChainModal,
                          openConnectModal,
                          mounted,
                        }) => {
                          const ready = mounted;
                          const connected = ready && account && chain;

                          return (
                            <div
                              {...(!ready && {
                                'aria-hidden': true,
                                style: {
                                  opacity: 0,
                                  pointerEvents: 'none',
                                  userSelect: 'none',
                                },
                              })}
                            >
                              {!connected ? (
                                <button
                                  onClick={openConnectModal}
                                  className="px-3 py-2.5 rounded-xl font-medium
                                         bg-gradient-to-r from-emerald-500/10 to-emerald-500/5
                                         text-emerald-400 border border-emerald-500/20
                                         hover:border-emerald-500/40 transition-all duration-300 flex items-center gap-2"
                                >
                                  <Diamond size={18} className="md:mr-0 lg:mr-1" />
                                  <span className="hidden lg:inline">Connect</span>
                                </button>
                              ) : (
                                <button
                                  onClick={openAccountModal}
                                  className="px-3 py-2.5 rounded-xl font-medium
                                         bg-gradient-to-r from-emerald-500/10 to-emerald-500/5
                                         text-emerald-400 border border-emerald-500/20
                                         hover:border-emerald-500/40 transition-all duration-300"
                                >
                                  {account.address.substring(0, 4)}...
                                </button>
                              )}
                            </div>
                          );
                        }}
                      </ConnectButton.Custom>
                    </motion.div>

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
                          <span className="hidden lg:inline">Multiplayer</span>
                        </Link>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <>
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
                  </>
                )}

                {authenticated && (
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
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    mounted,
                  }) => {
                    const ready = mounted;
                    const connected = ready && account && chain;

                    return (
                      <div
                        {...(!ready && {
                          'aria-hidden': true,
                          style: {
                            opacity: 0,
                            pointerEvents: 'none',
                            userSelect: 'none',
                          },
                        })}
                      >
                        {!connected && (
                          <button
                            onClick={openConnectModal}
                            className="px-3 py-2 rounded-xl text-sm font-medium
                                   bg-gradient-to-r from-emerald-500/10 to-emerald-500/5
                                   text-emerald-400 border border-emerald-500/20
                                   hover:border-emerald-500/40 transition-all duration-300 flex items-center gap-1"
                          >
                            <Diamond size={14} />
                            Connect
                          </button>
                        )}

                        {connected && (
                          <button
                            onClick={openAccountModal}
                            className="px-3 py-2 rounded-xl text-sm font-medium
                                   bg-gradient-to-r from-emerald-500/10 to-emerald-500/5
                                   text-emerald-400 border border-emerald-500/20
                                   hover:border-emerald-500/40 transition-all duration-300"
                          >
                            {account.address.substring(0, 4)}...{account.address.substring(account.address.length - 4)}
                          </button>
                        )}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
                
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
                    
                    <Link
                      to="/multiplayer"
                      className="block w-full px-4 py-3 mb-2 rounded-xl font-medium
                               bg-gradient-to-r from-emerald-500/10 to-emerald-500/5
                               text-emerald-400 border border-emerald-500/20
                               hover:border-emerald-500/40 transition-all duration-300 text-center"
                      onClick={toggleMenu}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Users size={18} />
                        Multiplayer
                      </span>
                    </Link>

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