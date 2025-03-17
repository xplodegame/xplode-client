import { useCallback, useEffect, useState } from 'react';
import Particles from 'react-tsparticles';
import { Engine } from 'tsparticles-engine';
import { loadSlim } from 'tsparticles-slim';

export const useParticles = () => {
  const [isInitialAnimation, setIsInitialAnimation] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
    setIsLoaded(true);
  }, []);

  const particlesLoaded = useCallback(async () => {
    console.log('Particles successfully loaded');
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    
    // Start fade out at 3.5 seconds
    const fadeOutTimer = setTimeout(() => {
      setOpacity(0);
    }, 3500);

    // Switch to optimized animation at 4 seconds
    const switchTimer = setTimeout(() => {
      setIsInitialAnimation(false);
      // Fade back in
      setTimeout(() => setOpacity(1), 50);
    }, 4000);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(switchTimer);
    };
  }, [isLoaded]);

  const containerStyle = {
    opacity,
    transition: 'opacity 0.5s ease-in-out',
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  };

  const initialOptions = {
    background: {
      color: {
        value: 'transparent',
      },
    },
    fpsLimit: 60,
    particles: {
      color: {
        value: ['#34d399', '#10b981', '#059669', '#6ee7b7', '#a7f3d0'],
      },
      links: {
        color: '#34d399',
        distance: 150,
        enable: true,
        opacity: 0.5,
        width: 1.2,
        triangles: {
          enable: true,
          opacity: 0.1,
        },
      },
      collisions: {
        enable: true,
      },
      move: {
        direction: "none" as const,
        enable: true,
        outModes: "out" as const,
        random: false,
        speed: 1.2,
        straight: false,
        attract: {
          enable: true,
          rotateX: 600,
          rotateY: 1200,
        },
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 80,
        limit: 100,
      },
      opacity: {
        value: 0.8,
        random: true,
        anim: {
          enable: true,
          speed: 0.8,
          minimumValue: 0.4,
          sync: false,
        },
      },
      size: {
        value: { min: 1, max: 3 },
        random: true,
        anim: {
          enable: true,
          speed: 2,
          minimumValue: 0.5,
          sync: false,
        },
      },
      twinkle: {
        particles: {
          enable: true,
          color: '#6ee7b7',
          frequency: 0.05,
          opacity: 1,
        },
      },
    },
    interactivity: {
      detectsOn: "canvas" as const,
      events: {
        onHover: {
          enable: true,
          mode: ["grab", "bubble"],
          parallax: {
            enable: true,
            force: 60,
            smooth: 10,
          },
        },
        resize: true,
      },
      modes: {
        grab: {
          distance: 200,
          links: {
            opacity: 0.7,
            color: "#34d399",
          },
        },
        bubble: {
          distance: 200,
          size: 5,
          duration: 2,
          opacity: 0.8,
          color: "#6ee7b7",
        },
      },
    },
    responsive: [
      {
        maxWidth: 768,
        options: {
          particles: {
            number: {
              value: 40,
              density: {
                enable: true,
                area: 600,
              },
            },
          },
        },
      },
    ],
    detectRetina: true,
  };

  const optimizedOptions = {
    background: {
      color: {
        value: 'transparent',
      },
    },
    fpsLimit: 50,
    particles: {
      color: {
        value: ['#4ade80', '#22c55e', '#16a34a', '#86efac'],
      },
      links: {
        color: '#4ade80',
        distance: 150,
        enable: true,
        opacity: 0.6,
        width: 1.2,
        triangles: {
          enable: true,
          opacity: 0.1,
        },
      },
      collisions: {
        enable: false,
      },
      move: {
        direction: "none" as const,
        enable: true,
        outModes: "out" as const,
        random: false,
        speed: 1,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 1000,
        },
        value: 50,
        limit: 60,
      },
      opacity: {
        value: 0.8,
        anim: {
          enable: true,
          speed: 0.5,
          minimumValue: 0.5,
          sync: true,
        },
      },
      size: {
        value: { min: 1, max: 2.5 },
        anim: {
          enable: false,
        },
      },
      twinkle: {
        particles: {
          enable: true,
          color: '#86efac',
          frequency: 0.04,
          opacity: 1,
        },
      },
      shape: {
        type: "circle",
      },
      reduceDuplicates: true,
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "grab",
          parallax: {
            enable: false,
          },
        },
        resize: {
          delay: 0.5,
          enable: true,
        },
      },
      modes: {
        grab: {
          distance: 140,
          links: {
            opacity: 0.7,
            blink: false,
          },
        },
      },
    },
    detectRetina: false,
  };

  return (
    <div style={containerStyle}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={isInitialAnimation ? initialOptions : optimizedOptions}
      />
    </div>
  );
};