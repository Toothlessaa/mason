import { ArrowRight, Brain, HandHeart, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";
import lodgeLogo from "../../logo1.jpg";
import districtLogo from "../../logo.jpeg";
import apronImage from "../../fellowship.jpg";
import journeyImage from "../../knocking.png";

const reasons = [
  {
    title: "You want to make new friendships",
    body: "Freemasonry offers the opportunity to engage with like-minded men from different backgrounds and form lasting bonds.",
    icon: HeartHandshake,
  },
  {
    title: "You want to develop yourself",
    body: "It provides an opportunity to improve self-knowledge, discipline, and confidence on a foundation of moral values.",
    icon: Brain,
  },
  {
    title: "You want to serve your community",
    body: "Freemasons actively support charitable work, relief efforts, and service that contributes to the good of society.",
    icon: HandHeart,
  },
];

export function BecomeMemberPage() {
  return (
    <section className="become-member-page">
      <div className="become-member-hero">
        <div className="become-member-hero-inner">
          <div className="become-member-logos" aria-label="Lodge logos">
            <img src={districtLogo} alt="District Grand Lodge of the Far East" />
            <img src={lodgeLogo} alt="Mt. Capistrano Masonic Lodge No. 23" />
          </div>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            Become A Member
          </motion.h1>
        </div>
      </div>

      <div className="become-member-intro">
        <motion.div className="become-member-intro-copy" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2>Why become a Freemason?</h2>
          <p>
            Freemasonry welcomes men from all walks of life who seek brotherhood, moral growth, and meaningful service to others.
          </p>
        </motion.div>
        <motion.img src={apronImage} alt="Masonic regalia and lodge symbols" initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} />
      </div>

      <div className="become-member-statement">
        <p>
          Mt. Capistrano Masonic Lodge No. 23 continues the ancient work of building character, friendship, relief, and truth. The journey begins with a sincere heart, a good reputation, and a desire to improve yourself while serving others.
        </p>
      </div>

      <div className="become-member-reasons">
        {reasons.map((reason, index) => {
          const Icon = reason.icon;
          return (
            <motion.article
              className="become-member-reason"
              key={reason.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
            >
              <div className="become-member-reason-icon">
                <Icon size={72} strokeWidth={1.7} />
              </div>
              <div>
                <h3>{reason.title}</h3>
                <p>{reason.body}</p>
              </div>
            </motion.article>
          );
        })}
      </div>

      <div className="become-member-cta">
        <div>
          <h2>Take your first step</h2>
          <p>
            If you feel the calling, begin with a respectful enquiry. The lodge will guide you with clarity, dignity, and discretion.
          </p>
          <a href="/membership-enquiry" className="become-member-cta-button">
            Membership Enquiry <ArrowRight size={18} strokeWidth={1.8} />
          </a>
        </div>
        <img src={journeyImage} alt="A symbolic door for the first step into Freemasonry" />
      </div>
    </section>
  );
}
