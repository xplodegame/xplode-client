import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Trophy, 
  Calendar, 
  Wallet, 
  Sparkles, 
  Zap, 
  Shield, 
  Clock, 
  BarChart4, 
  PackageOpen,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  LineChart,
  Lock
} from 'lucide-react';
import { useParticles } from '../../components/LandingPage/Particles';
import { useWalletStore } from '../../stores/walletStore';

interface GamePnl {
  id: number;
  user_id: number;
  currency: string;
  profit: number;
  created_at: string;
  updated_at: string;
}

interface OwnedGif {
  id: number;
  name: string;
  url: string;
  rarity: string;
  price?: number;
}

const rarityColors = {
  "Common": {
    bg: "bg-emerald-500/30",
    text: "text-emerald-400",
    border: "border-emerald-500/40",
    glow: "shadow-emerald-500/30"
  },
  "Rare": {
    bg: "bg-blue-500/30",
    text: "text-blue-400",
    border: "border-blue-500/40",
    glow: "shadow-blue-500/30"
  },
  "Epic": {
    bg: "bg-purple-500/30", 
    text: "text-purple-400",
    border: "border-purple-500/40",
    glow: "shadow-purple-500/30"
  },
  "Legendary": {
    bg: "bg-yellow-500/30",
    text: "text-yellow-400",
    border: "border-yellow-500/40",
    glow: "shadow-yellow-500/30"
  },
  "Mythic": {
    bg: "bg-red-500/30",
    text: "text-red-400",
    border: "border-red-500/40",
    glow: "shadow-red-500/30"
  }
};

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'collection' | 'history'>('overview');
  const [userGamePnl, setUserGamePnl] = useState<GamePnl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ownedGifs, setOwnedGifs] = useState<OwnedGif[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [gameStats, setGameStats] = useState({
    totalMatches: 0,
    winRate: 0,
    totalProfit: 0,
    biggestWin: 0,
    biggestLoss: 0,
    averageProfit: 0,
    wins: 0,
    losses: 0,
    mostActiveDay: 'Unknown',
    accountCreated: 'Unknown'
  });
  
  const balance = useWalletStore(state => state.balance);
  const Particles = useParticles();

  // Add CSS animation for badge shimmer effect
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes shimmer-slow {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }
      
      .animate-shimmer-slow {
        animation: shimmer-slow 3s infinite;
      }
      
      .animate-float {
        animation: float 3s ease-in-out infinite;
      }
      
      @keyframes float {
        0% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-5px);
        }
        100% {
          transform: translateY(0px);
        }
      }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    // Get user data from localStorage
    try {
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
        
        // Convert created_at date to a readable format if present
        if (parsedUserData.created_at) {
          const createdDate = new Date(parsedUserData.created_at);
          setGameStats(prev => ({...prev, accountCreated: createdDate.toLocaleDateString()}));
        } else {
          // If creation date not available, use current date as fallback
          const today = new Date();
          setGameStats(prev => ({...prev, accountCreated: today.toLocaleDateString()}));
        }
        
        // Fetch game PnL data for this user
        fetchGamePnl(parsedUserData.id);
        
        // Fetch owned GIFs
        fetchOwnedGifs(parsedUserData);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setIsLoading(false);
    }
  }, []);

  const fetchGamePnl = async (userId: number) => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    
    try {
      // Construct the API endpoint URL
      const apiEndpoint = `${import.meta.env.VITE_API_BASE_URL || ''}/game_pnl/${userId}`;
      // console.log("Fetching game PnL data from:", apiEndpoint);
      
      const response = await fetch(apiEndpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data: GamePnl[] = await response.json();
      // console.log("Game PnL data received:", data);
      setUserGamePnl(data);
      
      // Calculate statistics from game PnL data
      calculateStats(data);
    } catch (error) {
      console.error("Error fetching game PnL data:", error);
      // Use zeros for missing data
      setGameStats({
        totalMatches: 0,
        winRate: 0,
        totalProfit: 0,
        biggestWin: 0,
        biggestLoss: 0,
        averageProfit: 0,
        wins: 0,
        losses: 0,
        mostActiveDay: 'Unknown',
        accountCreated: gameStats.accountCreated
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchOwnedGifs = (userData: any) => {
    try {
      // Add these two free GIFs that every user gets
      const freeGifs = [
        {
          id: 18,
          name: "Angry Squidward",
          price: 0,
          url: "/assets/gifs/Angry Spongebob Squarepants GIF.gif",
          rarity: "Epic"
        },
        {
          id: 19,
          name: "The Booty Shake",
          price: 0,
          url: "/assets/gifs/The Simpsons Dance GIF.gif",
          rarity: "Epic"
        }
      ];
      
      // Start with the free GIFs
      let userGifs = [...freeGifs];
      
      // If user has purchased GIFs, add those too
      if (userData?.gif_ids && userData.gif_ids.length > 0) {
        // Import GIF data
        import('../../data/gifData').then(({ gifNfts }) => {
          // Find GIFs that match the IDs in userData.gif_ids
          const purchasedGifs = userData.gif_ids
            .map((id: number) => gifNfts.find(gif => gif.id === id))
            .filter(Boolean) // Remove any undefined entries
            .map((gif: any) => ({
              id: gif?.id || 0,
              name: gif?.name || "",
              price: gif?.price || 0,
              url: gif?.url || "",
              rarity: gif?.rarity || "Common"
            }));
            
          // Combine free GIFs with purchased GIFs
          userGifs = [...userGifs, ...purchasedGifs];
          setOwnedGifs(userGifs);
        }).catch(error => {
          console.error("Failed to import GIF data:", error);
          // If import fails, at least set the free GIFs
          setOwnedGifs(freeGifs);
        });
      } else {
        // If user doesn't have any purchased GIFs, just set the free ones
        setOwnedGifs(freeGifs);
      }
    } catch (error) {
      console.error("Error loading owned GIFs:", error);
      setOwnedGifs([]);
    }
  };

  // Calculate statistics from the game PnL data
  const calculateStats = (pnlData: GamePnl[]) => {
    if (!pnlData || pnlData.length === 0) {
      return;
    }
    
    // Total matches is the count of PnL entries
    const totalMatches = pnlData.length;
    
    // Count wins and losses
    const wins = pnlData.filter(game => game.profit > 0).length;
    const losses = pnlData.filter(game => game.profit <= 0).length;
    
    // Calculate win rate
    const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;
    
    // Calculate total profit
    const totalProfit = pnlData.reduce((sum, game) => sum + game.profit, 0);
    
    // Find biggest win and loss
    const biggestWin = Math.max(...pnlData.map(game => game.profit), 0);
    const biggestLoss = Math.min(...pnlData.map(game => game.profit), 0);
    
    // Calculate average profit per game
    const averageProfit = totalMatches > 0 ? totalProfit / totalMatches : 0;
    
    // Calculate most active day
    const dayCount: Record<string, number> = {};
    pnlData.forEach(game => {
      const day = new Date(game.created_at).toLocaleDateString('en-US', { weekday: 'long' });
      dayCount[day] = (dayCount[day] || 0) + 1;
    });
    
    const mostActiveDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
    
    // Update game stats
    setGameStats({
      totalMatches,
      winRate,
      totalProfit,
      biggestWin,
      biggestLoss,
      averageProfit,
      wins,
      losses,
      mostActiveDay,
      accountCreated: gameStats.accountCreated // Keep the existing value
    });
  };
  
  const generateSampleData = () => {
    // We no longer need sample data as we're using the actual 
    // calculated values from the game_pnl endpoint
    
    // If there's no data yet, just show zeros
    setGameStats({
      totalMatches: 0,
      winRate: 0,
      totalProfit: 0,
      biggestWin: 0,
      biggestLoss: 0,
      averageProfit: 0,
      wins: 0,
      losses: 0,
      mostActiveDay: 'Unknown',
      accountCreated: '15/05/2025' // Current date as fallback
    });
  };

  // Get the user's rank label based on their stats
  const getUserRank = () => {
    const { totalMatches, winRate } = gameStats;
    
    if (totalMatches < 5) return { label: "Cosmic Novice", tier: 1 };
    if (totalMatches >= 50 && winRate >= 75) return { label: "Galactic Champion", tier: 5 };
    if (totalMatches >= 30 && winRate >= 65) return { label: "Star Voyager", tier: 4 };
    if (totalMatches >= 20 && winRate >= 60) return { label: "Nebula Navigator", tier: 3 };
    if (totalMatches >= 10 && winRate >= 50) return { label: "Asteroid Hunter", tier: 2 };
    return { label: "Space Explorer", tier: 1 };
  };
  
  // Get rank display styling based on tier
  const getRankStyle = (tier: number) => {
    switch(tier) {
      case 5: // Highest rank - Galactic Champion
        return {
          bgClass: "bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500",
          textClass: "text-black font-bold",
          borderClass: "border-yellow-400",
          glowClass: "shadow-lg shadow-yellow-500/40",
          iconColor: "text-black",
          animClass: "animate-pulse",
          badge: "crown",
          borderWidth: "border-2"
        };
      case 4: // Star Voyager
        return {
          bgClass: "bg-gradient-to-r from-violet-400 via-purple-500 to-fuchsia-500",
          textClass: "text-white font-bold",
          borderClass: "border-purple-400",
          glowClass: "shadow-md shadow-purple-500/30",
          iconColor: "text-white",
          animClass: "",
          badge: "star",
          borderWidth: "border-2"
        };
      case 3: // Nebula Navigator
        return {
          bgClass: "bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600",
          textClass: "text-white font-semibold",
          borderClass: "border-blue-400",
          glowClass: "shadow-md shadow-blue-500/20",
          iconColor: "text-white",
          animClass: "",
          badge: "compass",
          borderWidth: "border"
        };
      case 2: // Asteroid Hunter
        return {
          bgClass: "bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600",
          textClass: "text-white font-medium",
          borderClass: "border-emerald-400",
          glowClass: "shadow-sm shadow-emerald-500/20",
          iconColor: "text-white",
          animClass: "",
          badge: "target",
          borderWidth: "border"
        };
      default: // Lowest ranks
        return {
          bgClass: "bg-emerald-500/20",
          textClass: "text-emerald-400",
          borderClass: "border-emerald-500/40",
          glowClass: "",
          iconColor: "text-emerald-400",
          animClass: "",
          badge: "user",
          borderWidth: "border"
        };
    }
  };
  const getProfitColorClass = (profit: number) => {
    return profit >= 0 ? 'text-emerald-400' : 'text-red-400';
  };
  
  // Format a date string to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render recent games for the history tab
  const renderRecentGames = () => {
    if (userGamePnl.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-zinc-400">No game history available yet.</p>
        </div>
      );
    }
    
    // Sort by most recent first
    const sortedGames = [...userGamePnl].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return (
      <div className="space-y-4">
        {sortedGames.slice(0, 15).map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="border border-emerald-500/20 bg-black/40 backdrop-blur-sm rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <p className="text-zinc-300 text-sm mb-1">Game #{game.id}</p>
              <p className="text-zinc-400 text-xs">{formatDate(game.created_at)}</p>
            </div>
            <div className="flex items-center">
              {game.profit > 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-400 mr-2" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400 mr-2" />
              )}
              <span className={`font-mono font-medium ${getProfitColorClass(game.profit)}`}>
                {game.profit > 0 ? '+' : ''}{game.profit.toFixed(3)} {game.currency}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-dark to-game-dark-light">
      <div className="min-h-screen bg-black/40 relative">
        {/* Particles Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0">
            {Particles}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-40" />
        </div>
        
        {/* Main Content */}
        <div className="relative z-10 pt-20 pb-16">
          <div className="container mx-auto px-4">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                  Cosmic Explorer Profile
                </span>
              </h1>
              <p className="text-zinc-300 max-w-2xl mx-auto">
                Your interstellar journey, cosmic collection, and galactic conquests
              </p>
            </motion.div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
              </div>
            ) : (
              <>
                {/* Explorer Profile Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-black/60 backdrop-blur-sm border border-emerald-500/30 rounded-2xl overflow-hidden shadow-xl shadow-emerald-500/10 mb-10"
                >
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                      {/* Avatar & Badge */}
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/60 flex items-center justify-center overflow-hidden">
                            <User className="w-12 h-12 text-emerald-400" />
                          </div>
                          <div className="absolute -bottom-2 -right-2 bg-black/80 border border-emerald-500/40 rounded-full px-2 py-1">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                          </div>
                        </div>
                        <div className="mt-4">
                          {(() => {
                            const userRank = getUserRank();
                            const rankStyle = getRankStyle(userRank.tier);
                            return (
                              <div className={`relative inline-flex rounded-lg overflow-hidden ${rankStyle.borderWidth} ${rankStyle.borderClass} ${rankStyle.glowClass}`}>
                                <div className={`px-3 py-1 ${rankStyle.bgClass} ${rankStyle.textClass} flex items-center text-sm`}>
                                  {/* Badge icon based on rank */}
                                  {rankStyle.badge === 'crown' && (
                                    <div className={`flex items-center justify-center w-5 h-5 mr-1.5 ${rankStyle.animClass}`}>
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${rankStyle.iconColor}`}>
                                        <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224a.75.75 0 01.401-.615L17.152 7.5l-8.373-4.5c-.169-.09-.376-.09-.545 0L7.5 3.75h6.75a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75v-.646a.75.75 0 01.396-.66l7.5-4.5a.75.75 0 01.752 0z" />
                                        <path d="M15.75 15.75a.75.75 0 110 1.5A2.25 2.25 0 0013.5 19.5h-3a2.25 2.25 0 01-2.25-2.25v-.75a.75.75 0 011.5 0v.75a.75.75 0 00.75.75h3a.75.75 0 00.75-.75.75.75 0 01.75-.75z" />
                                        <path d="M4.25 6.5a.75.75 0 10-1.5 0v8.25a3.75 3.75 0 003.75 3.75h9a3.75 3.75 0 003.75-3.75V10.5a.75.75 0 00-1.5 0v4.25a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25V6.5z" />
                                      </svg>
                                    </div>
                                  )}
                                  {rankStyle.badge === 'star' && (
                                    <div className="w-5 h-5 mr-1.5">
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${rankStyle.iconColor}`}>
                                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                  {rankStyle.badge === 'compass' && (
                                    <div className="w-5 h-5 mr-1.5">
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${rankStyle.iconColor}`}>
                                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM8.547 4.505a8.25 8.25 0 1011.672 8.214l-.46-.46a2.252 2.252 0 01-.422-.586l-1.08-2.16a.414.414 0 00-.663-.107.827.827 0 01-.812.21l-1.273-.363a.89.89 0 00-.738 1.595l.587.39c.59.395.674 1.23.172 1.732l-.2.2c-.212.212-.33.498-.33.796v.41c0 .409-.11.809-.32 1.158l-1.315 2.191a2.11 2.11 0 01-1.81 1.025 1.055 1.055 0 01-1.055-1.055v-1.172c0-.92-.56-1.747-1.414-2.089l-.655-.261a2.25 2.25 0 01-1.383-2.46l.007-.042a2.25 2.25 0 01.29-.787l.09-.15a2.25 2.25 0 012.37-1.048l1.178.236a1.125 1.125 0 001.302-.795l.208-.73a1.125 1.125 0 00-.578-1.315l-.665-.332-.091.091a2.25 2.25 0 01-1.591.659h-.18c-.249 0-.487.1-.662.274a.931.931 0 01-1.458-1.137l1.411-2.353a2.25 2.25 0 00.286-.76m11.928 9.057A9.864 9.864 0 0012 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75a9.864 9.864 0 00-.225-2.115z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                  {rankStyle.badge === 'target' && (
                                    <div className="w-5 h-5 mr-1.5">
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${rankStyle.iconColor}`}>
                                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 8.625a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM15.375 12a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                  {rankStyle.badge === 'user' && (
                                    <div className="w-5 h-5 mr-1.5">
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${rankStyle.iconColor}`}>
                                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                  
                                  <span>{userRank.label}</span>
                                  
                                  {/* Add sparkles for top tiers (smaller size) */}
                                  {userRank.tier >= 3 && (
                                    <Sparkles className={`w-3 h-3 ml-1 ${rankStyle.iconColor} ${userRank.tier >= 4 ? rankStyle.animClass : ""}`} />
                                  )}
                                </div>
                                
                                {/* Special effects for top tiers */}
                                {userRank.tier >= 4 && (
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-slow" />
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                      
                      {/* Profile Info */}
                      <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                          {userData?.name || "Anonymous Explorer"}
                        </h2>
                        <p className="text-zinc-400 text-sm mb-4">
                          Explorer ID: #{userData?.id || "Unknown"}
                        </p>
                        
                        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                          <div className="flex items-center justify-center md:justify-start gap-2">
                            <Calendar className="w-4 h-4 text-emerald-400" />
                            <span className="text-zinc-300 text-sm">
                              Joined: {gameStats.accountCreated}
                            </span>
                          </div>
                          <div className="flex items-center justify-center md:justify-start gap-2">
                            <Trophy className="w-4 h-4 text-emerald-400" />
                            <span className="text-zinc-300 text-sm">
                              Win Rate: {gameStats.winRate.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-center md:justify-start gap-2">
                            <Wallet className="w-4 h-4 text-emerald-400" />
                            <span className="text-zinc-300 text-sm">
                              Balance: {balance.toFixed(3)} SOL
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Stats Summary */}
                      <div className="flex flex-col md:flex-row gap-4 md:border-l border-emerald-500/20 md:pl-8">
                        <div className="text-center">
                          <p className="text-zinc-400 text-sm">Total Matches</p>
                          <p className="text-2xl font-bold text-white">{gameStats.totalMatches}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-zinc-400 text-sm">Total Profit</p>
                          <p className={`text-2xl font-bold ${getProfitColorClass(gameStats.totalProfit)}`}>
                            {gameStats.totalProfit > 0 ? '+' : ''}{gameStats.totalProfit.toFixed(3)} SOL
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-zinc-400 text-sm">NFTs Owned</p>
                          <p className="text-2xl font-bold text-white">{ownedGifs.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Tab Navigation */}
                <div className="flex justify-center mb-8">
                  <div className="bg-black/60 backdrop-blur-sm border border-emerald-500/30 rounded-full p-1 flex">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeTab === 'overview'
                          ? 'bg-emerald-500 text-black'
                          : 'text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab('collection')}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeTab === 'collection'
                          ? 'bg-emerald-500 text-black'
                          : 'text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      GIF Collection
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeTab === 'history'
                          ? 'bg-emerald-500 text-black'
                          : 'text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      Game History
                    </button>
                  </div>
                </div>
                
                {/* Tab Content */}
                <div className="pb-10">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {/* Win/Loss Record */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                          className="bg-black/60 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6 shadow-lg shadow-emerald-500/5"
                        >
                          <h3 className="flex items-center text-lg font-medium text-white mb-4">
                            <Trophy className="w-5 h-5 text-emerald-400 mr-2" />
                            Win/Loss Record
                          </h3>
                          
                          <div className="h-4 bg-black/60 rounded-full overflow-hidden mb-4">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                              style={{ width: `${gameStats.winRate}%` }}
                            ></div>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <div>
                              <span className="text-emerald-400 font-bold">{gameStats.wins}</span>
                              <span className="text-zinc-400 ml-1">wins</span>
                            </div>
                            <div className="text-center">
                              <span className="text-white font-bold">{gameStats.winRate.toFixed(1)}%</span>
                              <span className="text-zinc-400 ml-1">win rate</span>
                            </div>
                            <div>
                              <span className="text-red-400 font-bold">{gameStats.losses}</span>
                              <span className="text-zinc-400 ml-1">losses</span>
                            </div>
                          </div>
                        </motion.div>
                        
                        {/* Best & Worst Games */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                          className="bg-black/60 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6 shadow-lg shadow-emerald-500/5"
                        >
                          <h3 className="flex items-center text-lg font-medium text-white mb-4">
                            <Zap className="w-5 h-5 text-emerald-400 mr-2" />
                            Best & Worst Games
                          </h3>
                          
                          <div className="space-y-4">
                            <div>
                              <p className="text-zinc-400 text-sm mb-1">Biggest Win:</p>
                              <p className="text-emerald-400 font-mono text-xl font-medium">
                                +{gameStats.biggestWin.toFixed(3)} SOL
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-zinc-400 text-sm mb-1">Biggest Loss:</p>
                              <p className="text-red-400 font-mono text-xl font-medium">
                                {gameStats.biggestLoss.toFixed(3)} SOL
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-zinc-400 text-sm mb-1">Average Profit:</p>
                              <p className={`font-mono text-xl font-medium ${getProfitColorClass(gameStats.averageProfit)}`}>
                                {gameStats.averageProfit > 0 ? '+' : ''}{gameStats.averageProfit.toFixed(3)} SOL
                              </p>
                            </div>
                          </div>
                        </motion.div>
                        
                        {/* Play Patterns */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.3 }}
                          className="bg-black/60 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6 shadow-lg shadow-emerald-500/5"
                        >
                          <h3 className="flex items-center text-lg font-medium text-white mb-4">
                            <Clock className="w-5 h-5 text-emerald-400 mr-2" />
                            Play Patterns
                          </h3>
                          
                          <div className="space-y-4">
                            <div>
                              <p className="text-zinc-400 text-sm mb-1">Total Matches:</p>
                              <p className="text-white text-xl font-medium">{gameStats.totalMatches}</p>
                            </div>
                            
                            <div>
                              <p className="text-zinc-400 text-sm mb-1">Most Active Day:</p>
                              <p className="text-white text-xl font-medium">{gameStats.mostActiveDay}</p>
                            </div>
                            
                            <div>
                              <p className="text-zinc-400 text-sm mb-1">Account Age:</p>
                              <p className="text-white text-xl font-medium">
                                {(() => {
                                  try {
                                    const created = new Date(gameStats.accountCreated);
                                    const now = new Date();
                                    const diffTime = Math.abs(now.getTime() - created.getTime());
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    return `${diffDays} days`;
                                  } catch (e) {
                                    return "Unknown";
                                  }
                                })()}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                      
                      {/* Recent Games */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                        className="bg-black/60 backdrop-blur-sm border border-emerald-500/30 rounded-xl overflow-hidden shadow-lg shadow-emerald-500/5 mb-8"
                      >
                        <div className="p-6">
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="flex items-center text-lg font-medium text-white">
                              <BarChart4 className="w-5 h-5 text-emerald-400 mr-2" />
                              Recent Game Performance
                            </h3>
                            
                            <button
                              onClick={() => setActiveTab('history')}
                              className="flex items-center text-emerald-400 text-sm hover:text-emerald-300 transition-colors"
                            >
                              View All <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                          </div>
                          
                          {userGamePnl.length === 0 ? (
                            <div className="text-center py-4">
                              <p className="text-zinc-400">No game history available yet.</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {userGamePnl
                                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                .slice(0, 5)
                                .map((game, index) => (
                                  <motion.div
                                    key={game.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className={`flex justify-between items-center p-3 rounded-lg ${
                                      game.profit > 0 
                                        ? 'bg-emerald-500/10 border border-emerald-500/20' 
                                        : 'bg-red-500/10 border border-red-500/20'
                                    }`}
                                  >
                                    <div className="flex items-center">
                                      {game.profit > 0 ? (
                                        <TrendingUp className="w-4 h-4 text-emerald-400 mr-2" />
                                      ) : (
                                        <TrendingDown className="w-4 h-4 text-red-400 mr-2" />
                                      )}
                                      <span>Game #{game.id}</span>
                                    </div>
                                    
                                    <div>
                                      <span className={`font-mono font-medium ${getProfitColorClass(game.profit)}`}>
                                        {game.profit > 0 ? '+' : ''}{game.profit.toFixed(3)} {game.currency}
                                      </span>
                                    </div>
                                  </motion.div>
                                ))
                              }
                            </div>
                          )}
                        </div>
                      </motion.div>
                      
                      {/* Player Stats Highlights */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Collection Highlights */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.5 }}
                          className="bg-black/60 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6 shadow-lg shadow-emerald-500/5"
                        >
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="flex items-center text-lg font-medium text-white">
                              <PackageOpen className="w-5 h-5 text-emerald-400 mr-2" />
                              Collection Highlights
                            </h3>
                            
                            <button
                              onClick={() => setActiveTab('collection')}
                              className="flex items-center text-emerald-400 text-sm hover:text-emerald-300 transition-colors"
                            >
                              View All <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                          </div>
                          
                          {ownedGifs.length === 0 ? (
                            <div className="text-center py-4">
                              <p className="text-zinc-400">No GIFs in your collection yet.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 gap-3">
                              {ownedGifs.slice(0, 6).map((gif, index) => (
                                <motion.div
                                  key={gif.id}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.3, delay: index * 0.1 }}
                                  className={`relative rounded-lg overflow-hidden border ${rarityColors[gif.rarity].border} ${rarityColors[gif.rarity].glow}`}
                                >
                                  <div className="aspect-square">
                                    <img 
                                      src={gif.url} 
                                      alt={gif.name} 
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.onerror = null;
                                        target.src = 'https://placehold.co/400x400/1a2e35/10b981?text=GIF+Not+Found';
                                      }}
                                    />
                                  </div>
                                  <div className={`absolute top-1 right-1 ${rarityColors[gif.rarity].bg} px-2 py-0.5 rounded-full text-xs ${rarityColors[gif.rarity].text}`}>
                                    {gif.rarity}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                          
                          <div className="mt-4 text-center">
                            <p className="text-zinc-400 text-sm">
                              You own <span className="text-emerald-400 font-medium">{ownedGifs.length}</span> cosmic GIFs
                            </p>
                          </div>
                        </motion.div>
                        
                        {/* Profile Achievements */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.6 }}
                          className="bg-black/60 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6 shadow-lg shadow-emerald-500/5"
                        >
                          <h3 className="flex items-center text-lg font-medium text-white mb-6">
                            <Shield className="w-5 h-5 text-emerald-400 mr-2" />
                            Explorer Achievements
                          </h3>
                          
                          <div className="space-y-4">
                              {[
                              { 
                                name: "First Steps", 
                                description: "Completed your first cosmic game", 
                                unlocked: gameStats.totalMatches > 0 
                              },
                              { 
                                name: "Profitable Explorer", 
                                description: "Achieve positive total profit", 
                                unlocked: gameStats.totalProfit > 0 
                              },
                              { 
                                name: "Collection Started", 
                                description: "Own your first NFT GIF", 
                                unlocked: ownedGifs.length > 2 
                              },
                              { 
                                name: "Veteran Voyager", 
                                description: "Complete 10+ cosmic games", 
                                unlocked: gameStats.totalMatches >= 10 
                              },
                              { 
                                name: "Skilled Navigator", 
                                description: "Achieve a 75%+ win rate", 
                                unlocked: gameStats.winRate >= 75 && gameStats.totalMatches >= 5 
                              }
                            ].map((achievement, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className={`flex items-center p-3 rounded-lg ${
                                  achievement.unlocked 
                                    ? 'bg-emerald-500/10 border border-emerald-500/20' 
                                    : 'bg-zinc-800/30 border border-zinc-700/20'
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                  achievement.unlocked 
                                    ? 'bg-emerald-500/20 text-emerald-400' 
                                    : 'bg-zinc-800 text-zinc-500'
                                }`}>
                                  {achievement.unlocked ? (
                                    <Shield className="w-4 h-4" />
                                  ) : (
                                    <Lock className="w-4 h-4" />
                                  )}
                                </div>
                                <div>
                                  <p className={`font-medium ${achievement.unlocked ? 'text-white' : 'text-zinc-500'}`}>
                                    {achievement.name}
                                  </p>
                                  <p className="text-xs text-zinc-400">
                                    {achievement.description}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* GIF Collection Tab */}
                  {activeTab === 'collection' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="bg-black/60 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6 shadow-lg shadow-emerald-500/5 mb-6">
                        <h3 className="flex items-center text-lg font-medium text-white mb-6">
                          <PackageOpen className="w-5 h-5 text-emerald-400 mr-2" />
                          Your Cosmic GIF Collection
                        </h3>
                        
                        {ownedGifs.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-zinc-400 mb-4">No GIFs in your collection yet.</p>
                            <a 
                              href="/marketplace" 
                              className="inline-flex items-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Browse Marketplace
                            </a>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {ownedGifs.map((gif, index) => (
                              <motion.div
                                key={gif.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 1) }}
                                className={`relative overflow-hidden rounded-lg border ${rarityColors[gif.rarity].border} bg-black/60 backdrop-blur-sm transition-all hover:shadow-lg ${rarityColors[gif.rarity].glow} transform hover:scale-[1.02]`}
                              >
                                {/* Animated Border Glow */}
                                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent animate-gradient-x rounded-lg"></div>
                                
                                {/* Rarity Badge */}
                                <div className={`absolute top-2 right-2 z-20 px-2 py-0.5 rounded-full text-xs font-medium ${rarityColors[gif.rarity].bg} ${rarityColors[gif.rarity].text}`}>
                                  {gif.rarity}
                                </div>
                                
                                {/* GIF Image */}
                                <div className="aspect-square overflow-hidden">
                                  <img
                                    src={gif.url}
                                    alt={gif.name}
                                    className="w-full h-full object-cover transition-all duration-700 hover:scale-110"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.onerror = null;
                                      target.src = 'https://placehold.co/400x400/1a2e35/10b981?text=GIF+Not+Found';
                                    }}
                                  />
                                </div>
                                
                                {/* NFT Info */}
                                <div className="p-3 bg-black/70 backdrop-blur-sm border-t border-emerald-500/10">
                                  <h3 className="text-white font-medium text-sm mb-1 truncate">{gif.name}</h3>
                                  
                                  {gif.price ? (
                                    <div className="text-emerald-400 font-mono text-xs">
                                      {gif.price.toFixed(2)} SOL
                                    </div>
                                  ) : (
                                    <div className="text-emerald-400 font-mono text-xs">
                                      Free Gift
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="flex justify-center"
                      >
                        <a 
                          href="/marketplace" 
                          className="inline-flex items-center px-6 py-3 bg-emerald-500 rounded-lg text-black font-medium hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Visit Marketplace for More GIFs
                        </a>
                      </motion.div>
                    </motion.div>
                  )}
                  
                  {/* Game History Tab */}
                  {activeTab === 'history' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      className="bg-black/60 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6 shadow-lg shadow-emerald-500/5"
                    >
                      <h3 className="flex items-center text-lg font-medium text-white mb-6">
                        <LineChart className="w-5 h-5 text-emerald-400 mr-2" />
                        Your Cosmic Game History
                      </h3>
                      
                      {renderRecentGames()}
                    </motion.div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;