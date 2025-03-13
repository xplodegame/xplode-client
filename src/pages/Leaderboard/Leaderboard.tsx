import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Coins, ArrowUpDown, Users, TrendingUp } from 'lucide-react';
// import { useParticles } from '../../components/GameComponents/Background/GameBackgroundParticles';
import { useParticles } from '../../components/LandingPage/Particles';


interface PnlData {
  id: number;
  user_id: number;
  num_matches: number;
  profit: number;
  created_at: string;
  updated_at: string;
  // Additional fields we'll fetch from user details
  name?: string;
  email?: string;
}

const LeaderboardPage: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<PnlData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'profit' | 'num_matches'>('profit');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const Particles = useParticles();

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://127.0.0.1:8080/leaderboard');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Ensure we have only one entry per user (the most recent one)
      const uniqueUserEntries = Object.values(
        data.reduce((acc: Record<number, PnlData>, item: PnlData) => {
          // If this user_id isn't in our accumulator yet, or if it is but this entry is more recent, update
          if (!acc[item.user_id] || new Date(item.updated_at) > new Date(acc[item.user_id].updated_at)) {
            acc[item.user_id] = item;
          }
          return acc;
        }, {})
      ) as PnlData[];
      
      // Fetch additional user details for each entry if needed
      // This is commented out because it depends on your API structure
      /*
      const enhancedData = await Promise.all(
        uniqueUserEntries.map(async (entry) => {
          try {
            const userResponse = await fetch(`http://127.0.0.1:8080/user/${entry.user_id}`);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              return { ...entry, name: userData.name, email: userData.email };
            }
            return entry;
          } catch (error) {
            console.error(`Error fetching details for user ${entry.user_id}:`, error);
            return entry;
          }
        })
      );
      setLeaderboardData(enhancedData);
      */
      
      setLeaderboardData(uniqueUserEntries);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (key: 'profit' | 'num_matches') => {
    if (sortBy === key) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new column
      setSortBy(key);
      setSortDirection('desc');
    }
  };

  const sortedData = [...leaderboardData].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    return (a[sortBy] - b[sortBy]) * multiplier;
  });

  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
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
        
        <div className="relative z-10 pt-20 pb-20">
            <div className="container mx-auto px-4">
            
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-10 text-center"
            >
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                    Cosmic Explorers Leaderboard
                </span>
                </h1>
                <p className="text-zinc-300 max-w-2xl mx-auto">
                The galaxy's most skilled navigators, ranked by their cosmic profits and survival tactics.
                </p>
            </motion.div>
            
            {/* Stats Cards */}
            {!isLoading && (
                <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
                >
                {/* Total Players */}
                <div className="bg-black/60 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 shadow-lg shadow-emerald-500/5">
                    <div className="flex items-center gap-4">
                    <div className="bg-emerald-500/20 p-3 rounded-lg">
                        <Users className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-zinc-400 text-sm font-medium">Total Explorers</h3>
                        <p className="text-2xl font-bold text-white">
                        {leaderboardData.length}
                        </p>
                    </div>
                    </div>
                </div>
                
                {/* Top Profit */}
                <div className="bg-black/60 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 shadow-lg shadow-emerald-500/5">
                    <div className="flex items-center gap-4">
                    <div className="bg-emerald-500/20 p-3 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-zinc-400 text-sm font-medium">Highest Profit</h3>
                        <p className="text-2xl font-bold text-white">
                        {leaderboardData.length > 0 ? 
                            `${leaderboardData.sort((a, b) => b.profit - a.profit)[0].profit.toFixed(3)} SOL` : 
                            '0 SOL'}
                        </p>
                    </div>
                    </div>
                </div>
                
                {/* Total Matches */}
                <div className="bg-black/60 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 shadow-lg shadow-emerald-500/5">
                    <div className="flex items-center gap-4">
                    <div className="bg-emerald-500/20 p-3 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-zinc-400 text-sm font-medium">Total Matches</h3>
                        <p className="text-2xl font-bold text-white">
                        {leaderboardData.reduce((sum, item) => sum + item.num_matches, 0)}
                        </p>
                    </div>
                    </div>
                </div>
                </motion.div>
            )}
            
            {/* Leaderboard Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-black/60 backdrop-blur-sm border border-emerald-500/20 rounded-xl overflow-hidden shadow-xl shadow-emerald-500/5"
            >
                {isLoading ? (
                <div className="p-10 flex items-center justify-center min-h-[400px]">
                    <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
                    <p className="text-emerald-400 text-lg">Loading cosmic data...</p>
                    </div>
                </div>
                ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                    <thead>
                        <tr className="bg-emerald-500/10">
                        <th className="px-6 py-4 text-left text-xs font-medium text-emerald-400 uppercase tracking-wider">
                            Rank
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-emerald-400 uppercase tracking-wider">
                            Explorer ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-emerald-400 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('num_matches')}>
                            <div className="flex items-center gap-2">
                            Matches
                            <ArrowUpDown className="h-4 w-4" />
                            </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-emerald-400 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('profit')}>
                            <div className="flex items-center gap-2">
                            Profit
                            <ArrowUpDown className="h-4 w-4" />
                            </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-emerald-400 uppercase tracking-wider">
                            Last Active
                        </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-500/10">
                        {sortedData.map((player, index) => (
                        <motion.tr 
                            key={player.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 * index }}
                            className={`${index < 3 ? 'bg-emerald-500/5' : ''} hover:bg-emerald-500/10 transition-colors`}
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                            {index < 3 ? (
                                <div className="flex items-center">
                                <Trophy className={`h-5 w-5 mr-2 ${
                                    index === 0 ? 'text-yellow-400' : 
                                    index === 1 ? 'text-zinc-300' : 
                                    'text-amber-600'
                                }`} />
                                <span className="text-white font-bold">{getOrdinal(index + 1)}</span>
                                </div>
                            ) : (
                                <span className="text-zinc-400">{getOrdinal(index + 1)}</span>
                            )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center mr-3">
                                <span className="text-emerald-400 font-mono text-xs">
                                    {player.user_id.toString().padStart(2, '0')}
                                </span>
                                </div>
                                <div>
                                <div className="text-sm font-medium text-white">
                                    {player.name || `Explorer #${player.user_id}`}
                                </div>
                                {player.email && (
                                    <div className="text-xs text-zinc-400">
                                    {player.email}
                                    </div>
                                )}
                                </div>
                            </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <TrendingUp className="h-4 w-4 text-emerald-400 mr-2" />
                                <span className="text-zinc-300">{player.num_matches}</span>
                            </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <Coins className="h-4 w-4 text-emerald-400 mr-2" />
                                <span className={`font-mono ${player.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {player.profit >= 0 ? '+' : ''}{player.profit.toFixed(3)} SOL
                                </span>
                            </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                            {new Date(player.updated_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                            </td>
                        </motion.tr>
                        ))}
                        
                        {sortedData.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-zinc-400">
                            No explorers have ventured into the cosmic grid yet.
                            </td>
                        </tr>
                        )}
                    </tbody>
                    </table>
                </div>
                )}
            </motion.div>
            
            {/* Tips Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-10 bg-black/40 rounded-xl p-6 border border-emerald-500/20"
            >
                <h3 className="text-emerald-400 text-lg font-medium mb-4">Tips for Cosmic Success</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-zinc-300">
                <li className="flex items-start gap-2">
                    <div className="bg-emerald-500/10 p-1 rounded-full mt-1">
                    <div className="h-2 w-2 bg-emerald-400 rounded-full"></div>
                    </div>
                    <span>Start with smaller grids to master navigation techniques</span>
                </li>
                <li className="flex items-start gap-2">
                    <div className="bg-emerald-500/10 p-1 rounded-full mt-1">
                    <div className="h-2 w-2 bg-emerald-400 rounded-full"></div>
                    </div>
                    <span>Practice anticipating anomaly patterns</span>
                </li>
                <li className="flex items-start gap-2">
                    <div className="bg-emerald-500/10 p-1 rounded-full mt-1">
                    <div className="h-2 w-2 bg-emerald-400 rounded-full"></div>
                    </div>
                    <span>Maintain a balanced risk strategy for maximum profits</span>
                </li>
                <li className="flex items-start gap-2">
                    <div className="bg-emerald-500/10 p-1 rounded-full mt-1">
                    <div className="h-2 w-2 bg-emerald-400 rounded-full"></div>
                    </div>
                    <span>Join multiplayer games for bigger reward pools</span>
                </li>
                </ul>
            </motion.div>
            
            </div>
        </div>
        </div>
    </div>
  );
};

export default LeaderboardPage;