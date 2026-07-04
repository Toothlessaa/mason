import { useEffect, useState } from "react";
import { ArrowLeft, LogOut, ShieldCheck } from "lucide-react";
import districtLogo from "../../logo.jpeg";
import lodgeLogo from "../../logo1.jpg";
import { signOut, getSession, getMembers, type MemberProfile } from "../data/memberPortal";

export function MembersPage() {
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

  const activeMembers = members.filter((member) => member.status === "Active").length;

  return (
    <section className="members-page">
      <div className="members-shell">
        <header className="members-header">
          <div>
            <div className="members-logos" aria-label="Lodge logos">
              <img src={districtLogo} alt="District Grand Lodge of the Far East" />
              <img src={lodgeLogo} alt="Mt. Capistrano Masonic Lodge No. 23" />
            </div>
            <p className="section-label">Members Only</p>
            <h1>Members Directory</h1>
            <p className="members-intro">
              Verified lodge member profiles for Mt. Capistrano Masonic Lodge No. 23.
            </p>
          </div>

          <div className="members-actions">
            <a href="/" className="members-action-link">
              <ArrowLeft size={17} strokeWidth={1.8} /> Home
            </a>
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
            <strong>{activeMembers}</strong>
            <span>Active Members</span>
          </div>
          <div>
            <strong>23</strong>
            <span>Lodge Number</span>
          </div>
        </div>

        <div className="members-table-card">
          <div className="members-table-heading">
            <ShieldCheck size={20} strokeWidth={1.7} />
            <span>Member Profile Information</span>
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
                    <th>Title / Role</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Member Since</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td>{member.name}</td>
                      <td>{member.role}</td>
                      <td>{member.email}</td>
                      <td>{member.phone || "—"}</td>
                      <td>{member.address || "—"}</td>
                      <td>{member.member_since || "—"}</td>
                      <td>
                        <span className={`members-status members-status-${member.status.toLowerCase()}`}>
                          {member.status}
                        </span>
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
