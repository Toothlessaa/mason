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
              <table className="members-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Freemason Info</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td>{member.name}</td>
                      <td>{member.email}</td>
                      <td>{member.role}</td>
                      <td>{member.phone || "—"}</td>
                      <td>{member.address || "—"}</td>
                      <td>{member.is_freemason || "—"}</td>
                      <td>
                        <span className={`members-status members-status-${member.status.toLowerCase()}`}>
                          {member.status}
                        </span>
                      </td>
                      <td>
                        {member.status === "Pending" ? (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              type="button"
                              className="members-action-link"
                              style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", cursor: "pointer", padding: "6px 12px", borderRadius: "6px" }}
                              onClick={() => handleApprove(member.id)}
                            >
                              <Check size={15} /> Confirm
                            </button>
                            <button
                              type="button"
                              className="members-action-link"
                              style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", cursor: "pointer", padding: "6px 12px", borderRadius: "6px" }}
                              onClick={() => handleReject(member.id)}
                            >
                              <X size={15} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: "rgba(217,224,237,0.5)", fontSize: "0.85rem" }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
