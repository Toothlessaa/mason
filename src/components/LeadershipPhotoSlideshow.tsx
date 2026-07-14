import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { getPublishedLeadershipSlides, type LeadershipSlide } from "../data/memberPortal";
import { GoldButton } from "./GoldButton";

const slideOffsets = [-2, -1, 0, 1, 2];
const tickerText = "District Grand Lodge of the Far East, Philippine Islands";
const tickerFlags = [
  { code: "ph", label: "Philippines" },
  { code: "br", label: "Brazil" },
  { code: "pt", label: "Portugal" },
  { code: "us", label: "USA" },
  { code: "ru", label: "Russia" },
  { code: "my", label: "Malaysia" },
  { code: "sg", label: "Singapore" },
  { code: "de", label: "Germany" },
  { code: "eg", label: "Egypt" },
  { code: "hr", label: "Croatia" },
  { code: "kz", label: "Kazakhstan" },
  { code: "es", label: "Spain" },
  { code: "it", label: "Italy" },
  { code: "fr", label: "France" },
  { code: "ba", label: "Bosnia" },
  { code: "cy", label: "Cyprus" },
  { code: "at", label: "Austria" },
  { code: "xk", label: "Kosovo" },
  { code: "rs", label: "Serbia" },
  { code: "by", label: "Belarus" },
  { code: "tr", label: "Turkey" },
  { code: "md", label: "Moldova" },
  { code: "gr", label: "Greece" },
  { code: "gb-eng", label: "England" },
  { code: "lv", label: "Latvia" },
  { code: "dk", label: "Denmark" },
  { code: "al", label: "Albania" },
  { code: "am", label: "Armenia" },
  { code: "az", label: "Azerbaijan" },
  { code: "mt", label: "Malta" },
  { code: "ie", label: "Ireland" },
  { code: "gb-sct", label: "Scotland" },
  { code: "si", label: "Slovenia" },
  { code: "ad", label: "Andorra" },
  { code: "mx", label: "Mexico" },
];

function getSlideAtOffset(slides: LeadershipSlide[], activeIndex: number, offset: number) {
  const index = (activeIndex + offset + slides.length) % slides.length;
  return slides[index];
}

function getPositionClass(offset: number) {
  if (offset === 0) return "is-center";
  if (offset === -1) return "is-near-left";
  if (offset === 1) return "is-near-right";
  if (offset === -2) return "is-far-left";
  return "is-far-right";
}

export function LeadershipPhotoSlideshow() {
  const reduceMotion = useReducedMotion();
  const [slides, setSlides] = useState<LeadershipSlide[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let active = true;

    const loadSlides = async () => {
      const { data } = await getPublishedLeadershipSlides();
      if (active && data?.length) setSlides(data);
    };

    loadSlides();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion || isPaused || slides.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [isPaused, reduceMotion, slides.length]);

  if (!slides.length) return null;

  const visibleOffsets = slides.length >= 5 ? slideOffsets : slideOffsets.slice(2 - Math.floor(slides.length / 2), 2 - Math.floor(slides.length / 2) + slides.length);

  return (
    <section className="leadership-slideshow-section" aria-label="Leadership photo slideshow">
      <motion.div
        className="leadership-slideshow-heading"
        initial={reduceMotion ? false : { opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="section-label">Gallery</p>
        <h2>Brethren Across the Globe</h2>
      </motion.div>

      <div className="leadership-slideshow-ticker" aria-label={tickerText}>
        <div className="leadership-slideshow-ticker-track" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, index) => (
            <span className="leadership-slideshow-ticker-group" key={index}>
              <span className="leadership-slideshow-ticker-title">{tickerText}</span>
              <span className="leadership-slideshow-flag-row">
                {tickerFlags.map((flag) => (
                  <img key={`${index}-${flag.code}`} src={`https://flagcdn.com/${flag.code}.svg`} alt="" loading="lazy" />
                ))}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="leadership-slideshow-stage-wrap">
        <div className="leadership-slideshow-stage">
          {visibleOffsets.map((offset) => {
            const slide = getSlideAtOffset(slides, activeIndex, offset);
            return (
              <figure
                className={`leadership-slide-card ${getPositionClass(offset)}`}
                key={slide.id}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <img src={slide.image_url} alt={`Leadership slideshow picture ${slides.indexOf(slide) + 1}`} loading="lazy" />
              </figure>
            );
          })}
        </div>

        <div className="leadership-slideshow-action">
          <GoldButton href="/thank-you" variant="outline" className="leadership-slideshow-button">
            Be a Freemason
          </GoldButton>
        </div>
      </div>
    </section>
  );
}
