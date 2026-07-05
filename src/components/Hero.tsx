import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { AnthemSection } from "./AnthemSection";
import { GrandmasterMessage } from "./GrandmasterMessage";
import { ThreeLights } from "./ThreeLights";
import { MediaCenter } from "./MediaCenter";
import { Footer } from "./Footer";
import { SectionBreaker } from "./SectionBreaker";
import { BackgroundEffects } from "./BackgroundEffects";
import { FeatureCards } from "./FeatureCards";
import { GoldButton } from "./GoldButton";
import { GrandmasterCard } from "./GrandmasterCard";
import { FAQ } from "./FAQ";
import grandPortrait from "../../grandmaster.png";

const placeholderSections = [
  { id: "about", title: "About", body: "Tradition guided by relevance, dignity and visible service in the Valley of Bukidnon." },
  { id: "leadership", title: "Leadership", body: "Principled stewardship with a clear public identity and disciplined internal culture." },
  { id: "media-center", title: "Media", body: "Ceremonies, milestones and community works presented with clarity and discretion." },
  { id: "contact", title: "Contact", body: "Open channels for civic engagement, inquiries and appropriate fraternity correspondence." },
];

export function Hero() {
  const reduceMotion = useReducedMotion();

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
                <em>BEYOND BORDERS.</em>
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

            <motion.div
              className="hero-visual"
              initial={reduceMotion ? false : { opacity: 0, x: 34 }}
              animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="portrait-stage">
                <motion.div
                  className="portrait-spotlight"
                  animate={reduceMotion ? undefined : { x: [0, 18, -8, 0], y: [0, -10, 8, 0] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="portrait-halo" />
                <motion.div
                  className="portrait-figure"
                  animate={reduceMotion ? undefined : { y: [0, -8, 0], rotate: [0, 0.4, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="portrait-shadow" />
                  <img className="portrait-image" src={grandPortrait} alt="Grandmaster M.S. Adelberto T. Pagsibigan, 33°" />
                </motion.div>
                <GrandmasterCard />
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
              href={section.id === "become-a-member" ? "/become-a-member" : `#${section.id}`}
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

      <MediaCenter />

      <SectionBreaker />

      <FAQ />

      <SectionBreaker />

      <Footer />
    </>
  );
}
