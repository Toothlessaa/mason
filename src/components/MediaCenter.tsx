import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Camera, Film, Newspaper, X } from "lucide-react";
import { useEffect, useState } from "react";
import firstPhoto from "../../fir.jpg";
import fellowshipPhoto from "../../fellow2.jpg";
import brotherhoodPhoto from "../../brotherhood.jpg";
import milestonePhoto from "../../milestone.jpg";
import secondPhoto from "../../s.jpg";
import communityPhoto from "../../community.png";
import charityPhoto from "../../charity.jpg";

type MediaItem = {
  title: string;
  category: string;
  date: string;
  summary: string;
  accent: "gold" | "blue" | "violet";
  icon: typeof Camera;
  image: string;
};

const filters = ["All", "Ceremonies", "Community", "Brotherhood", "Announcements"];

const mediaItems: MediaItem[] = [
  {
    title: "Installation of Officers",
    category: "Ceremony",
    date: "2026",
    summary: "A dignified gathering honoring continuity, responsibility, and leadership.",
    accent: "gold",
    icon: Camera,
    image: firstPhoto,
  },
  {
    title: "Community Service in Bukidnon",
    category: "Community",
    date: "2026",
    summary: "Brethren extending relief and visible service beyond the lodge room.",
    accent: "blue",
    icon: Newspaper,
    image: communityPhoto,
  },
  {
    title: "Fellowship Night",
    category: "Brotherhood",
    date: "2026",
    summary: "A night of harmony, renewal, and fraternal connection.",
    accent: "violet",
    icon: Film,
    image: fellowshipPhoto,
  },
  {
    title: "Lodge Milestones",
    category: "Announcement",
    date: "2026",
    summary: "Selected updates and milestones from Mt. Capistrano Masonic Lodge No. 23.",
    accent: "gold",
    icon: Newspaper,
    image: milestonePhoto,
  },
  {
    title: "Charity and Relief Work",
    category: "Community",
    date: "2026",
    summary: "Documenting acts of service inspired by brotherly love and relief.",
    accent: "blue",
    icon: Camera,
    image: charityPhoto,
  },
  {
    title: "Ceremonial Highlights",
    category: "Ceremony",
    date: "2026",
    summary: "Moments preserved with dignity, discretion, and institutional pride.",
    accent: "violet",
    icon: Film,
    image: secondPhoto,
  },
  {
    title: "Brotherhood in Action",
    category: "Brotherhood",
    date: "2026",
    summary: "A visual record of fellowship, unity, and the bond shared among brethren.",
    accent: "gold",
    icon: Camera,
    image: brotherhoodPhoto,
  },
];

export function MediaCenter() {
  const reduceMotion = useReducedMotion();
  const [topStart, setTopStart] = useState(0);
  const [isTopPaused, setIsTopPaused] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const topItems = mediaItems.slice(0, 3);
  const featured = topItems[topStart];
  const highlights = [topItems[(topStart + 1) % topItems.length], topItems[(topStart + 2) % topItems.length]];
  const gridItems = mediaItems.slice(3);

  useEffect(() => {
    if (reduceMotion || isTopPaused || selectedItem) return;
    const timer = window.setInterval(() => {
      setTopStart((current) => (current + 1) % topItems.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [isTopPaused, reduceMotion, selectedItem, topItems.length]);

  useEffect(() => {
    if (!selectedItem) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedItem(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedItem]);

  return (
    <section className="media-center-section" id="media-center">
      <motion.div
        className="media-center-heading"
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="section-label">Media</p>
        <h2>Moments of ceremony, service, fellowship, and brotherhood.</h2>
        <p>
          A curated archive for milestones, community works, announcements, and selected lodge moments presented with dignity.
        </p>
      </motion.div>

      <div className="media-feature-layout" onMouseEnter={() => setIsTopPaused(true)} onMouseLeave={() => setIsTopPaused(false)}>
        <MediaCard key="featured-media-card" item={featured} variant="featured" index={0} onSelect={setSelectedItem} />
        <div className="media-highlight-stack">
          {highlights.map((item, index) => (
            <MediaCard key={`highlight-media-card-${index}`} item={item} variant="highlight" index={index + 1} onSelect={setSelectedItem} />
          ))}
        </div>
      </div>

      <div className="media-filter-bar" aria-label="Media categories">
        {filters.map((filter, index) => (
          <button key={filter} className={`media-filter-button${index === 0 ? " media-filter-active" : ""}`} type="button">
            {filter}
          </button>
        ))}
      </div>

      <div className="media-grid">
        {gridItems.map((item, index) => (
          <MediaCard key={item.title} item={item} variant="grid" index={index + 3} onSelect={setSelectedItem} />
        ))}
      </div>

      <AnimatePresence>
        {selectedItem ? <MediaModal item={selectedItem} onClose={() => setSelectedItem(null)} /> : null}
      </AnimatePresence>
    </section>
  );
}

function MediaCard({
  item,
  variant,
  index,
  onSelect,
}: {
  item: MediaItem;
  variant: "featured" | "highlight" | "grid";
  index: number;
  onSelect: (item: MediaItem) => void;
}) {
  const Icon = item.icon;

  return (
    <motion.article
      className={`media-card media-card-${variant} media-accent-${item.accent}`}
      role="button"
      tabIndex={0}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onSelect(item)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(item);
        }
      }}
    >
      <div className="media-card-visual">
        {item.image ? (
          <img className="media-card-image" src={item.image} alt={item.title} />
        ) : (
          <Icon size={variant === "featured" ? 54 : 38} strokeWidth={1.2} />
        )}
      </div>
      <div className="media-card-overlay">
        <div className="media-card-meta">
          <span>{item.category}</span>
          <span>{item.date}</span>
        </div>
        <h3>{item.title}</h3>
        <p>{item.summary}</p>
      </div>
    </motion.article>
  );
}

function MediaModal({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  return (
    <motion.div
      className="media-modal-backdrop"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
    >
      <motion.div
        className="media-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-modal-title"
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="media-modal-close" type="button" aria-label="Close media preview" onClick={onClose}>
          <X size={20} strokeWidth={1.8} />
        </button>

        <div className="media-modal-content">
          <div className="media-modal-copy">
            <div className="media-card-meta">
              <span>{item.category}</span>
              <span>{item.date}</span>
            </div>
            <h3 id="media-modal-title">{item.title}</h3>
            <p>{item.summary}</p>
            <p>
              This media entry preserves an important lodge moment with clarity, dignity, and respect for the work of the brethren.
            </p>
          </div>

          <div className="media-modal-image-wrap">
            <img className="media-modal-image" src={item.image} alt={item.title} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
