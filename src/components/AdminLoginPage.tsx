import { useState } from "react";
import { ArrowLeft, Compass, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { GoldButton } from "./GoldButton";
import lodgeLogo from "../../logo1.jpg";
import districtLogo from "../../logo.jpeg";
import { adminSignIn } from "../data/memberPortal";

export function AdminLoginPage() {
  const [loginError, setLoginError] = useState("");

  const handleLogin = async (email: string, password: string) => {
    const { member, error } = await adminSignIn(email, password);
    if (error || !member) {
      setLoginError(error?.message || "Invalid email or password.");
      return;
    }

    window.location.href = "/admin";
  };

  return (
    <section className="inquiry-page" id="member-login">
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
            <div className="inquiry-logos" aria-label="Lodge logos">
              <img src={districtLogo} alt="District Grand Lodge of the Far East" />
              <img src={lodgeLogo} alt="Mt. Capistrano Masonic Lodge No. 23" />
            </div>
            <p className="section-label">Administrator</p>
            <h1>Admin Login</h1>

            <form
              className="inquiry-form"
              onSubmit={async (event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const email = (form.elements.namedItem("email") as HTMLInputElement)?.value ?? "";
                const password = (form.elements.namedItem("password") as HTMLInputElement)?.value ?? "";

                if (!email.trim() || !password) {
                  setLoginError("Please fill in both fields.");
                  return;
                }

                await handleLogin(email, password);
              }}
            >
              <div className="inquiry-field-grid">
                <label>
                  <span>Email Address</span>
                  <input type="email" name="email" placeholder="admin@example.com" />
                </label>
                <label>
                  <span>Password</span>
                  <input type="password" name="password" placeholder="Enter your password" />
                </label>
              </div>

              {loginError ? <p className="auth-error">{loginError}</p> : null}

              <button className="inquiry-submit" type="submit">
                <Lock size={18} strokeWidth={1.8} /> Admin Login
              </button>

              <p className="auth-footnote">Lodge administration access only</p>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
