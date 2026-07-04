import { useEffect, useState } from "react";
import { ArrowLeft, Clock, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { GoldButton } from "./GoldButton";
import districtLogo from "../../logo.jpeg";
import lodgeLogo from "../../logo1.jpg";
import { signOut, getSession } from "../data/memberPortal";

export function PendingApprovalPage() {
  const [name, setName] = useState("");

  useEffect(() => {
    const session = getSession();
    if (session) setName(session.name);
  }, []);

  const logout = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <section className="inquiry-page">
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
          <div className="inquiry-form-panel" style={{ textAlign: "center" }}>
            <div className="inquiry-logos" aria-label="Lodge logos">
              <img src={districtLogo} alt="District Grand Lodge of the Far East" />
              <img src={lodgeLogo} alt="Mt. Capistrano Masonic Lodge No. 23" />
            </div>
            <p className="section-label">Account Pending</p>
            <Clock size={48} strokeWidth={1.2} className="inquiry-modal-icon" />
            <h2 style={{ margin: "16px 0 0" }}>Approval in Progress</h2>
            <p style={{ margin: "14px 0 0", color: "rgba(217,224,237,0.8)", fontSize: "1rem", lineHeight: "1.6" }}>
              {name ? `Thank you, ${name}. ` : "Thank you. "}
              Your account is currently pending review by the lodge administration.
              You will be able to access the members area once your application is approved.
            </p>
            <button
              type="button"
              className="inquiry-submit"
              style={{ marginTop: "24px", width: "100%" }}
              onClick={logout}
            >
              <LogOut size={18} strokeWidth={1.8} /> Logout
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
