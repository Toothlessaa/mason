import { Compass, Mail, MapPin, Share2 } from "lucide-react";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="site-footer" id="contact">
      <motion.div
        className="footer-shell"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="footer-main">
          <div className="footer-brand-block">
            <p className="section-label">Contact</p>
            <h2>Stay connected with the Lodge.</h2>
            <p>
              You may follow our official social media channels for updates and Lodge activities.
            </p>
          </div>

          <div className="footer-contact-grid">
            <a className="footer-contact-card" href="https://www.facebook.com/profile.php?id=61556922214693" target="_blank" rel="noreferrer">
              <Share2 size={22} strokeWidth={1.6} />
              <span>Official Facebook Page</span>
            </a>
            <a className="footer-contact-card" href="mailto:mtcapistrano@example.com">
              <Mail size={22} strokeWidth={1.6} />
              <span>Email the Lodge</span>
            </a>
            <div className="footer-contact-card">
              <MapPin size={22} strokeWidth={1.6} />
              <span>Valley of Bukidnon, Philippine Islands</span>
            </div>
          </div>
        </div>

        <div className="footer-cta-row">
          <div>
            <span>Interested in joining the craft?</span>
            <strong>Begin your journey toward light, character, and brotherhood.</strong>
          </div>
          <a className="footer-freemason-card" href="/thank-you">
            <Compass size={20} strokeWidth={1.7} />
            Be a Freemason
          </a>
        </div>

        <div className="footer-bottom">
          <p>@2026 Mt. Capistrano Masonic Lodge No. 23. All Rights Reserved.</p>
          <p>Crafted by Bro. Noel Blanco - I</p>
        </div>
      </motion.div>
    </footer>
  );
}
