// // Features.tsx
// import { motion } from 'framer-motion';
// import { Users, Trophy, MessageCircle, Zap } from 'lucide-react';

// export default function Features() {
//   const features = [
//     {
//       icon: Users,
//       title: 'Multiplayer Universe',
//       description: 'Connect with players across the cosmos in epic space battles.',
//     },
//     {
//       icon: Trophy,
//       title: 'Galactic Leaderboard',
//       description: 'Rise through the ranks to become the ultimate space explorer.',
//     },
//     {
//       icon: MessageCircle,
//       title: 'Quantum Communication',
//       description: 'Real-time chat with your fellow cosmic adventurers.',
//     },
//     {
//       icon: Zap,
//       title: 'Instant Warp',
//       description: 'Jump into matches instantly with quick matchmaking.',
//     },
//   ];

//   return (
//     <section className="relative py-32 overflow-hidden bg-black/80">
//       <div className="container relative mx-auto px-4">
//         <motion.h2
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           className="text-5xl font-bold text-center mb-20"
//         >
//           Cosmic <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">Features</span>
//         </motion.h2>

//         <div className="grid md:grid-cols-2 gap-8">
//           {features.map((feature, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               transition={{ delay: index * 0.1 }}
//               className="group relative"
//             >
//               <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/30 to-emerald-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
//               <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl p-8 flex items-start gap-6 border border-white/10">
//                 <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r from-emerald-500/20 to-emerald-500/10">
//                   <feature.icon className="w-6 h-6 text-emerald-400" />
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-bold mb-2 text-white group-hover:text-emerald-400 transition-colors">
//                     {feature.title}
//                   </h3>
//                   <p className="text-zinc-400">{feature.description}</p>
//                 </div>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// Features.tsx - Updated with cosmic theme while maintaining accurate gameplay
import { motion } from 'framer-motion';
import { Users, Trophy, Shield, Zap } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Users,
      title: 'Interstellar Multiplayer',
      description: 'Challenge space explorers across the galaxy in real-time territory control battles.',
    },
    {
      icon: Trophy,
      title: 'Blazing Through the Stars',
      description: "Harness Solana’s lightning-fast finality to race, raid, and rule without delay.",
    },
    {
      icon: Shield,
      title: 'Secure Skirmishes',
      description: 'Rely on Solana’s robust validator set to defend your assets and outmaneuver foes.',
    },
    {
      icon: Zap,
      title: 'Low-Fee Galactic Warfare',
      description: "Launch battles, trades, and traps at scale thanks to Solana’s near-zero txn costs.",
    },
    
  ];

  return (
    <section className="relative py-32 overflow-hidden bg-black/80">
      <div className="container relative mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-center mb-20"
        >
          Cosmic <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">Features</span>
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/30 to-emerald-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl p-8 flex items-start gap-6 border border-white/10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r from-emerald-500/20 to-emerald-500/10">
                  <feature.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-emerald-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-400">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}