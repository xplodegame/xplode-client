import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Coins, ArrowUpDown, Users, TrendingUp, Clock } from 'lucide-react';
import { useParticles } from '../../components/LandingPage/Particles';

interface LeaderboardEntry {
  id: number;
  user_id: number;
  network: string;
  total_matches: number;  
  total_profit: number;   
  created_at: string;
  updated_at: string;
  // Additional fields we'll fetch from user details
  name?: string;
  email?: string;
}

const LeaderboardPage: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'total_profit' | 'total_matches'>('total_profit');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [timeframe, setTimeframe] = useState<string>('all'); // Default timeframe
  const Particles = useParticles();

  useEffect(() => {
    fetchLeaderboardData();
  }, [timeframe]);

  const currency = 'MON';

  const fetchLeaderboardData = async () => {
    try {
      setIsLoading(true);
      // Get base URL from environment
      const baseUrl = import.meta.env.VITE_LEADERBOARD_ENDPOINT_URL || '';
      // Remove trailing slash if present
      const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      
      // Fixed URL construction - remove the duplicate "leaderboard" in the path
      // The API expects /leaderboard/{network}/{timeframe} not /leaderboard/leaderboard/{network}/{timeframe}
      const endpoint = `${cleanBaseUrl}/${currency}/${timeframe}`;
      
      console.log("Fetching from:", endpoint);
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("################################: ", data);
      setLeaderboardData(data);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      // Set empty array to prevent errors in rendering
      setLeaderboardData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (key: 'total_profit' | 'total_matches') => {
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
    if (typeof n !== 'number' || isNaN(n)) return '0th';
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  
  // Updated network options based on DB data
  // Changed the MONAD network value to match the backend's expected parameter
  const timeframes = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: 'all', label: 'All Time' }
  ];

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
            
            {/* Network and Timeframe Selector */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-8 flex flex-col md:flex-row gap-4 justify-center"
            >
                {/* <div className="bg-black/60 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                    <Network className="h-5 w-5 text-emerald-400" />
                    <span className="text-zinc-300 text-sm">Network:</span>
                    <div className="flex gap-2">
                        {networks.map((net) => (
                            <button
                                key={net}
                                onClick={() => setCurrency(net)}
                                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                                    currency === net
                                        ? 'bg-emerald-500 text-black font-medium'
                                        : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                                }`}
                            >
                                {net}
                            </button>
                        ))}
                    </div>
                </div> */}
                
                <div className="bg-black/60 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                    <Clock className="h-5 w-5 text-emerald-400" />
                    <span className="text-zinc-300 text-sm">Timeframe:</span>
                    <div className="flex gap-2">
                        {timeframes.map((time) => (
                            <button
                                key={time.value}
                                onClick={() => setTimeframe(time.value)}
                                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                                    timeframe === time.value
                                        ? 'bg-emerald-500 text-black font-medium'
                                        : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                                }`}
                            >
                                {time.label}
                            </button>
                        ))}
                    </div>
                </div>
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
                            `${leaderboardData.sort((a, b) => b.total_profit - a.total_profit)[0].total_profit.toFixed(3)} MON` : 
                            '0 MON'}
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
                        {leaderboardData.reduce((sum, item) => sum + item.total_matches, 0)}
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
                            onClick={() => handleSort('total_matches')}>
                            <div className="flex items-center gap-2">
                            Matches
                            <ArrowUpDown className="h-4 w-4" />
                            </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-emerald-400 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('total_profit')}>
                            <div className="flex items-center gap-2">
                            Profit
                            <ArrowUpDown className="h-4 w-4" />
                            </div>
                        </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-500/10">
                        {sortedData.map((player, index) => (
                            <motion.tr 
                                key={`${player.id}-${player.user_id}-${index}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 * Math.min(index, 10) }}
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
                                            {((player.user_id ?? 0) || 0).toString().padStart(2, '0')}
                                          </span>
                                        </div>
                                        <div>
                                          <div className="text-sm font-medium text-white">
                                            {player.name || `Explorer #${player.user_id ?? 'Unknown'}`}
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
                                        <span className="text-zinc-300">{player.total_matches}</span>
                                    </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <Coins className="h-4 w-4 text-emerald-400 mr-2" />
                                        <span className={`font-mono ${(player.total_profit ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {(player.total_profit ?? 0) >= 0 ? '+' : ''}{(player.total_profit ?? 0).toFixed(3)} MON
                                        </span>
                                    </div>
                                    </td>
                                </motion.tr>
                                )
                        )}
                        
                        {sortedData.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-zinc-400">
                            No explorers have ventured into the cosmic grid on {currency} in this timeframe yet.
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
                    {[
                        "Start with smaller grids to master navigation techniques",
                        "Practice anticipating anomaly patterns",
                        "Maintain a balanced risk strategy for maximum profits",
                        "Join multiplayer games for bigger reward pools"
                    ].map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <div className="bg-emerald-500/10 p-1 rounded-full mt-1">
                                <div className="h-2 w-2 bg-emerald-400 rounded-full"></div>
                            </div>
                            <span>{tip}</span>
                        </li>
                    ))}
                </ul>
            </motion.div>
            
            </div>
        </div>
        </div>
    </div>
  );
};

export default LeaderboardPage;

// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { Trophy, Coins, ArrowUpDown, Users, TrendingUp, Clock, Network } from 'lucide-react';
// import { useParticles } from '../../components/LandingPage/Particles';

// interface LeaderboardEntry {
//   id: number;
//   user_id: number;
//   network: string;
//   total_matches: number;  
//   total_profit: number;   
//   created_at: string;
//   updated_at: string;
//   // Additional fields we'll fetch from user details
//   name?: string;
//   email?: string;
// }

// const LeaderboardPage: React.FC = () => {
//   const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [sortBy, setSortBy] = useState<'total_profit' | 'total_matches'>('total_profit');
//   const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
//   const [currency, setCurrency] = useState<string>('MON'); // Default to MONAD based on DB data
//   const [timeframe, setTimeframe] = useState<string>('all'); // Default timeframe
//   const Particles = useParticles();

//   useEffect(() => {
//     fetchLeaderboardData();
//   }, [currency, timeframe]);

//   const fetchLeaderboardData = async () => {
//     try {
//       setIsLoading(true);
//       // Get base URL from environment
//       const baseUrl = import.meta.env.VITE_LEADERBOARD_ENDPOINT_URL || '';
//       // Remove trailing slash if present
//       const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      
//       // Fixed URL construction - remove the duplicate "leaderboard" in the path
//       // The API expects /leaderboard/{network}/{timeframe} not /leaderboard/leaderboard/{network}/{timeframe}
//       const endpoint = `${cleanBaseUrl}/${currency}/${timeframe}`;
      
//       console.log("Fetching from:", endpoint);
//       const response = await fetch(endpoint);
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log("################################: ", data);
//       setLeaderboardData(data);
//     } catch (error) {
//       console.error('Error fetching leaderboard data:', error);
//       // Set empty array to prevent errors in rendering
//       setLeaderboardData([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSort = (key: 'total_profit' | 'total_matches') => {
//     if (sortBy === key) {
//       // Toggle direction if clicking the same column
//       setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
//     } else {
//       // Default to descending for new column
//       setSortBy(key);
//       setSortDirection('desc');
//     }
//   };

//   const sortedData = [...leaderboardData].sort((a, b) => {
//     const multiplier = sortDirection === 'asc' ? 1 : -1;
//     return (a[sortBy] - b[sortBy]) * multiplier;
//   });

//   const getOrdinal = (n: number) => {
//     if (typeof n !== 'number' || isNaN(n)) return '0th';
//     const s = ['th', 'st', 'nd', 'rd'];
//     const v = n % 100;
//     return n + (s[(v - 20) % 10] || s[v] || s[0]);
//   };
  
//   // Updated network options based on DB data
//   // Changed the MONAD network value to match the backend's expected parameter
//   const networks = ['MONAD', 'ETH', 'BLAST'];
//   const timeframes = [
//     { value: '24h', label: 'Last 24 Hours' },
//     { value: 'all', label: 'All Time' }
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-game-dark to-game-dark-light">
//         <div className="min-h-screen bg-black/40 relative">
//         {/* Particles Background */}
//         <div className="fixed inset-0 z-0">
//             <div className="absolute inset-0">
//             {Particles}
//             </div>
//             <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-40" />
//         </div>
        
//         <div className="relative z-10 pt-20 pb-20">
//             <div className="container mx-auto px-4">
            
//             {/* Header */}
//             <motion.div
//                 initial={{ opacity: 0, y: -20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5 }}
//                 className="mb-10 text-center"
//             >
//                 <h1 className="text-4xl md:text-5xl font-bold mb-4">
//                 <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 bg-clip-text text-transparent">
//                     Cosmic Explorers Leaderboard
//                 </span>
//                 </h1>
//                 <p className="text-zinc-300 max-w-2xl mx-auto">
//                 The galaxy's most skilled navigators, ranked by their cosmic profits and survival tactics.
//                 </p>
//             </motion.div>
            
//             {/* Network and Timeframe Selector */}
//             <motion.div 
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: 0.1 }}
//                 className="mb-8 flex flex-col md:flex-row gap-4 justify-center"
//             >
//                 <div className="bg-black/60 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
//                     <Network className="h-5 w-5 text-emerald-400" />
//                     <span className="text-zinc-300 text-sm">Network:</span>
//                     <div className="flex gap-2">
//                         {networks.map((net) => (
//                             <button
//                                 key={net}
//                                 onClick={() => setCurrency(net)}
//                                 className={`px-3 py-1 rounded-lg text-sm transition-colors ${
//                                     currency === net
//                                         ? 'bg-emerald-500 text-black font-medium'
//                                         : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
//                                 }`}
//                             >
//                                 {net}
//                             </button>
//                         ))}
//                     </div>
//                 </div>
                
//                 <div className="bg-black/60 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
//                     <Clock className="h-5 w-5 text-emerald-400" />
//                     <span className="text-zinc-300 text-sm">Timeframe:</span>
//                     <div className="flex gap-2">
//                         {timeframes.map((time) => (
//                             <button
//                                 key={time.value}
//                                 onClick={() => setTimeframe(time.value)}
//                                 className={`px-3 py-1 rounded-lg text-sm transition-colors ${
//                                     timeframe === time.value
//                                         ? 'bg-emerald-500 text-black font-medium'
//                                         : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
//                                 }`}
//                             >
//                                 {time.label}
//                             </button>
//                         ))}
//                     </div>
//                 </div>
//             </motion.div>
            
//             {/* Stats Cards */}
//             {!isLoading && (
//                 <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: 0.2 }}
//                 className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
//                 >
//                 {/* Total Players */}
//                 <div className="bg-black/60 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 shadow-lg shadow-emerald-500/5">
//                     <div className="flex items-center gap-4">
//                     <div className="bg-emerald-500/20 p-3 rounded-lg">
//                         <Users className="h-6 w-6 text-emerald-400" />
//                     </div>
//                     <div>
//                         <h3 className="text-zinc-400 text-sm font-medium">Total Explorers</h3>
//                         <p className="text-2xl font-bold text-white">
//                         {leaderboardData.length}
//                         </p>
//                     </div>
//                     </div>
//                 </div>
                
//                 {/* Top Profit */}
//                 <div className="bg-black/60 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 shadow-lg shadow-emerald-500/5">
//                     <div className="flex items-center gap-4">
//                     <div className="bg-emerald-500/20 p-3 rounded-lg">
//                         <TrendingUp className="h-6 w-6 text-emerald-400" />
//                     </div>
//                     <div>
//                         <h3 className="text-zinc-400 text-sm font-medium">Highest Profit</h3>
//                         <p className="text-2xl font-bold text-white">
//                         {leaderboardData.length > 0 ? 
//                             `${leaderboardData.sort((a, b) => b.total_profit - a.total_profit)[0].total_profit.toFixed(3)} MON` : 
//                             '0 MON'}
//                         </p>
//                     </div>
//                     </div>
//                 </div>
                
//                 {/* Total Matches */}
//                 <div className="bg-black/60 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 shadow-lg shadow-emerald-500/5">
//                     <div className="flex items-center gap-4">
//                     <div className="bg-emerald-500/20 p-3 rounded-lg">
//                         <TrendingUp className="h-6 w-6 text-emerald-400" />
//                     </div>
//                     <div>
//                         <h3 className="text-zinc-400 text-sm font-medium">Total Matches</h3>
//                         <p className="text-2xl font-bold text-white">
//                         {leaderboardData.reduce((sum, item) => sum + item.total_matches, 0)}
//                         </p>
//                     </div>
//                     </div>
//                 </div>
//                 </motion.div>
//             )}
            
//             {/* Leaderboard Table */}
//             <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: 0.4 }}
//                 className="bg-black/60 backdrop-blur-sm border border-emerald-500/20 rounded-xl overflow-hidden shadow-xl shadow-emerald-500/5"
//             >
//                 {isLoading ? (
//                 <div className="p-10 flex items-center justify-center min-h-[400px]">
//                     <div className="flex flex-col items-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
//                     <p className="text-emerald-400 text-lg">Loading cosmic data...</p>
//                     </div>
//                 </div>
//                 ) : (
//                 <div className="overflow-x-auto">
//                     <table className="w-full">
//                     <thead>
//                         <tr className="bg-emerald-500/10">
//                         <th className="px-6 py-4 text-left text-xs font-medium text-emerald-400 uppercase tracking-wider">
//                             Rank
//                         </th>
//                         <th className="px-6 py-4 text-left text-xs font-medium text-emerald-400 uppercase tracking-wider">
//                             Explorer ID
//                         </th>
//                         <th className="px-6 py-4 text-left text-xs font-medium text-emerald-400 uppercase tracking-wider cursor-pointer"
//                             onClick={() => handleSort('total_matches')}>
//                             <div className="flex items-center gap-2">
//                             Matches
//                             <ArrowUpDown className="h-4 w-4" />
//                             </div>
//                         </th>
//                         <th className="px-6 py-4 text-left text-xs font-medium text-emerald-400 uppercase tracking-wider cursor-pointer"
//                             onClick={() => handleSort('total_profit')}>
//                             <div className="flex items-center gap-2">
//                             Profit
//                             <ArrowUpDown className="h-4 w-4" />
//                             </div>
//                         </th>
//                         <th className="px-6 py-4 text-left text-xs font-medium text-emerald-400 uppercase tracking-wider">
//                             Last Active
//                         </th>
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-emerald-500/10">
//                         {sortedData.map((player, index) => (
//                             <motion.tr 
//                                 key={`${player.id}-${player.user_id}-${index}`}
//                                     initial={{ opacity: 0, y: 10 }}
//                                     animate={{ opacity: 1, y: 0 }}
//                                     transition={{ duration: 0.3, delay: 0.1 * Math.min(index, 10) }}
//                                     className={`${index < 3 ? 'bg-emerald-500/5' : ''} hover:bg-emerald-500/10 transition-colors`}
//                                 >
//                                     <td className="px-6 py-4 whitespace-nowrap">
//                                     {index < 3 ? (
//                                         <div className="flex items-center">
//                                         <Trophy className={`h-5 w-5 mr-2 ${
//                                             index === 0 ? 'text-yellow-400' : 
//                                             index === 1 ? 'text-zinc-300' : 
//                                             'text-amber-600'
//                                         }`} />
//                                         <span className="text-white font-bold">{getOrdinal(index + 1)}</span>
//                                         </div>
//                                     ) : (
//                                         <span className="text-zinc-400">{getOrdinal(index + 1)}</span>
//                                     )}
//                                     </td>
//                                     <td className="px-6 py-4 whitespace-nowrap">
//                                     <div className="flex items-center">
//                                         <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center mr-3">
//                                           <span className="text-emerald-400 font-mono text-xs">
//                                             {((player.user_id ?? 0) || 0).toString().padStart(2, '0')}
//                                           </span>
//                                         </div>
//                                         <div>
//                                           <div className="text-sm font-medium text-white">
//                                             {player.name || `Explorer #${player.user_id ?? 'Unknown'}`}
//                                           </div>
//                                           {player.email && (
//                                             <div className="text-xs text-zinc-400">
//                                               {player.email}
//                                             </div>
//                                           )}
//                                         </div>
//                                       </div>
//                                     </td>
//                                     <td className="px-6 py-4 whitespace-nowrap">
//                                     <div className="flex items-center">
//                                         <TrendingUp className="h-4 w-4 text-emerald-400 mr-2" />
//                                         <span className="text-zinc-300">{player.total_matches}</span>
//                                     </div>
//                                     </td>
//                                     <td className="px-6 py-4 whitespace-nowrap">
//                                     <div className="flex items-center">
//                                         <Coins className="h-4 w-4 text-emerald-400 mr-2" />
//                                         <span className={`font-mono ${(player.total_profit ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
//                                         {(player.total_profit ?? 0) >= 0 ? '+' : ''}{(player.total_profit ?? 0).toFixed(3)} MON
//                                         </span>
//                                     </div>
//                                     </td>
//                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
//                                     {new Date(player.updated_at).toLocaleDateString('en-US', {
//                                         year: 'numeric',
//                                         month: 'short',
//                                         day: 'numeric'
//                                     })}
//                                     </td>
//                                 </motion.tr>
//                                 )
//                         )}
                        
//                         {sortedData.length === 0 && (
//                         <tr>
//                             <td colSpan={5} className="px-6 py-10 text-center text-zinc-400">
//                             No explorers have ventured into the cosmic grid on {currency} in this timeframe yet.
//                             </td>
//                         </tr>
//                         )}
//                     </tbody>
//                     </table>
//                 </div>
//                 )}
//             </motion.div>
            
//             {/* Tips Section */}
//             <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: 0.6 }}
//                 className="mt-10 bg-black/40 rounded-xl p-6 border border-emerald-500/20"
//             >
//                 <h3 className="text-emerald-400 text-lg font-medium mb-4">Tips for Cosmic Success</h3>
//                 <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-zinc-300">
//                     {[
//                         "Start with smaller grids to master navigation techniques",
//                         "Practice anticipating anomaly patterns",
//                         "Maintain a balanced risk strategy for maximum profits",
//                         "Join multiplayer games for bigger reward pools"
//                     ].map((tip, index) => (
//                         <li key={index} className="flex items-start gap-2">
//                             <div className="bg-emerald-500/10 p-1 rounded-full mt-1">
//                                 <div className="h-2 w-2 bg-emerald-400 rounded-full"></div>
//                             </div>
//                             <span>{tip}</span>
//                         </li>
//                     ))}
//                 </ul>
//             </motion.div>
            
//             </div>
//         </div>
//         </div>
//     </div>
//   );
// };

// export default LeaderboardPage;