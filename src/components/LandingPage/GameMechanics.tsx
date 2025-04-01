// // GameMechanics.tsx
// import { motion } from 'framer-motion';
// import { Trophy, Zap, Users, MessageCircle } from 'lucide-react';

// export default function GameMechanics() {
//   const steps = [
//     {
//       icon: Trophy,
//       title: 'Hunt Cosmic Gems',
//       description: 'Discover rare space diamonds hidden across the cosmic grid.',
//     },
//     {
//       icon: Zap,
//       title: 'Dodge Anomalies',
//       description: 'Navigate through space distortions that could end your mission.',
//     },
//     {
//       icon: Users,
//       title: 'Multiplayer Missions',
//       description: 'Join forces or compete with explorers from across the galaxy.',
//     },
//     {
//       icon: MessageCircle,
//       title: 'Strategic Navigation',
//       description: 'Plan your route through space to outmaneuver competitors.',
//     },
//   ];

//   return (
//     <section className="relative py-32 overflow-hidden bg-black/60">
//       <div className="container mx-auto px-4">
//         <motion.h2
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           className="text-4xl font-bold text-center mb-16"
//         >
//           <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
//             Mission Briefing
//           </span>
//         </motion.h2>

//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
//           {steps.map((step, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1 }}
//               className="group relative"
//             >
//               <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
//               <div className="relative bg-black/60 backdrop-blur-xl rounded-xl p-8 text-center border border-white/10">
//                 <motion.div
//                   whileHover={{ scale: 1.1 }}
//                   className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-emerald-400/10"
//                 >
//                   <step.icon className="w-8 h-8 text-emerald-400" />
//                 </motion.div>
//                 <h3 className="text-xl font-bold mb-3 text-white group-hover:text-emerald-400 transition-colors">
//                   {step.title}
//                 </h3>
//                 <p className="text-zinc-400">{step.description}</p>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }


// GameMechanics.tsx - Updated with cosmic theme while maintaining accurate gameplay
import { motion } from 'framer-motion';
import { Gem, Bomb, Lock, Clock } from 'lucide-react';

export default function GameMechanics() {
  const steps = [
    {
      icon: Gem,
      title: 'Extract Stellar Diamonds',
      description: 'Discover rare space gems hidden within the cosmic grid to fund your galactic expedition.',
    },
    {
      icon: Bomb,
      title: 'Avoid Supernovas',
      description: 'Navigate carefully - one wrong move triggers a stellar explosion, ending your mission instantly.',
    },
    {
      icon: Lock,
      title: 'Deploy Gravity Locks',
      description: 'After each successful extraction, secure sections of space to block rival explorers.',
    },
    {
      icon: Clock,
      title: 'Race Against Spacetime',
      description: 'The universe waits for no one - make tactical decisions before your quantum timer expires.',
    },
  ];

  return (
    <section className="relative py-32 overflow-hidden bg-black/60">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-16"
        >
          <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Mission Briefing
          </span>
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              <div className="relative bg-black/60 backdrop-blur-xl rounded-xl p-8 text-center border border-white/10">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-emerald-400/10"
                >
                  <step.icon className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-emerald-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-zinc-400">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}