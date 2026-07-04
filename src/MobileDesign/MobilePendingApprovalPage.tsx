import { useEffect, useState } from "react";
import { ArrowLeft, Clock, LogOut } from "lucide-react";
import districtLogo from "../../logo.jpeg";
import lodgeLogo from "../../logo1.jpg";
import { signOut, getSession } from "../data/memberPortal";

export function MobilePendingApprovalPage() {
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
    <section className="md-form-page">
      <a className="md-back-link" href="/"><ArrowLeft size={17} /> Home</a>
      <div className="md-form-card" style={{ textAlign: "center" }}>
        <div className="md-form-logos">
          <img src={districtLogo} alt="District Grand Lodge of the Far East" />
          <img src={lodgeLogo} alt="Mt. Capistrano Masonic Lodge No. 23" />
        </div>
        <p className="md-section-label">Account Pending</p>
        <h1 style={{ fontSize: "clamp(1.8rem, 8vw, 2.4rem)" }}>Approval in Progress</h1>
        <Clock size={40} style={{ margin: "14px 0", color: "#e2c47a" }} />
        <p style={{ margin: "14px 0 0", color: "rgba(217,224,237,0.8)", fontSize: "0.95rem", lineHeight: "1.65" }}>
          {name ? `Thank you, ${name}. ` : "Thank you. "}
          Your account is currently pending review by the lodge administration.
          You will be able to access the members area once your application is approved.
        </p>
        <button type="button" className="md-back-link" style={{ marginTop: "20px", width: "100%", justifyContent: "center", cursor: "pointer" }} onClick={logout}>
          <LogOut size={17} /> Logout
        </button>
      </div>
    </section>
  );
}
