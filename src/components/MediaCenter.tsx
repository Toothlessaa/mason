import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Camera, ChevronLeft, ChevronRight, Film, Newspaper, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getPublishedMediaPosts, type MediaPost } from "../data/memberPortal";

type MediaItem = {
  title: string;
  category: string;
  date: string;
  summary: string;
  accent: "gold" | "blue" | "violet";
  icon: typeof Camera;
  image: string;
  images: string[];
};

const filters = ["All", "Ceremonies", "Community", "Brotherhood", "Announcements"];

function getIconForCategory(category: string) {
  if (category === "Announcement") return Newspaper;
  if (category === "Brotherhood") return Film;
  return Camera;
}

function getAccent(index: number): MediaItem["accent"] {
  return (["gold", "blue", "violet"] as const)[index % 3];
}

function mapMediaPost(post: MediaPost, index: number): MediaItem {
  const images = post.image_urls?.length ? post.image_urls : [post.image_url].filter(Boolean);

  return {
    title: post.title,
    category: post.category,
    date: post.date,
    summary: post.summary,
    accent: getAccent(index),
    icon: getIconForCategory(post.category),
    image: images[0] || post.image_url,
    images,
  };
}

export function MediaCenter() {
  const reduceMotion = useReducedMotion();
  const [topStart, setTopStart] = useState(0);
  const [isTopPaused, setIsTopPaused] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const topItems = mediaItems.slice(0, 3);
  const featured = topItems[topStart] || topItems[0];
  const highlights = topItems.filter((_, index) => index !== topStart).slice(0, 2);
  const gridItems = mediaItems.slice(3);

  useEffect(() => {
    let active = true;

    const loadMediaPosts = async () => {
      const { data } = await getPublishedMediaPosts();
      if (!active || !data?.length) return;
      setTopStart(0);
      setMediaItems(data.map(mapMediaPost));
    };

    loadMediaPosts();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (topItems.length < 2 || reduceMotion || isTopPaused || selectedItem) return;
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
        {featured ? <MediaCard key="featured-media-card" item={featured} variant="featured" index={0} onSelect={setSelectedItem} /> : null}
        <div className="media-highlight-stack">
          {highlights.filter(Boolean).map((item, index) => (
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const images = item.images?.length ? item.images : [item.image].filter(Boolean);
  const hasGallery = images.length > 1;

  const showPreviousImage = () => {
    if (!hasGallery) return;
    setActiveImageIndex((current) => (current - 1 + images.length) % images.length);
  };

  const showNextImage = () => {
    if (!hasGallery) return;
    setActiveImageIndex((current) => (current + 1) % images.length);
  };

  useEffect(() => {
    setActiveImageIndex(0);
  }, [item]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") showPreviousImage();
      if (event.key === "ArrowRight") showNextImage();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasGallery, images.length]);

  const handleTouchEnd = (clientX: number) => {
    if (touchStartX === null) return;
    const distance = touchStartX - clientX;
    if (Math.abs(distance) > 45) {
      if (distance > 0) showNextImage();
      else showPreviousImage();
    }
    setTouchStartX(null);
  };

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

          <div
            className="media-modal-image-wrap"
            onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
            onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
          >
            <div className="media-modal-image-track" style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}>
              {images.map((image, index) => (
                <img className="media-modal-image" src={image} alt={`${item.title} ${index + 1}`} key={image} draggable={false} />
              ))}
            </div>
            {hasGallery ? (
              <>
                <button className="media-gallery-button media-gallery-button-prev" type="button" aria-label="Previous image" onClick={(event) => { event.stopPropagation(); showPreviousImage(); }}>
                  <ChevronLeft size={24} strokeWidth={1.8} />
                </button>
                <button className="media-gallery-button media-gallery-button-next" type="button" aria-label="Next image" onClick={(event) => { event.stopPropagation(); showNextImage(); }}>
                  <ChevronRight size={24} strokeWidth={1.8} />
                </button>
                <div className="media-gallery-counter">{activeImageIndex + 1} / {images.length}</div>
              </>
            ) : null}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
