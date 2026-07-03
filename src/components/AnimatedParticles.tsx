import { motion, useReducedMotion } from "framer-motion";

const particles = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${6 + ((index * 11) % 88)}%`,
  top: `${8 + ((index * 7) % 78)}%`,
  size: 2 + (index % 4),
  duration: 7 + (index % 6),
  delay: (index % 5) * 0.7,
}));

export function AnimatedParticles() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="hero-particles" aria-hidden="true">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="hero-particle"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, -18, 10, 0],
                  x: [0, 8, -6, 0],
                  opacity: [0.12, 0.65, 0.25, 0.12],
                  scale: [1, 1.35, 0.9, 1],
                }
          }
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
