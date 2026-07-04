import { Hero } from "./components/Hero";
import { BecomeMemberPage } from "./components/BecomeMemberPage";
import { MembershipInquiryPage } from "./components/MembershipInquiryPage";
import { Navbar } from "./components/Navbar";
import { ThankYouPage } from "./components/ThankYouPage";
import { MobileApp } from "./MobileDesign/MobileApp";
import { useResponsiveMode } from "./hooks/useResponsiveMode";

export default function App() {
  const { isMobileDesign } = useResponsiveMode();
  const isBecomeMemberPage = window.location.pathname === "/become-a-member";
  const isInquiryPage = window.location.pathname === "/membership-enquiry" || window.location.pathname === "/be-a-freemason";
  const isThankYouPage = window.location.pathname === "/thank-you";

  if (isMobileDesign) {
    return <MobileApp />;
  }

  return (
    <div className="app-shell">
      {!isThankYouPage ? <Navbar /> : null}
      <main>
        {isBecomeMemberPage ? <BecomeMemberPage /> : isInquiryPage ? <MembershipInquiryPage /> : isThankYouPage ? <ThankYouPage /> : <Hero />}
      </main>
    </div>
  );
}
