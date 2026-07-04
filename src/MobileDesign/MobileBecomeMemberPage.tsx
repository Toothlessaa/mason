import { ArrowLeft, ArrowRight, Brain, HandHeart, HeartHandshake } from "lucide-react";
import lodgeLogo from "../../logo1.jpg";
import districtLogo from "../../logo.jpeg";
import apronImage from "../../fellowship.jpg";
import journeyImage from "../../knocking.png";

const reasons = [
  { title: "Make new friendships", body: "Meet men from different backgrounds and build lasting bonds through lodge life.", icon: HeartHandshake },
  { title: "Develop yourself", body: "Grow in discipline, character, confidence, and moral purpose.", icon: Brain },
  { title: "Serve society", body: "Support charitable work and community service with brethren who share the same values.", icon: HandHeart },
];

export function MobileBecomeMemberPage() {
  return (
    <section className="md-light-page">
      <a className="md-back-link" href="/"><ArrowLeft size={17} /> Home</a>
      <div className="md-light-hero">
        <div className="md-light-logos">
          <img src={districtLogo} alt="District Grand Lodge of the Far East" />
          <img src={lodgeLogo} alt="Mt. Capistrano Masonic Lodge No. 23" />
        </div>
        <h1>Become A Member</h1>
      </div>

      <div className="md-light-intro">
        <h2>Why become a Freemason?</h2>
        <p>Freemasonry welcomes good men who seek brotherhood, self-improvement, and meaningful service.</p>
        <img src={apronImage} alt="Masonic regalia" />
      </div>

      <div className="md-reason-stack">
        {reasons.map((reason) => {
          const Icon = reason.icon;
          return (
            <article key={reason.title}>
              <span><Icon size={46} /></span>
              <h3>{reason.title}</h3>
              <p>{reason.body}</p>
            </article>
          );
        })}
      </div>

      <div className="md-light-cta">
        <h2>Take your first step</h2>
        <p>If you feel the calling, begin with a respectful enquiry. The lodge will guide you with clarity and discretion.</p>
        <a href="/membership-enquiry">Membership Enquiry <ArrowRight size={17} /></a>
        <img src={journeyImage} alt="Symbolic doorway" />
      </div>
    </section>
  );
}
