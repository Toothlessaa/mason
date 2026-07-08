import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import worshipfulMasterPhoto from "../../worshipful.jpg";
import seniorWardenPhoto from "../../srward.jpg";
import juniorWardenPhoto from "../../jrward.jpg";

const officers = [
  { name: "Bro. Noel J Blanco", title: "Worshipful Master", photo: worshipfulMasterPhoto },
  { name: "Bro. Jose Regner M. Sevilleno", title: "Junior Warden", photo: juniorWardenPhoto },
  { name: "Bro. Hope Earl Bucog", title: "Senior Warden", photo: seniorWardenPhoto },
];

const lodgeName = "Mt. Capistrano Masonic Lodge No. 23";

type Position = "center" | "left" | "right";

function getPosition(index: number, activeIndex: number): Position {
  const diff = (index - activeIndex + 3) % 3;
  if (diff === 0) return "center";
  if (diff === 1) return "right";
  return "left";
}

function useOffset() {
  const [offset, setOffset] = useState(340);
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w <= 640) setOffset(140);
      else if (w <= 900) setOffset(200);
      else if (w <= 1220) setOffset(260);
      else setOffset(340);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return offset;
}

export function ThreeLights() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offset = useOffset();

  const nextMap = [2, 0, 1];
  const prevMap = [1, 2, 0];
  const next = useCallback(() => setActiveIndex(nextMap[activeIndex]), [activeIndex]);
  const prev = useCallback(() => setActiveIndex(prevMap[activeIndex]), [activeIndex]);

  useEffect(() => {
    if (isPaused || !hasBeenInView) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isPaused, hasBeenInView, next]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setHasBeenInView(true);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const positionConfig: Record<Position, { x: number; scale: number; opacity: number; zIndex: number }> = {
    center: { x: 0, scale: 1, opacity: 1, zIndex: 2 },
    left: { x: -offset, scale: 0.85, opacity: 0.6, zIndex: 1 },
    right: { x: offset, scale: 0.85, opacity: 0.6, zIndex: 1 },
  };

  return (
    <section
      ref={sectionRef}
      className="three-lights-section"
    >
      <div className="three-lights-heading">
        <p className="section-label">The Lodge Officers</p>
        <h2>The Three Lights</h2>
        <p>
          The three principal officers who guide the lodge with wisdom, strength, and beauty.
        </p>
      </div>

      <div className="tl-carousel">
        <button className="tl-arrow tl-arrow-left" onClick={prev} aria-label="Previous officer">
          <ChevronLeft size={24} />
        </button>

        <div className="tl-track" ref={trackRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {officers.map((officer, index) => {
            const pos = getPosition(index, activeIndex);
            const cfg = positionConfig[pos];
            const isCenter = pos === "center";
            return (
              <motion.div
                key={officer.name}
                className={`tl-card${isCenter ? " tl-card-active" : ""}`}
                animate={{
                  x: cfg.x,
                  y: "-50%",
                  scale: cfg.scale,
                  opacity: cfg.opacity,
                  zIndex: cfg.zIndex,
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                layout
              >
                {officer.photo ? (
                  <img src={officer.photo} alt={officer.name} className="tl-card-bg" />
                ) : (
                  <div className="tl-card-placeholder">
                    <User size={48} strokeWidth={1.2} />
                  </div>
                )}
                <div className="tl-card-foot">
                  <h3 className="tl-card-name">{officer.name}</h3>
                  <p className="tl-card-role">{officer.title}</p>
                  <p className="tl-card-lodge">{lodgeName}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <button className="tl-arrow tl-arrow-right" onClick={next} aria-label="Next officer">
          <ChevronRight size={24} />
        </button>
      </div>

    </section>
  );
}
