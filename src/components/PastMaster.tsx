import { motion, useReducedMotion } from "framer-motion";

export function PastMaster() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="past-master-section" id="past-master">
      <div className="past-master-layout">
        <motion.div
          className="past-master-text"
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="section-label">Past Masters</p>
          <h2>Honoring those who have led the lodge with distinction.</h2>
          <p>
            Our Past Masters have dedicated their time, wisdom and leadership
            to the growth of Mt. Capistrano Masonic Lodge No. 23. Their
            contributions continue to shape the lodge and inspire the brethren
            who follow in their footsteps.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
