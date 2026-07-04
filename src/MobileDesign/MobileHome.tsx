import { ArrowRight, Compass, HandHeart, PlayCircle, Users } from "lucide-react";
import { GrandmasterMessage } from "../components/GrandmasterMessage";
import { MediaCenter } from "../components/MediaCenter";
import { ThreeLights } from "../components/ThreeLights";
import grandPortrait from "../../grandmaster.png";
import anthemVideo from "../../movie-anthem.mp4";

const featureCards = [
  { title: "Brotherhood", body: "A lodge culture shaped by friendship, dignity, and service.", icon: Users },
  { title: "Relief", body: "Visible community work rooted in charity and compassion.", icon: HandHeart },
  { title: "Leadership", body: "Principled stewardship for brethren and community.", icon: Compass },
];

export function MobileHome() {
  return (
    <>
      <section className="md-hero" id="home">
        <p className="md-red-label">Ancient & Accepted Scottish Rite</p>
        <h1>Brotherhood Beyond Borders.</h1>
        <p>Welcome to Mt. Capistrano Masonic Lodge No. 23, where tradition meets service and leadership.</p>
        <div className="md-actions">
          <a href="#about">Discover the Lodge <ArrowRight size={17} /></a>
          <a href="/thank-you" className="md-action-outline">Be a Freemason</a>
        </div>
        <div className="md-portrait-card">
          <img src={grandPortrait} alt="Grandmaster Adelberto T. Pagsibigan" />
          <div>
            <span>Grandmaster</span>
            <strong>Adelberto T. Pagsibigan</strong>
            <small>Mt. Capistrano Masonic Lodge No. 23</small>
          </div>
        </div>
      </section>

      <section className="md-section" id="about">
        <p className="md-section-label">About</p>
        <h2>A timeless institution with a public face built for dignity.</h2>
        <p>Tradition, brotherhood, and community service are presented with clarity for visitors, brethren, and sincere seekers.</p>
        <div className="md-card-stack">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <article className="md-info-card" key={card.title}>
                <Icon size={28} />
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="md-video-section">
        <div className="md-video-heading">
          <PlayCircle size={26} />
          <h2>Lodge Anthem</h2>
        </div>
        <video className="md-video" controls playsInline preload="metadata">
          <source src={anthemVideo} type="video/mp4" />
        </video>
      </section>

      <div className="md-grandmaster-wrap">
        <GrandmasterMessage />
      </div>

      <div className="md-three-lights-wrap" id="leadership">
        <ThreeLights />
      </div>

      <div className="md-media-center-wrap">
        <MediaCenter />
      </div>

      <footer className="md-footer" id="contact">
        <h2>Stay connected with the Lodge.</h2>
        <a href="https://www.facebook.com/profile.php?id=61556922214693" target="_blank" rel="noreferrer">Official Facebook Page</a>
        <a href="/become-a-member">Become a Member</a>
        <p>@2026 Mt. Capistrano Masonic Lodge No. 23. All Rights Reserved.</p>
      </footer>
    </>
  );
}
