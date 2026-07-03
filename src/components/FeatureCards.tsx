import type { LucideIcon } from "lucide-react";
import { BookOpenText, Columns3, Compass, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";

const features: Array<{ title: string; description: string; Icon: LucideIcon }> = [
  {
    title: "Brotherhood",
    description: "United through timeless principles and mutual respect.",
    Icon: Compass,
  },
  {
    title: "Integrity",
    description: "Living with honor, truth and accountability.",
    Icon: Columns3,
  },
  {
    title: "Charity",
    description: "Serving our community with compassion.",
    Icon: HeartHandshake,
  },
  {
    title: "Truth",
    description: "Seeking light through knowledge and wisdom.",
    Icon: BookOpenText,
  },
];

export function FeatureCards() {
  return (
    <motion.div
      className="feature-bar"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
    >
      {features.map(({ title, description, Icon }, index) => (
        <motion.article
          key={title}
          className="feature-card"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65, delay: 0.12 * index, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="feature-card-icon">
            <Icon size={22} strokeWidth={1.55} />
          </div>
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </motion.article>
      ))}
    </motion.div>
  );
}
