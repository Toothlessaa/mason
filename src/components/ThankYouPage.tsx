import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { GoldButton } from "./GoldButton";
import knockingImage from "../../knocking.png";

export function ThankYouPage() {
  return (
    <section className="thank-you-page">
      <div className="thank-you-shell">
        <div className="inquiry-back-row">
          <GoldButton href="/" variant="outline" className="inquiry-back-button">
            <ArrowLeft size={18} strokeWidth={1.8} /> Back to Home
          </GoldButton>
        </div>

        <motion.div
          className="thank-you-layout"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="thank-you-copy">
            <p className="section-label">The Door Is Open</p>
            <h1>Thank you!</h1>
            <div className="thank-you-message">
              <p>Thank you for your time-it truly means a lot.</p>
              <p>
                If you feel the calling, take that first step. Freemasonry is a journey of growth, purpose, and brotherhood.
              </p>
              <p>The door is open... you only need to knock.</p>
            </div>
            <GoldButton href="/be-a-freemason" className="thank-you-cta">
              Be a Freemason <ArrowRight size={18} strokeWidth={1.8} />
            </GoldButton>
          </div>

          <div className="thank-you-image-card">
            <img src={knockingImage} alt="A symbolic door for those ready to knock" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
