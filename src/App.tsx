import { Hero } from "./components/Hero";
import { MembershipInquiryPage } from "./components/MembershipInquiryPage";
import { Navbar } from "./components/Navbar";
import { ThankYouPage } from "./components/ThankYouPage";

export default function App() {
  const isInquiryPage = window.location.pathname === "/be-a-freemason";
  const isThankYouPage = window.location.pathname === "/thank-you";

  return (
    <div className="app-shell">
      <Navbar />
      <main>
        {isInquiryPage ? <MembershipInquiryPage /> : isThankYouPage ? <ThankYouPage /> : <Hero />}
      </main>
    </div>
  );
}
