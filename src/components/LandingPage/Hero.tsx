// import { motion } from 'framer-motion';
// import { Play, Users, Diamond } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { usePrivy } from '@privy-io/react-auth';
// import GameGrid from './GameGrid';
// import { useParticles } from './Particles';

// export default function Hero() {
//   const Particles = useParticles();
//   const navigate = useNavigate();
//   const { authenticated, login } = usePrivy();
  
//   const handleLaunchGame = () => {
//     navigate('/multiplayer');
//   };
  
//   return (
//     <div className="relative min-h-screen bg-black/40">
//       <div className="fixed inset-0 z-0">
//         <div className="absolute inset-0">{Particles}</div>
//         <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-40" />
//         <motion.div
//           animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
//           transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
//           className="absolute top-1/4 right-1/4 w-[800px] h-[800px] bg-emerald-500/10 blur-[150px] rounded-full"
//         />
//       </div>

//       <div className="relative z-10">
//         <section className="container mx-auto px-4 min-h-screen flex items-center">
//           <div className="grid lg:grid-cols-2 gap-16 items-center w-full py-12">
//             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
//               <motion.div 
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.3 }}
//                 className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm"
//               >
//                 <Diamond className="w-4 h-4 text-emerald-400" />
//                 <span className="text-emerald-400 text-sm font-medium">Cosmic Rewards Await</span>
//               </motion.div>
              
//               <h1 className="text-7xl font-bold tracking-tight">
//                 <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="block text-white opacity-90">
//                   Navigate the
//                 </motion.span>
//                 <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="block bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 bg-clip-text text-transparent">
//                   Cosmic Grid
//                 </motion.span>
//               </h1>
              
//               <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-xl text-zinc-300 max-w-xl leading-relaxed">
//                 Embark on an interstellar journey, competing with players across the galaxy.
//                 Hunt for cosmic diamonds while avoiding space anomalies.
//               </motion.p>

//               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex items-center gap-6">
//                 {authenticated ? (
//                   <motion.button
//                     onClick={handleLaunchGame}
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                     className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 text-black font-semibold text-lg"
//                   >
//                     <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
//                     <Play className="inline-block mr-2 h-5 w-5" /> Launch Game
//                   </motion.button>
//                 ) : (
//                   <motion.button
//                     onClick={login}
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                     className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 text-black font-semibold text-lg"
//                   >
//                     <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
//                     <Play className="inline-block mr-2 h-5 w-5" /> Sign In to Play
//                   </motion.button>
//                 )}

//                 <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-4 px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 backdrop-blur-sm">
//                   <Users className="text-emerald-400 h-5 w-5" />
//                   <div>
//                     <span className="block text-lg font-semibold text-emerald-400">2,451</span>
//                     <span className="block text-sm text-zinc-400">Cosmic Explorers</span>
//                   </div>
//                 </motion.div>
//               </motion.div>
//             </motion.div>

//             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
//               <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/30 to-emerald-500/0 rounded-3xl blur-2xl" />
//               <motion.div className="relative bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
//                 <GameGrid />
//               </motion.div>
//             </motion.div>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }

// Hero.tsx - Updated with cosmic theme while maintaining accurate gameplay
import { motion } from 'framer-motion';
import { Play, Users, Diamond } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import GameGrid from './GameGrid';
import { useParticles } from './Particles';

export default function Hero() {
  const Particles = useParticles();
  const navigate = useNavigate();
  const { authenticated, login } = usePrivy();
  
  const handleLaunchGame = () => {
    navigate('/multiplayer');
  };
  
  return (
    <div className="relative min-h-screen bg-black/40">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0">{Particles}</div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-40" />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-1/4 right-1/4 w-[800px] h-[800px] bg-emerald-500/10 blur-[150px] rounded-full"
        />
      </div>

      <div className="relative z-10">
        <section className="container mx-auto px-4 min-h-screen flex items-center">
          <div className="grid lg:grid-cols-2 gap-16 items-center w-full py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm"
              >
                <Diamond className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-medium">Cosmic Rewards on Solana</span>
              </motion.div>
              
              <h1 className="text-7xl font-bold tracking-tight">
                <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="block text-white opacity-90">
                  Navigate the
                </motion.span>
                <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="block bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                  Cosmic Grid
                </motion.span>
              </h1>
              
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-xl text-zinc-300 max-w-xl leading-relaxed">
                Embark on an interstellar journey, competing with players across the galaxy.
                Hunt for stellar diamonds while avoiding supernovas in this high-stakes galactic adventure.
              </motion.p>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex items-center gap-6">
                {authenticated ? (
                  <motion.button
                    onClick={handleLaunchGame}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 text-black font-semibold text-lg"
                  >
                    <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Play className="inline-block mr-2 h-5 w-5" /> Launch Mission
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={login}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 text-black font-semibold text-lg"
                  >
                    <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Play className="inline-block mr-2 h-5 w-5" /> Join The Fleet
                  </motion.button>
                )}

                <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-4 px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 backdrop-blur-sm">
                  <Users className="text-emerald-400 h-5 w-5" />
                  <div>
                    <span className="block text-lg font-semibold text-emerald-400">Cosmic Beta</span>
                    <span className="block text-sm text-zinc-400">Limited Space</span>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/30 to-emerald-500/0 rounded-3xl blur-2xl" />
              <motion.div className="relative bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <GameGrid />
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}