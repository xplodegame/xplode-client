import { motion } from 'framer-motion';
import { Play, Users, Diamond } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import GameGrid from './GameGrid';
import { useParticles } from './Particles';

export default function Hero() {
  const Particles = useParticles();
  const navigate = useNavigate();
  
  const handleLaunchGame = () => {
    navigate('/multiplayer');
  };
  
  return (
    <div className="relative min-h-screen bg-black/40">
      {/* Persistent particle background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0">
          {Particles}
        </div>
        {/* Space-themed gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-40" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute top-1/4 right-1/4 w-[800px] h-[800px] bg-emerald-500/10 blur-[150px] rounded-full"
        />
      </div>

      {/* Hero content */}
      <div className="relative z-10">
        <section className="container mx-auto px-4 min-h-screen flex items-center">
          <div className="grid lg:grid-cols-2 gap-16 items-center w-full py-12">
            {/* Left column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                          bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 
                          border border-emerald-500/20 backdrop-blur-sm"
              >
                <Diamond className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-medium">Cosmic Rewards Await</span>
              </motion.div>
              
              <h1 className="text-7xl font-bold tracking-tight">
                <motion.span 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="block text-white opacity-90"
                >
                  Navigate the
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="block bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 bg-clip-text text-transparent"
                >
                  Cosmic Grid
                </motion.span>
              </h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xl text-zinc-300 max-w-xl leading-relaxed"
              >
                Embark on an interstellar journey, competing with players across the galaxy.
                Hunt for cosmic diamonds while avoiding space anomalies.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-6"
              >
                <SignedIn>
                  <motion.button
                    onClick={handleLaunchGame}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative px-8 py-4 rounded-xl bg-gradient-to-r 
                             from-emerald-400 to-emerald-500 text-black font-semibold text-lg"
                  >
                    <div className="absolute inset-0 rounded-xl bg-white/20 
                                  opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Play className="inline-block mr-2 h-5 w-5" /> Launch Game
                  </motion.button>
                </SignedIn>

                <SignedOut>
                  <SignInButton mode="modal">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative px-8 py-4 rounded-xl bg-gradient-to-r 
                               from-emerald-400 to-emerald-500 text-black font-semibold text-lg"
                    >
                      <div className="absolute inset-0 rounded-xl bg-white/20 
                                    opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Play className="inline-block mr-2 h-5 w-5" /> Sign In to Play
                    </motion.button>
                  </SignInButton>
                </SignedOut>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-4 px-6 py-4 rounded-xl 
                           bg-gradient-to-r from-emerald-500/10 to-transparent 
                           border border-emerald-500/20 backdrop-blur-sm"
                >
                  <Users className="text-emerald-400 h-5 w-5" />
                  <div>
                    <span className="block text-lg font-semibold text-emerald-400">2,451</span>
                    <span className="block text-sm text-zinc-400">Cosmic Explorers</span>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right column - Game Grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/30 to-emerald-500/0 rounded-3xl blur-2xl" />
              <motion.div 
                className="relative bg-black/40 backdrop-blur-xl rounded-3xl p-8 
                         border border-white/10"
              >
                <GameGrid />
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}


// // Hero.tsx
// import { motion } from 'framer-motion';
// import { Play, Users, Diamond } from 'lucide-react';
// import GameGrid from './GameGrid';
// import { useParticles } from './Particles';

// export default function Hero() {
//   const Particles = useParticles();
  
//   return (
//     <div className="relative min-h-[calc(100vh-80px)] bg-[#0A0A0B]">
//       {/* Background elements */}
//       <div className="fixed inset-0 z-0">
//         <div className="absolute inset-0">
//           {Particles}
//         </div>
//         {/* Enhanced gradient overlays */}
//         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60" />
//         <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent" />
//         <motion.div
//           animate={{
//             scale: [1, 1.2, 1],
//             opacity: [0.3, 0.5, 0.3],
//           }}
//           transition={{
//             duration: 4,
//             repeat: Infinity,
//             repeatType: "reverse",
//           }}
//           className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full"
//         />
//         <motion.div
//           animate={{
//             scale: [1.2, 1, 1.2],
//             opacity: [0.2, 0.4, 0.2],
//           }}
//           transition={{
//             duration: 5,
//             repeat: Infinity,
//             repeatType: "reverse",
//           }}
//           className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-emerald-500/15 blur-[100px] rounded-full"
//         />
//       </div>

//       {/* Main content */}
//       <div className="relative z-10">
//         <section className="container mx-auto px-4 min-h-[calc(100vh-80px)] flex items-center">
//           <div className="grid lg:grid-cols-2 gap-16 items-center w-full py-12">
//             {/* Left column */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6 }}
//               className="space-y-8"
//             >
//               {/* Game tag */}
//               <motion.div 
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.3 }}
//                 className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
//                           bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 
//                           border border-emerald-500/20 backdrop-blur-sm"
//               >
//                 <Diamond className="w-4 h-4 text-emerald-400" />
//                 <span className="text-emerald-400 text-sm font-medium">Play to earn rewards</span>
//               </motion.div>
              
//               {/* Title */}
//               <h1 className="text-7xl font-bold tracking-tight">
//                 <motion.span 
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.4 }}
//                   className="block text-white opacity-90"
//                 >
//                   Master the
//                 </motion.span>
//                 <motion.span 
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.5 }}
//                   className="block bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 bg-clip-text text-transparent"
//                 >
//                   Grid Game
//                 </motion.span>
//                 <motion.span 
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.6 }}
//                   className="block text-white opacity-90"
//                 >
//                   of Strategy
//                 </motion.span>
//               </h1>
              
//               {/* Description */}
//               <motion.p 
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.7 }}
//                 className="text-xl text-zinc-400 max-w-xl leading-relaxed"
//               >
//                 Challenge players worldwide in thrilling multiplayer battles. 
//                 Find hidden diamonds, avoid deadly traps, and become the ultimate champion.
//               </motion.p>

//               {/* CTA Buttons */}
//               <motion.div 
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.8 }}
//                 className="flex items-center gap-6"
//               >
//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   className="group relative px-8 py-4 rounded-xl bg-gradient-to-r 
//                            from-emerald-400 to-emerald-500 text-black font-semibold text-lg"
//                 >
//                   <div className="absolute inset-0 rounded-xl bg-white/20 
//                                 opacity-0 group-hover:opacity-100 transition-opacity" />
//                   <Play className="inline-block mr-2 h-5 w-5" /> Play Now
//                 </motion.button>

//                 <motion.div
//                   whileHover={{ scale: 1.05 }}
//                   className="flex items-center gap-4 px-6 py-4 rounded-xl 
//                            bg-gradient-to-r from-emerald-500/10 to-transparent 
//                            border border-emerald-500/20 backdrop-blur-sm"
//                 >
//                   <Users className="text-emerald-400 h-5 w-5" />
//                   <div>
//                     <span className="block text-lg font-semibold text-emerald-400">2,451</span>
//                     <span className="block text-sm text-zinc-500">Players Online</span>
//                   </div>
//                 </motion.div>
//               </motion.div>

//               {/* Stats */}
//               <motion.div 
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.9 }}
//                 className="flex items-center gap-8 pt-4"
//               >
//                 {['24h Volume: $1.2M', 'Total Players: 50K+', 'Prize Pool: $25K'].map((stat, index) => (
//                   <motion.div 
//                     key={stat}
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 1 + index * 0.1 }}
//                     className="text-sm text-zinc-400"
//                   >
//                     {stat}
//                   </motion.div>
//                 ))}
//               </motion.div>
//             </motion.div>

//             {/* Right column - Game Grid */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.6, delay: 0.2 }}
//               className="relative"
//             >
//               <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/30 to-emerald-500/0 rounded-[30px] blur-2xl" />
//               <motion.div 
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.4 }}
//                 className="relative bg-black/20 backdrop-blur-xl rounded-[30px] p-8 
//                          border border-white/10"
//               >
//                 <GameGrid />
//               </motion.div>
//             </motion.div>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }