import { Hero } from "./components/Hero";
import { BeAFreemasonPage } from "./components/BeAFreemasonPage";
import { BecomeMemberPage } from "./components/BecomeMemberPage";
import { MemberLoginPage } from "./components/MemberLoginPage";
import { MembersPage } from "./components/MembersPage";
import { AdminLoginPage } from "./components/AdminLoginPage";
import { AdminPage } from "./components/AdminPage";
import { MembershipInquiryPage } from "./components/MembershipInquiryPage";
import { Navbar } from "./components/Navbar";
import { PendingApprovalPage } from "./components/PendingApprovalPage";
import { ThankYouPage } from "./components/ThankYouPage";
import { MobileApp } from "./MobileDesign/MobileApp";
import { useResponsiveMode } from "./hooks/useResponsiveMode";

export default function App() {
  const { isMobileDesign } = useResponsiveMode();
  const isBecomeMemberPage = window.location.pathname === "/become-a-member";
  const isMembershipEnquiryPage = window.location.pathname === "/membership-enquiry";
  const isBeAFreemasonPage = window.location.pathname === "/be-a-freemason";
  const isThankYouPage = window.location.pathname === "/thank-you";
  const isMemberLoginPage = window.location.pathname === "/member-login";
  const isMembersPage = window.location.pathname === "/members" || window.location.pathname === "/member";
  const isPendingApprovalPage = window.location.pathname === "/pending-approval";
  const isAdminLoginPage = window.location.pathname === "/admin-login";
  const isAdminPage = window.location.pathname === "/admin";

  if (isMobileDesign) {
    return <MobileApp />;
  }

  const hideNavbar = isThankYouPage || isBeAFreemasonPage || isMemberLoginPage || isMembersPage || isPendingApprovalPage || isAdminLoginPage || isAdminPage;

  return (
    <div className="app-shell">
      {!hideNavbar ? <Navbar /> : null}
      <main>
        {isBecomeMemberPage ? <BecomeMemberPage /> : isMembershipEnquiryPage ? <MembershipInquiryPage /> : isBeAFreemasonPage ? <BeAFreemasonPage /> : isMemberLoginPage ? <MemberLoginPage /> : isMembersPage ? <MembersPage /> : isAdminLoginPage ? <AdminLoginPage /> : isAdminPage ? <AdminPage /> : isPendingApprovalPage ? <PendingApprovalPage /> : isThankYouPage ? <ThankYouPage /> : <Hero />}
      </main>
    </div>
  );
}
