import { Hero } from "./components/Hero";
import { BeAFreemasonPage } from "./components/BeAFreemasonPage";
import { BecomeMemberPage } from "./components/BecomeMemberPage";
import { MembershipInquiryPage } from "./components/MembershipInquiryPage";
import { Navbar } from "./components/Navbar";
import { ThankYouPage } from "./components/ThankYouPage";
import { MobileApp } from "./MobileDesign/MobileApp";
import { useResponsiveMode } from "./hooks/useResponsiveMode";

export default function App() {
  const { isMobileDesign } = useResponsiveMode();
  const isBecomeMemberPage = window.location.pathname === "/become-a-member";
  const isMembershipEnquiryPage = window.location.pathname === "/membership-enquiry";
  const isBeAFreemasonPage = window.location.pathname === "/be-a-freemason";
  const isThankYouPage = window.location.pathname === "/thank-you";

  if (isMobileDesign) {
    return <MobileApp />;
  }

  return (
    <div className="app-shell">
      {!isThankYouPage && !isBeAFreemasonPage ? <Navbar /> : null}
      <main>
        {isBecomeMemberPage ? <BecomeMemberPage /> : isMembershipEnquiryPage ? <MembershipInquiryPage /> : isBeAFreemasonPage ? <BeAFreemasonPage /> : isThankYouPage ? <ThankYouPage /> : <Hero />}
      </main>
    </div>
  );
}
