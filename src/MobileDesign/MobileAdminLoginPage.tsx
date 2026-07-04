import { useState } from "react";
import { ArrowLeft, Compass, Lock } from "lucide-react";
import lodgeLogo from "../../logo1.jpg";
import districtLogo from "../../logo.jpeg";
import { adminSignIn } from "../data/memberPortal";

export function MobileAdminLoginPage() {
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
    <section className="md-form-page">
      <a className="md-back-link" href="/"><ArrowLeft size={17} /> Home</a>
      <div className="md-form-card">
        <div className="md-form-logos">
          <img src={districtLogo} alt="District Grand Lodge of the Far East" />
          <img src={lodgeLogo} alt="Mt. Capistrano Masonic Lodge No. 23" />
        </div>
        <p className="md-section-label">Administrator</p>
        <h1>Admin Login</h1>

        <form onSubmit={async (event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const email = (form.elements.namedItem("email") as HTMLInputElement)?.value ?? "";
          const password = (form.elements.namedItem("password") as HTMLInputElement)?.value ?? "";

          if (!email.trim() || !password) {
            setLoginError("Please fill in both fields.");
            return;
          }

          await handleLogin(email, password);
        }}>
          <label><span>Email Address</span><input name="email" type="email" placeholder="admin@example.com" /></label>
          <label><span>Password</span><input name="password" type="password" placeholder="Enter your password" /></label>

          {loginError ? <p className="auth-error">{loginError}</p> : null}

          <button type="submit"><Lock size={17} /> Admin Login</button>

          <p className="auth-footnote">Lodge administration access only</p>
        </form>
      </div>
    </section>
  );
}
