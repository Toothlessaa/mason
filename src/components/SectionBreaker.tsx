import { motion, useReducedMotion } from "framer-motion";

export function SectionBreaker() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="section-breaker"
      initial={reduceMotion ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="section-breaker-line" />
      <div className="section-breaker-diamond" />
      <div className="section-breaker-line" />
    </motion.div>
  );
}
