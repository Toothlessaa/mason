import { useEffect, useState } from "react";
import { ArrowLeft, ClipboardCheck, Images, LogOut, ShieldCheck, Check, X, RefreshCw, Users } from "lucide-react";
import districtLogo from "../../logo.jpeg";
import lodgeLogo from "../../logo1.jpg";
import { signOut, getAdminSession, getAllMembers, updateMemberStatus, type MemberProfile } from "../data/memberPortal";
import { MediaAdminPanel } from "./MediaAdminPanel";

export function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionName, setSessionName] = useState("");
  const [activeSection, setActiveSection] = useState<"approvals" | "members" | "media">("approvals");

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
  const visibleMembers = activeSection === "approvals" ? members.filter((member) => member.status === "Pending") : members;
  const isMemberSection = activeSection === "approvals" || activeSection === "members";
  const pageTitle = activeSection === "approvals" ? "Pending Approvals" : activeSection === "members" ? "Members Database" : "Media Management";
  const pageIntro = activeSection === "approvals"
    ? "Review new lodge applications before they enter the member database."
    : activeSection === "members"
      ? "Browse every member record currently stored in the database."
      : "Upload media posts as drafts or publish them to the public website.";

  return (
    <section className="admin-dashboard-page">
      <div className="admin-dashboard-shell">
        <aside className="admin-sidebar" aria-label="Admin sections">
          <div className="admin-sidebar-brand">
            <div className="members-logos admin-sidebar-logos" aria-label="Lodge logos">
              <img src={districtLogo} alt="District Grand Lodge of the Far East" />
              <img src={lodgeLogo} alt="Mt. Capistrano Masonic Lodge No. 23" />
            </div>
            <span>Mt. Capistrano</span>
            <strong>Admin Console</strong>
          </div>

          <nav className="admin-sidebar-nav">
            <button type="button" className={activeSection === "approvals" ? "is-active" : undefined} onClick={() => setActiveSection("approvals")}>
              <ClipboardCheck size={18} strokeWidth={1.8} /> Approvals
            </button>
            <button type="button" className={activeSection === "members" ? "is-active" : undefined} onClick={() => setActiveSection("members")}>
              <Users size={18} strokeWidth={1.8} /> Members
            </button>
            <button type="button" className={activeSection === "media" ? "is-active" : undefined} onClick={() => setActiveSection("media")}>
              <Images size={18} strokeWidth={1.8} /> Media
            </button>
          </nav>

          <div className="admin-sidebar-footer">
            <a href="/">
              <ArrowLeft size={17} strokeWidth={1.8} /> Home
            </a>
            <button type="button" className="members-logout" onClick={logout}>
              <LogOut size={17} strokeWidth={1.8} /> Logout
            </button>
          </div>
        </aside>

        <main className="admin-dashboard-main">
          <header className="admin-dashboard-header">
            <div>
              <p className="section-label">Administration</p>
              <h1>{pageTitle}</h1>
              <p className="members-intro">
                Welcome, {sessionName}. {pageIntro}
              </p>
            </div>

            <div className="members-actions">
              <button type="button" className="members-action-link" onClick={loadMembers}>
                <RefreshCw size={17} strokeWidth={1.8} /> Refresh
              </button>
            </div>
          </header>

          {isMemberSection ? (
            <>
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
                  <span>{activeSection === "approvals" ? "Applications Awaiting Approval" : "All Database Members"}</span>
                </div>

                <div className="members-table-wrap">
                  {loading ? (
                    <p className="admin-empty-state">Loading records...</p>
                  ) : visibleMembers.length === 0 ? (
                    <p className="admin-empty-state">{activeSection === "approvals" ? "No pending approvals." : "No members found."}</p>
                  ) : (
                    <div className="admin-member-list">
                      {visibleMembers.map((member) => (
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
            </>
          ) : (
            <MediaAdminPanel adminName={sessionName} />
          )}
        </main>
      </div>
    </section>
  );
}
