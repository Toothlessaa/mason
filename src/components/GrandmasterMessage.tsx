import { motion, useReducedMotion } from "framer-motion";
import grandPortrait from "../../grandmaster.png";

export function GrandmasterMessage() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="gm-message-section" id="leadership">
      <div className="gm-message-layout">
        <motion.div
          className="gm-message-image"
          initial={reduceMotion ? false : { opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="gm-message-image-inner">
            <div className="gm-message-image-glow" />
            <img src={grandPortrait} alt="District Grand Master Adelberto T. Pagsibigan" />
          </div>
        </motion.div>

        <motion.div
          className="gm-message-text"
          initial={reduceMotion ? false : { opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <p className="section-label">A Message from the District Grand Master</p>
          <h2>My dear brethren!</h2>
          <blockquote>
            <p>Congratulations for your unwavering dedication in spreading the light of Masonry across Bukidnon and throughout Mindanao.</p>
            <p>Most especially, to the Three Lights of Mt. Capistrano Masonic Lodge No. 23 — your leadership is the foundation of this success.</p>
            <p>Through your guidance, you have inspired men to knock, to grow, and to become better versions of themselves.</p>
            <p>Brethren, your work goes beyond the Lodge. You are shaping lives, building character, and strengthening our brotherhood across the region.</p>
            <p>Continue to lead. Continue to inspire. Continue to spread the Light.</p>
            <p>Congratulations, and may the Great Architect of the Universe bless your labors.</p>
          </blockquote>
          <div className="gm-message-attribution">
            <p className="gm-message-name">
              <span>M.S.</span>
              <strong>Adelberto T. Pagsibigan, 33°</strong>
            </p>
            <p className="gm-message-role">District Grand Master</p>
            <p className="gm-message-lodge">DISTRICT GRAND LODGE OF THE FAR EAST — PHILIPPINE ISLANDS</p>
            <p className="gm-message-thanks">Fraternal Thanks</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
