// // Statistics.tsx
// import { motion } from 'framer-motion';
// import { Users, Trophy, MessageCircle } from 'lucide-react';

// export default function Statistics() {
//   const stats = [
//     {
//       icon: Users,
//       value: '1.2M+',
//       label: 'Space Missions',
//     },
//     {
//       icon: Trophy,
//       value: '50K+',
//       label: 'Active Explorers',
//     },
//     {
//       icon: MessageCircle,
//       value: '$25,000',
//       label: 'Cosmic Rewards',
//     },
//   ];

//   return (
//     <section className="relative py-32 overflow-hidden bg-black/90">
//       <div className="container relative mx-auto px-4">
//         <div className="grid md:grid-cols-3 gap-8">
//           {stats.map((stat, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1 }}
//               className="group relative"
//             >
//               <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/30 to-emerald-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
//               <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl p-8 text-center border border-white/10">
//                 <motion.div
//                   whileHover={{ scale: 1.1 }}
//                   className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-r from-emerald-500/20 to-emerald-500/10"
//                 >
//                   <stat.icon className="w-8 h-8 text-emerald-400" />
//                 </motion.div>
//                 <h3 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
//                   {stat.value}
//                 </h3>
//                 <p className="text-zinc-400 font-medium">{stat.label}</p>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// Statistics.tsx - Updated with cosmic theme while maintaining accurate blockchain stats
import { motion } from 'framer-motion';
import { Zap, Server, Cpu } from 'lucide-react';

export default function Statistics() {
  const stats = [
    {
      icon: Zap,
      value: '10,000+',
      label: 'Quantum Transactions/Sec',
    },
    {
      icon: Server,
      value: '2.5s',
      label: 'Spacetime Block Cycle',
    },
    {
      icon: Cpu,
      value: 'Zero',
      label: 'Interstellar Gas Fees',
    },
  ];

  return (
    <section className="relative py-32 overflow-hidden bg-black/90">
      <div className="container relative mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/30 to-emerald-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl p-8 text-center border border-white/10">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-r from-emerald-500/20 to-emerald-500/10"
                >
                  <stat.icon className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <h3 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                  {stat.value}
                </h3>
                <p className="text-zinc-400 font-medium">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}