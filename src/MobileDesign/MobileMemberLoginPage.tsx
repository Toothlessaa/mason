import { useState } from "react";
import { ArrowLeft, Compass, Lock, User, X } from "lucide-react";
import lodgeLogo from "../../logo1.jpg";
import districtLogo from "../../logo.jpeg";
import { signIn, signUp } from "../data/memberPortal";

export function MobileMemberLoginPage() {
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
    <section className="md-form-page">
      <a className="md-back-link" href="/"><ArrowLeft size={17} /> Home</a>
      <div className="md-form-card">
        <div className="md-form-logos">
          <img src={districtLogo} alt="District Grand Lodge of the Far East" />
          <img src={lodgeLogo} alt="Mt. Capistrano Masonic Lodge No. 23" />
        </div>
        <p className="md-section-label">Member Portal</p>
        <h1>Lodge Access</h1>

        <div className="auth-tabs">
          <button
            className={`auth-tab${tab === "login" ? " is-active" : ""}`}
            type="button"
            onClick={() => { setTab("login"); setLoginError(""); }}
          >
            <Lock size={13} strokeWidth={2} /> Login
          </button>
          <button
            className={`auth-tab${tab === "signup" ? " is-active" : ""}`}
            type="button"
            onClick={() => { setTab("signup"); setLoginError(""); }}
          >
            <User size={13} strokeWidth={2} /> Sign Up
          </button>
        </div>

        <form onSubmit={async (event) => {
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
        }}>
          {tab === "signup" ? (
            <>
              <label><span>Full Name</span><input name="fullName" type="text" placeholder="Enter your full name" required /></label>
              <label><span>Email Address</span><input name="email" type="email" placeholder="name@example.com" required /></label>
              <label><span>Password</span><input name="password" type="password" placeholder="Create a password" required minLength={6} /></label>
              <label><span>Phone Number</span><input name="phone" type="tel" placeholder="+63 912 345 6789" /></label>
              <label><span>Address</span><input name="address" type="text" placeholder="Your current address" /></label>
              <label><span>Are you a Freemason?</span><input name="freemasonInfo" type="text" /></label>
            </>
          ) : (
            <>
              <label><span>Email Address</span><input name="email" type="email" placeholder="name@example.com" /></label>
              <label><span>Password</span><input name="password" type="password" placeholder="Enter your password" /></label>
              <label className="md-check"><input type="checkbox" name="remember" /> <span>Remember me</span></label>
            </>
          )}

          {loginError ? <p className="auth-error">{loginError}</p> : null}

          <button type="submit"><Compass size={17} /> {tab === "login" ? "Login" : "Request Access"}</button>

          <p className="auth-footnote">
            {tab === "login"
              ? "For verified lodge members only"
              : "Your request will be reviewed by lodge administration"}
          </p>
        </form>
      </div>

      {submitted ? (
        <div className="md-modal" onClick={() => setSubmitted(false)}>
          <div onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setSubmitted(false)}><X size={18} /></button>
            <Compass size={44} />
            <h2>Account created!</h2>
            <p>Your account is pending approval. You will be notified once the lodge administration reviews your application.</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
