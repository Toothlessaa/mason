import { useState } from "react";
import { ArrowLeft, Compass, Send, X } from "lucide-react";
import { motion } from "framer-motion";
import { GoldButton } from "./GoldButton";
import lodgeLogo from "../../logo1.jpg";
import noelPhoto from "../../noel.png";

export function MembershipInquiryPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="inquiry-page" id="membership-enquiry">
      <div className="inquiry-shell">
        <div className="inquiry-back-row">
          <GoldButton href="/" variant="outline" className="inquiry-back-button">
            <ArrowLeft size={18} strokeWidth={1.8} /> Back to Home
          </GoldButton>
        </div>

        <motion.div
          className="inquiry-layout"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inquiry-form-panel">
            <img className="inquiry-logo" src={lodgeLogo} alt="Mt. Capistrano Masonic Lodge No. 23" />
            <p className="section-label">Membership Inquiry</p>
            <h1>Be a Freemason</h1>
            <p className="inquiry-intro">
              Begin your journey toward light, character, and brotherhood. This form is for inquiry only and does not connect to a database yet.
            </p>

            <form
              className="inquiry-form"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
              }}
            >
              <div className="inquiry-field-grid">
                <label>
                  <span>Full Name</span>
                  <input type="text" name="fullName" placeholder="Enter your full name" />
                </label>
                <label>
                  <span>Email Address</span>
                  <input type="email" name="email" placeholder="name@example.com" />
                </label>
                <label>
                  <span>Contact Number</span>
                  <input type="tel" name="contactNumber" placeholder="Enter your contact number" />
                </label>
                <label>
                  <span>Address / Location</span>
                  <input type="text" name="address" placeholder="City, province, or location" />
                </label>
                <label>
                  <span>Age</span>
                  <input type="number" name="age" placeholder="Enter your age" min="18" />
                </label>
                <label>
                  <span>Occupation</span>
                  <input type="text" name="occupation" placeholder="Enter your occupation" />
                </label>
              </div>

              <label>
                <span>Be a Freemason</span>
                <input type="text" name="beAFreemason" placeholder="Enter your answer" />
              </label>

              <label className="inquiry-consent">
                <input type="checkbox" name="consent" />
                <span>I understand this is only an inquiry and not an application for membership.</span>
              </label>

              <button className="inquiry-submit" type="submit">
                <Send size={18} strokeWidth={1.8} /> Submit Inquiry
              </button>

            </form>
          </div>

          <aside className="inquiry-side-panel">
            <img className="inquiry-side-photo" src={noelPhoto} alt="Worshipful Master Noel J Blanco I" />
            <div className="inquiry-side-icon">
              <Compass size={34} strokeWidth={1.3} />
            </div>
            <p>Ask one to be one.</p>
            <h2>A sincere inquiry begins with character.</h2>
            <p>
              Freemasonry is a lifelong pursuit of light, brotherhood, relief, and truth. This page is a UI preview for future inquiry processing.
            </p>
          </aside>
        </motion.div>
      </div>

      {submitted ? (
        <div className="inquiry-modal-overlay" onClick={() => setSubmitted(false)}>
          <div className="inquiry-modal" onClick={(e) => e.stopPropagation()}>
            <button className="inquiry-modal-close" onClick={() => setSubmitted(false)}>
              <X size={20} strokeWidth={1.8} />
            </button>
            <Compass size={48} strokeWidth={1.2} className="inquiry-modal-icon" />
            <h2>Thank you for your request.</h2>
            <p>We will contact you soon.</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
