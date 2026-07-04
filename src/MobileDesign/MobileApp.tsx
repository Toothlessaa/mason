import { MobileBeAFreemasonPage } from "./MobileBeAFreemasonPage";
import { MobileBecomeMemberPage } from "./MobileBecomeMemberPage";
import { MobileHome } from "./MobileHome";
import { MobileMemberLoginPage } from "./MobileMemberLoginPage";
import { MobileMembersPage } from "./MobileMembersPage";
import { MobileAdminLoginPage } from "./MobileAdminLoginPage";
import { MobileAdminPage } from "./MobileAdminPage";
import { MobileMembershipInquiryPage } from "./MobileMembershipInquiryPage";
import { MobilePendingApprovalPage } from "./MobilePendingApprovalPage";
import { MobileNavbar } from "./MobileNavbar";
import { MobileThankYouPage } from "./MobileThankYouPage";
import "./mobile.css";

export function MobileApp() {
  const path = window.location.pathname;
  const isThankYouPage = path === "/thank-you";
  const isBecomeMemberPage = path === "/become-a-member";
  const isMembershipEnquiryPage = path === "/membership-enquiry";
  const isBeAFreemasonPage = path === "/be-a-freemason";
  const isMemberLoginPage = path === "/member-login";
  const isMembersPage = path === "/members" || path === "/member";
  const isPendingApprovalPage = path === "/pending-approval";
  const isAdminLoginPage = path === "/admin-login";
  const isAdminPage = path === "/admin";

  const hideNavbar = isThankYouPage || isBeAFreemasonPage || isMemberLoginPage || isMembersPage || isPendingApprovalPage || isAdminLoginPage || isAdminPage;

  return (
    <div className="md-app">
      {!hideNavbar ? <MobileNavbar /> : null}
      <main>
        {isBecomeMemberPage ? <MobileBecomeMemberPage /> : isMembershipEnquiryPage ? <MobileMembershipInquiryPage /> : isBeAFreemasonPage ? <MobileBeAFreemasonPage /> : isMemberLoginPage ? <MobileMemberLoginPage /> : isMembersPage ? <MobileMembersPage /> : isAdminLoginPage ? <MobileAdminLoginPage /> : isAdminPage ? <MobileAdminPage /> : isPendingApprovalPage ? <MobilePendingApprovalPage /> : isThankYouPage ? <MobileThankYouPage /> : <MobileHome />}
      </main>
    </div>
  );
}
