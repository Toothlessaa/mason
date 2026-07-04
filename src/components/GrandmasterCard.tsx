import { Compass } from "lucide-react";
import { motion } from "framer-motion";

export function GrandmasterCard() {
  return (
    <motion.aside
      className="grandmaster-card"
      initial={{ opacity: 0, x: 28, filter: "blur(18px)" }}
      whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.45 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.28 }}
    >
      <p className="grandmaster-card-name">
        <strong>M.S. Adelberto T. Pagsibigan, 33°</strong>
      </p>
      <p className="grandmaster-card-role">District Grand Master</p>
      <div className="grandmaster-card-divider" />
      <p className="grandmaster-card-lodge">DISTRICT GRAND LODGE OF THE FAR EAST — PHILIPPINE ISLANDS</p>
      <div className="grandmaster-card-icon">
        <Compass size={20} strokeWidth={1.5} />
      </div>
    </motion.aside>
  );
}
