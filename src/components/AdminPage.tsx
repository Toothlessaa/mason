import { useEffect, useState } from "react";
import { ArrowLeft, LogOut, ShieldCheck, Check, X, RefreshCw } from "lucide-react";
import districtLogo from "../../logo.jpeg";
import lodgeLogo from "../../logo1.jpg";
import { signOut, getAdminSession, getAllMembers, updateMemberStatus, type MemberProfile } from "../data/memberPortal";

export function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionName, setSessionName] = useState("");

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
    <section className="members-page">
      <div className="members-shell">
        <header className="members-header">
          <div>
            <div className="members-logos" aria-label="Lodge logos">
              <img src={districtLogo} alt="District Grand Lodge of the Far East" />
              <img src={lodgeLogo} alt="Mt. Capistrano Masonic Lodge No. 23" />
            </div>
            <p className="section-label">Administration</p>
            <h1>Admin Dashboard</h1>
            <p className="members-intro">
              Welcome, {sessionName}. Manage member applications and accounts.
            </p>
          </div>

          <div className="members-actions">
            <a href="/" className="members-action-link">
              <ArrowLeft size={17} strokeWidth={1.8} /> Home
            </a>
            <button type="button" className="members-action-link" onClick={loadMembers} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <RefreshCw size={17} strokeWidth={1.8} /> Refresh
            </button>
            <button type="button" className="members-logout" onClick={logout}>
              <LogOut size={17} strokeWidth={1.8} /> Logout
            </button>
          </div>
        </header>

        <div className="members-stats" aria-label="Member summary">
          <div>
            <strong>{members.length}</strong>
            <span>Total Members</span>
          </div>
          <div>
            <strong>{pendingCount}</strong>
            <span>Pending Approval</span>
          </div>
          <div>
            <strong>{activeCount}</strong>
            <span>Active Members</span>
          </div>
        </div>

        <div className="members-table-card">
          <div className="members-table-heading">
            <ShieldCheck size={20} strokeWidth={1.7} />
            <span>All Members</span>
          </div>

          <div className="members-table-wrap">
            {loading ? (
              <p style={{ padding: "24px", textAlign: "center", color: "rgba(217,224,237,0.6)" }}>Loading members...</p>
            ) : members.length === 0 ? (
              <p style={{ padding: "24px", textAlign: "center", color: "rgba(217,224,237,0.6)" }}>No members found.</p>
            ) : (
              <div className="admin-member-list">
                {members.map((member) => (
                  <article className="admin-member-card" key={member.id}>
                    <div className="admin-member-grid">
                      <div className="admin-member-field">
                        <span>Name</span>
                        <strong>{member.name}</strong>
                      </div>
                      <div className="admin-member-field">
                        <span>Email</span>
                        <strong>{member.email}</strong>
                      </div>
                      <div className="admin-member-field">
                        <span>Role</span>
                        <strong>{member.role}</strong>
                      </div>
                      <div className="admin-member-field">
                        <span>Phone</span>
                        <strong>{member.phone || "—"}</strong>
                      </div>
                      <div className="admin-member-field">
                        <span>Address</span>
                        <strong>{member.address || "—"}</strong>
                      </div>
                      <div className="admin-member-field">
                        <span>Freemason Info</span>
                        <strong>{member.is_freemason || "—"}</strong>
                      </div>
                      <div className="admin-member-field">
                        <span>Status</span>
                        <strong>
                          <span className={`members-status members-status-${member.status.toLowerCase()}`}>
                            {member.status}
                          </span>
                        </strong>
                      </div>
                    </div>

                    <div className="admin-member-actions">
                      {member.status === "Pending" ? (
                        <>
                          <button type="button" className="admin-confirm-button" onClick={() => handleApprove(member.id)}>
                            <Check size={16} /> Confirm
                          </button>
                          <button type="button" className="admin-reject-button" onClick={() => handleReject(member.id)}>
                            <X size={16} /> Reject
                          </button>
                        </>
                      ) : (
                        <span className="admin-no-action">No action needed</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
