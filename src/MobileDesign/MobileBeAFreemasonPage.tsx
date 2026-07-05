import { useState } from "react";
import { ArrowLeft, Compass, Send, X } from "lucide-react";
import lodgeLogo from "../../logo1.jpg";
import sidePhoto from "../../side.png";
import askOneImage from "../../2b1 ask 1.jpg";

export function MobileBeAFreemasonPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="md-form-page md-freemason-page">
      <a className="md-back-link" href="/thank-you"><ArrowLeft size={17} /> Thank You</a>

      <aside className="md-freemason-hero">
        <img src={sidePhoto} alt="A symbolic image for becoming a Freemason" />
        <img className="md-ask-one-mark" src={askOneImage} alt="2B1 ASK1" />
        <div className="md-freemason-hero-copy">
          <h2>A sincere inquiry begins with character.</h2>
          <p>Freemasonry is a lifelong pursuit of light, brotherhood, relief, and truth. Take the first step with sincerity and patience.</p>
        </div>
      </aside>

      <div className="md-form-card">
        <img src={lodgeLogo} alt="Mt. Capistrano Masonic Lodge No. 23" />
        <p className="md-section-label">Membership Path</p>
        <h1>Be a Freemason</h1>
        <p>Begin your journey toward light, character, and brotherhood. This form is for inquiry only.</p>

        <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
          <label><span>Full Name</span><input name="fullName" type="text" placeholder="Enter your full name" /></label>
          <label><span>Email Address</span><input name="email" type="email" placeholder="name@example.com" /></label>
          <label><span>Contact Number</span><input name="contactNumber" type="tel" placeholder="Enter your contact number" /></label>
          <label><span>Address / Location</span><input name="address" type="text" placeholder="City, province, or location" /></label>
          <label><span>Age</span><input name="age" type="number" min="18" placeholder="Enter your age" /></label>
          <label><span>Occupation</span><input name="occupation" type="text" placeholder="Enter your occupation" /></label>
          <label><span>Why do you want to be a Freemason?</span><textarea name="reason" placeholder="Write your answer" /></label>
          <label className="md-check"><input type="checkbox" name="consent" /> <span>I understand this is only an inquiry and not an application for membership.</span></label>
          <button type="submit"><Send size={17} /> Submit Inquiry</button>
        </form>
      </div>

      {submitted ? (
        <div className="md-modal" onClick={() => setSubmitted(false)}>
          <div onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setSubmitted(false)}><X size={18} /></button>
            <Compass size={44} />
            <h2>Thank you for your request.</h2>
            <p>We will contact you soon.</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
