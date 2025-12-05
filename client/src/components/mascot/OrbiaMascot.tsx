import { motion, Variants } from 'framer-motion';
import orbiaImage from '@assets/generated_images/friendly_glowing_orb_mascot_for_a_legal_tech_app.png';

interface OrbiaMascotProps {
  className?: string;
  state?: 'idle' | 'thinking' | 'happy' | 'worried';
  size?: 'sm' | 'md' | 'lg';
}

export function OrbiaMascot({ className = '', state = 'idle', size = 'md' }: OrbiaMascotProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-64 h-64',
  };

  const variants: Variants = {
    idle: {
      y: [0, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    thinking: {
      scale: [1, 1.05, 1],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    happy: {
      y: [0, -20, 0],
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse"
      }
    },
    worried: {
      x: [-5, 5, -5],
      transition: {
        duration: 0.5,
        repeat: Infinity,
      }
    }
  };

  return (
    <motion.div
      className={`relative ${sizeClasses[size]} ${className}`}
      variants={variants}
      animate={state}
    >
      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
      <img 
        src={orbiaImage} 
        alt="ORBIA Mascota" 
        className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
      />
    </motion.div>
  );
}
