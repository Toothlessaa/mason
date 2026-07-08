import { useState } from "react";
import { ArrowLeft, Compass, Lock, User, X } from "lucide-react";
import { motion } from "framer-motion";
import { GoldButton } from "./GoldButton";
import lodgeLogo from "../../logo1.jpg";
import districtLogo from "../../logo.jpeg";
import { signIn, signUp } from "../data/memberPortal";

export function MemberLoginPage() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [submitted, setSubmitted] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleLogin = async (email: string, password: string) => {
    const { member, error } = await signIn(email, password);
    if (error || !member) {
      setLoginError(error?.message || "Invalid email or password.");
      return;
    }

    if (member.status === "Pending" || member.status === "Rejected") {
      window.location.href = "/pending-approval";
      return;
    }

    window.location.href = "/members";
  };

  const handleSignUp = async (email: string, password: string, name: string, phone: string, address: string, freemasonInfo: string) => {
    const { member, error } = await signUp(email, password, name, phone || undefined, address || undefined, freemasonInfo || undefined);
    if (error || !member) {
      setLoginError(error?.message || "Sign up failed. Please try again.");
      return;
    }

    window.location.href = "/pending-approval";
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
            <p className="section-label">Member Portal</p>
            <h1>Lodge Access</h1>

            <div className="auth-tabs">
              <button
                className={`auth-tab${tab === "login" ? " is-active" : ""}`}
                type="button"
                onClick={() => { setTab("login"); setLoginError(""); }}
              >
                <Lock size={14} strokeWidth={2} /> Login
              </button>
              <button
                className={`auth-tab${tab === "signup" ? " is-active" : ""}`}
                type="button"
                onClick={() => { setTab("signup"); setLoginError(""); }}
              >
                <User size={14} strokeWidth={2} /> Sign Up
              </button>
            </div>

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

                if (tab === "login") {
                  await handleLogin(email, password);
                } else {
                  const name = (form.elements.namedItem("fullName") as HTMLInputElement)?.value ?? "";
                  const phone = (form.elements.namedItem("phone") as HTMLInputElement)?.value ?? "";
                  const address = (form.elements.namedItem("address") as HTMLInputElement)?.value ?? "";
                  const freemasonInfo = (form.elements.namedItem("freemasonInfo") as HTMLInputElement)?.value ?? "";
                  if (!name.trim()) {
                    setLoginError("Please enter your full name.");
                    return;
                  }

                  await handleSignUp(email, password, name, phone, address, freemasonInfo);
                }
              }}
            >
              {tab === "signup" ? (
                <div className="inquiry-field-grid">
                  <label>
                    <span>Full Name</span>
                    <input type="text" name="fullName" placeholder="Enter your full name" required />
                  </label>
                  <label>
                    <span>Email Address</span>
                    <input type="email" name="email" placeholder="name@example.com" required />
                  </label>
                  <label>
                    <span>Password</span>
                    <input type="password" name="password" placeholder="Create a password" required minLength={6} />
                  </label>
                  <label>
                    <span>Phone Number</span>
                    <input type="tel" name="phone" placeholder="+63 912 345 6789" />
                  </label>
                  <label>
                    <span>Address</span>
                    <input type="text" name="address" placeholder="Your current address" />
                  </label>
                  <label>
                    <span>Are you a Freemason?</span>
                    <input type="text" name="freemasonInfo" />
                  </label>
                </div>
              ) : (
                <div className="inquiry-field-grid">
                  <label>
                    <span>Email Address</span>
                    <input type="email" name="email" placeholder="name@example.com" />
                  </label>
                  <label>
                    <span>Password</span>
                    <input type="password" name="password" placeholder="Enter your password" />
                  </label>
                  <label className="auth-remember">
                    <input type="checkbox" name="remember" />
                    <span>Remember me</span>
                  </label>
                </div>
              )}

              {loginError ? <p className="auth-error">{loginError}</p> : null}

              <button className="inquiry-submit" type="submit">
                <Compass size={18} strokeWidth={1.8} />{" "}
                {tab === "login" ? "Login" : "Request Access"}
              </button>

              {tab === "login" ? (
                <p className="auth-footnote">For verified lodge members only</p>
              ) : (
                <p className="auth-footnote">Your request will be reviewed by lodge administration</p>
              )}
            </form>
          </div>
        </motion.div>
      </div>

      {submitted ? (
        <div className="inquiry-modal-overlay" onClick={() => setSubmitted(false)}>
          <div className="inquiry-modal" onClick={(e) => e.stopPropagation()}>
            <button className="inquiry-modal-close" onClick={() => setSubmitted(false)}>
              <X size={20} strokeWidth={1.8} />
            </button>
            <Compass size={48} strokeWidth={1.2} className="inquiry-modal-icon" />
            <h2>Account created!</h2>
            <p>Your account is pending approval. You will be notified once the lodge administration reviews your application.</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
