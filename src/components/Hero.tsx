import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { AnthemSection } from "./AnthemSection";
import { GrandmasterMessage } from "./GrandmasterMessage";
import { ThreeLights } from "./ThreeLights";
import { LeadershipPhotoSlideshow } from "./LeadershipPhotoSlideshow";
import { MediaCenter } from "./MediaCenter";
import { Footer } from "./Footer";
import { SectionBreaker } from "./SectionBreaker";
import { BackgroundEffects } from "./BackgroundEffects";
import { FeatureCards } from "./FeatureCards";
import { GoldButton } from "./GoldButton";
import { FAQ } from "./FAQ";

const placeholderSections = [
  { id: "about", title: "About", href: "#about", body: "Tradition guided by relevance, dignity and visible service in the Valley of Bukidnon." },
  { id: "leadership", title: "Leadership", href: "#leadership", body: "Principled stewardship with a clear public identity and disciplined internal culture." },
  { id: "media-center", title: "Media", href: "#media-center", body: "Ceremonies, milestones and community works presented with clarity and discretion." },
  { id: "ebooks", title: "Ebooks", href: "#media-center", body: "Digital references and readings prepared for brethren, visitors, and sincere seekers." },
  { id: "souvenir", title: "Souvenir", href: "#media-center", body: "Commemorative materials and keepsakes celebrating Lodge milestones and fellowship." },
  { id: "contact", title: "Contact", href: "#contact", body: "Open channels for civic engagement, inquiries and appropriate fraternity correspondence." },
];

export function Hero() {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const id = hash.slice(1);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView();
    });
  }, []);

  return (
    <>
      <section className="hero-section" id="home">
        <BackgroundEffects />

        <div className="hero-shell">
          <div className="hero-layout">
            <motion.div
              className="hero-copy"
              initial={reduceMotion ? false : { opacity: 0, y: 30 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="hero-eyebrow">Ancient &amp; Accepted Scottish Rite</p>
              <span className="hero-kicker">Welcome to a lodge where tradition meets service and leadership.</span>
              <h1>
                <span>BROTHERHOOD</span>
                <em>BEYOND BORDERS</em>
              </h1>
              <p className="hero-body">
                Welcome to Mt. Capistrano Masonic Lodge No. 23, where tradition meets service and leadership.
              </p>
              <div className="hero-actions">
                <GoldButton href="#about" className="hero-primary-button">
                  Discover the Lodge <ArrowRight size={18} strokeWidth={1.8} />
                </GoldButton>
                <GoldButton href="/thank-you" variant="outline" className="hero-secondary-button">
                  Be a Freemason
                </GoldButton>
              </div>
            </motion.div>

          </div>

          <FeatureCards />
        </div>
      </section>

      <SectionBreaker />

      <section className="overview-section" id="about">
        <div className="overview-heading">
          <p className="section-label">Distinguished Presence</p>
          <h2>A premium public face for a timeless institution.</h2>
          <p>
            This hero establishes the tone for a world-class lodge website while leaving clean entry points for deeper content sections.
          </p>
        </div>

        <div className="overview-grid">
          {placeholderSections.map((section, index) => (
            <motion.a
              key={section.id}
              className="overview-card"
              href={section.href}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
            >
              <span>{section.title}</span>
              <p>{section.body}</p>
            </motion.a>
          ))}
        </div>
      </section>

      <SectionBreaker />

      <AnthemSection />

      <SectionBreaker />

      <GrandmasterMessage />

      <SectionBreaker />

      <ThreeLights />

      <SectionBreaker />

      <LeadershipPhotoSlideshow />

      <SectionBreaker />

      <MediaCenter />

      <SectionBreaker />

      <FAQ />

      <SectionBreaker />

      <Footer />
    </>
  );
}
