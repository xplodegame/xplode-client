import { motion } from 'framer-motion';
import { Diamond, Github, Twitter, Disc as Discord } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="relative py-12 overflow-hidden">
          <div className="absolute inset-0 bg-[#0A0A0B]/95 backdrop-blur-sm" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
          
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[150px] rounded-full"
          />
    
          <div className="container relative mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2"
              >
                <Diamond className="w-6 h-6 text-emerald-400" />
                <span className="font-bold bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                  Xplode
                </span>
              </motion.div>
              
              <div className="flex gap-6">
                {[
                    { icon: Github, link: "#", id: "github" },
                    { icon: Twitter, link: "https://x.com/xplode_game", id: "twitter" },
                    { icon: Discord, link: "#", id: "discord" },
                ].map(({ icon: Icon, link, id}) => (
                  <motion.a
                    key={id}
                    href={link}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Icon className="relative w-6 h-6 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                  </motion.a>
                ))}
              </div>
              
              <div className="flex gap-6 text-sm">
                {["Terms of Service", "Privacy Policy"].map((text) => (
                  <motion.a
                    key={text}
                    whileHover={{ x: 2 }}
                    className="relative group"
                    href="#"
                  >
                    <span className="text-zinc-400 group-hover:text-emerald-400 transition-colors">
                      {text}
                    </span>
                    <span className="absolute -bottom-px left-0 w-0 h-px bg-emerald-400 group-hover:w-full transition-all" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      );
    };