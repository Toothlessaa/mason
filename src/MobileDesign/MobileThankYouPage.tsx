import { ArrowLeft, ArrowRight } from "lucide-react";
import knockingImage from "../../knocking.png";

export function MobileThankYouPage() {
  return (
    <section className="md-thank-page">
      <a className="md-back-link" href="/"><ArrowLeft size={17} /> Home</a>
      <div className="md-thank-image-card">
        <img className="md-thank-image" src={knockingImage} alt="A symbolic door for those ready to knock" />
      </div>
      <div className="md-thank-card">
        <p className="md-section-label">The Door Is Open</p>
        <h1>Thank you!</h1>
        <div className="md-thank-message">
          <p>Thank you for your time-it truly means a lot.</p>
          <p>If you feel the calling, take that first step. Freemasonry is a journey of growth, purpose, and brotherhood.</p>
          <p>The door is open... you only need to knock.</p>
        </div>
        <a href="/be-a-freemason">Be a Freemason <ArrowRight size={17} /></a>
      </div>
    </section>
  );
}
