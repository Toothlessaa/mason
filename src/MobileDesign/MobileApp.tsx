import { MobileBeAFreemasonPage } from "./MobileBeAFreemasonPage";
import { MobileBecomeMemberPage } from "./MobileBecomeMemberPage";
import { MobileHome } from "./MobileHome";
import { MobileMembershipInquiryPage } from "./MobileMembershipInquiryPage";
import { MobileNavbar } from "./MobileNavbar";
import { MobileThankYouPage } from "./MobileThankYouPage";
import "./mobile.css";

export function MobileApp() {
  const path = window.location.pathname;
  const isThankYouPage = path === "/thank-you";
  const isBecomeMemberPage = path === "/become-a-member";
  const isMembershipEnquiryPage = path === "/membership-enquiry";
  const isBeAFreemasonPage = path === "/be-a-freemason";

  return (
    <div className="md-app">
      {!isThankYouPage && !isBeAFreemasonPage ? <MobileNavbar /> : null}
      <main>
        {isBecomeMemberPage ? <MobileBecomeMemberPage /> : isMembershipEnquiryPage ? <MobileMembershipInquiryPage /> : isBeAFreemasonPage ? <MobileBeAFreemasonPage /> : isThankYouPage ? <MobileThankYouPage /> : <MobileHome />}
      </main>
    </div>
  );
}
