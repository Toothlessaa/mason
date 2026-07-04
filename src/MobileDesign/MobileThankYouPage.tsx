import { ArrowLeft, ArrowRight } from "lucide-react";
import knockingImage from "../../knocking.png";

export function MobileThankYouPage() {
  return (
    <section className="md-thank-page">
      <a className="md-back-link" href="/"><ArrowLeft size={17} /> Home</a>
      <div className="md-thank-card">
        <p className="md-section-label">The Door Is Open</p>
        <h1>Thank you!</h1>
        <p>Thank you for your time. If you feel the calling, take that first step toward growth, purpose, and brotherhood.</p>
        <a href="/membership-enquiry">Membership Enquiry <ArrowRight size={17} /></a>
      </div>
      <img className="md-thank-image" src={knockingImage} alt="A symbolic door for those ready to knock" />
    </section>
  );
}
