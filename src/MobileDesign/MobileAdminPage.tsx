import { useEffect, useState } from "react";
import { ArrowLeft, Images, LogOut, ShieldCheck, Check, X, RefreshCw, Users } from "lucide-react";
import districtLogo from "../../logo.jpeg";
import lodgeLogo from "../../logo1.jpg";
import { signOut, getAdminSession, getAllMembers, updateMemberStatus, type MemberProfile } from "../data/memberPortal";
import { MediaAdminPanel } from "../components/MediaAdminPanel";

export function MobileAdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionName, setSessionName] = useState("");
  const [activeSection, setActiveSection] = useState<"members" | "media">("members");

  const loadMembers = async () => {
    setLoading(true);
    const { data } = await getAllMembers();
    if (data) setMembers(data);
    setLoading(false);
  };

  useEffect(() => {
    const session = getAdminSession();
    if (!session) {
      window.location.href = "/admin-login";
      return;
    }

    setAuthorized(true);
    setSessionName(session.name);
    loadMembers();
  }, []);

  const logout = async () => {
    await signOut();
    window.location.href = "/";
  };

  const handleApprove = async (memberId: string) => {
    await updateMemberStatus(memberId, "Active");
    await loadMembers();
  };

  const handleReject = async (memberId: string) => {
    await updateMemberStatus(memberId, "Rejected");
    await loadMembers();
  };

  if (!authorized) return null;

  const pendingCount = members.filter((m) => m.status === "Pending").length;
  const activeCount = members.filter((m) => m.status === "Active").length;

  return (
    <section className="md-members-page">
      <div className="md-members-header">
        <div className="md-form-logos" aria-label="Lodge logos">
          <img src={districtLogo} alt="District Grand Lodge of the Far East" />
          <img src={lodgeLogo} alt="Mt. Capistrano Masonic Lodge No. 23" />
        </div>
        <p className="md-section-label">Administration</p>
        <h1>{activeSection === "members" ? "Members" : "Media"}</h1>
        <p>Welcome, {sessionName}. Manage lodge operations from one console.</p>
        <div className="md-members-actions">
          <a href="/"><ArrowLeft size={16} /> Home</a>
          <button type="button" onClick={loadMembers} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex", alignItems: "center", gap: "6px" }}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button type="button" onClick={logout} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex", alignItems: "center", gap: "6px" }}>
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="md-admin-tabs" aria-label="Admin sections">
          <button type="button" className={activeSection === "members" ? "is-active" : undefined} onClick={() => setActiveSection("members")}>
            <Users size={16} /> Members
          </button>
          <button type="button" className={activeSection === "media" ? "is-active" : undefined} onClick={() => setActiveSection("media")}>
            <Images size={16} /> Media
          </button>
        </div>
      </div>

      {activeSection === "members" ? (
        <>
          <div className="md-members-summary">
            <span><strong>{members.length}</strong> Total</span>
            <span><strong>{pendingCount}</strong> Pending</span>
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
                  <p>{member.role} {member.is_admin ? "(Admin)" : ""}</p>
                  <dl>
                    <div><dt>Email</dt><dd>{member.email}</dd></div>
                    <div><dt>Phone</dt><dd>{member.phone || "—"}</dd></div>
                    <div><dt>Address</dt><dd>{member.address || "—"}</dd></div>
                    <div><dt>Freemason Info</dt><dd>{member.is_freemason || "—"}</dd></div>
                  </dl>
                  {member.status === "Pending" ? (
                    <div className="md-member-actions-row">
                      <button type="button" className="admin-confirm-button" onClick={() => handleApprove(member.id)}>
                        <Check size={15} /> Confirm
                      </button>
                      <button type="button" className="admin-reject-button" onClick={() => handleReject(member.id)}>
                        <X size={15} /> Reject
                      </button>
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="md-admin-media-wrap">
          <MediaAdminPanel adminName={sessionName} />
        </div>
      )}
    </section>
  );
}
