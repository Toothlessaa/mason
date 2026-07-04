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
  const isInquiryPage = path === "/membership-enquiry" || path === "/be-a-freemason";

  return (
    <div className="md-app">
      {!isThankYouPage ? <MobileNavbar /> : null}
      <main>
        {isBecomeMemberPage ? <MobileBecomeMemberPage /> : isInquiryPage ? <MobileMembershipInquiryPage /> : isThankYouPage ? <MobileThankYouPage /> : <MobileHome />}
      </main>
    </div>
  );
}
