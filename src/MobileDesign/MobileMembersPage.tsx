import { useEffect, useState } from "react";
import { ArrowLeft, LogOut, ShieldCheck } from "lucide-react";
import districtLogo from "../../logo.jpeg";
import lodgeLogo from "../../logo1.jpg";
import { signOut, getSession, getMembers, type MemberProfile } from "../data/memberPortal";

export function MobileMembersPage() {
  const [authorized, setAuthorized] = useState(false);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      window.location.href = "/member-login";
      return;
    }

    setAuthorized(true);

    getMembers(["Active", "Honorary"]).then(({ data }) => {
      if (data) setMembers(data);
      setLoading(false);
    });
  }, []);

  const logout = async () => {
    await signOut();
    window.location.href = "/";
  };

  if (!authorized) {
    return null;
  }

  const activeCount = members.filter((member) => member.status === "Active").length;

  return (
    <section className="md-members-page">
      <div className="md-members-header">
        <div className="md-form-logos" aria-label="Lodge logos">
          <img src={districtLogo} alt="District Grand Lodge of the Far East" />
          <img src={lodgeLogo} alt="Mt. Capistrano Masonic Lodge No. 23" />
        </div>
        <p className="md-section-label">Members Only</p>
        <h1>Members Directory</h1>
        <p>Verified lodge member profile information.</p>
        <div className="md-members-actions">
          <a href="/"><ArrowLeft size={16} /> Home</a>
          <button type="button" onClick={logout}><LogOut size={16} /> Logout</button>
        </div>
      </div>

      <div className="md-members-summary">
        <span><strong>{members.length}</strong> Total</span>
        <span><strong>{activeCount}</strong> Active</span>
      </div>

      <div className="md-members-list">
        {loading ? (
          <p style={{ textAlign: "center", color: "rgba(217,224,237,0.6)", padding: "24px" }}>Loading members...</p>
        ) : members.length === 0 ? (
          <p style={{ textAlign: "center", color: "rgba(217,224,237,0.6)", padding: "24px" }}>No members found.</p>
        ) : (
          members.map((member) => (
            <article className="md-member-card" key={member.id}>
              <div className="md-member-card-head">
                <ShieldCheck size={18} />
                <span className={`members-status members-status-${member.status.toLowerCase()}`}>{member.status}</span>
              </div>
              <h2>{member.name}</h2>
              <p>{member.role}</p>
              <dl>
                <div>
                  <dt>Email</dt>
                  <dd>{member.email}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{member.phone || "—"}</dd>
                </div>
                <div>
                  <dt>Address</dt>
                  <dd>{member.address || "—"}</dd>
                </div>
                <div>
                  <dt>Member Since</dt>
                  <dd>{member.member_since || "—"}</dd>
                </div>
              </dl>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
