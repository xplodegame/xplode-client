import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParticles } from '../../components/LandingPage/Particles';
import Hero from '../../components/LandingPage/Hero';
import GameMechanics from '../../components/LandingPage/GameMechanics';
import Features from '../../components/LandingPage/Features';
import Statistics from '../../components/LandingPage/Statistics';
import Footer from '../../components/LandingPage/Footer';
import { Moon, Sun } from 'lucide-react';
// import useSound from 'use-sound';

function Home() {

  const [darkMode, setDarkMode] = useState(true);
  const ParticlesComponent = useParticles();
  // const [playHover] = useSound('/hover.mp3', { volume: 0.5 });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-dark to-game-dark-light">
      {ParticlesComponent}

      <main className="pt-20">
        <Hero />
        <GameMechanics />
        <Features />
        <Statistics />
      </main>

      <Footer />
    </div>
  );
}

export default Home;