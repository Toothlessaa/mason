import { useEffect, useMemo, useState } from "react";
import { LockKeyhole, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { GoldButton } from "./GoldButton";
import districtLogo from "../../logo.jpeg";
import lodgeLogo from "../../logo1.jpg";

type ScrollNavItem =
  | { label: string; id: string; disabled?: never }
  | { label: string; disabled: true; id?: never };

const scrollNavItems: ScrollNavItem[] = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "Leadership", id: "leadership" },
  { label: "Media", id: "media-center" },
  { label: "eBooks & Souvenirs", disabled: true },
  { label: "Contact", id: "contact" },
];

function LogoFallback({ label }: { label: string }) {
  return (
    <div className="brand-logo-fallback" aria-label={`${label} placeholder`} role="img">
      <span>23</span>
    </div>
  );
}

function LogoAsset({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <LogoFallback label={alt} />;
  }

  return <img className="brand-logo-image" src={src} alt={alt} onError={() => setFailed(true)} />;
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeItem, setActiveItem] = useState("Home");
  const isHomePage = window.location.pathname === "/";

  useEffect(() => {
    const sectionEntries = scrollNavItems.map((item) => ({
      id: item.id,
      name: item.label,
    })).filter((item): item is { id: string; name: string } => Boolean(item.id));

    const onScroll = () => {
      setScrolled(window.scrollY > 20);

      if (!isHomePage) {
        setActiveItem("");
        return;
      }

      const scrollBottom = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollBottom >= documentHeight - 4) {
        setActiveItem("Contact");
        return;
      }

      const navbarHeight = 90;
      let active = "Home";

      for (let i = sectionEntries.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionEntries[i].id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= navbarHeight) {
          active = sectionEntries[i].name;
          break;
        }
      }

      setActiveItem(active);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, [isHomePage]);

  const navLinks = useMemo(
    () => {
      const getHref = (slug: string) => (isHomePage ? `#${slug}` : `/#${slug}`);

      return scrollNavItems.map((item) => {
        if (item.disabled) {
          return (
            <span className="nav-disabled-link" key={item.label} aria-disabled="true">
              {item.label}
            </span>
          );
        }

        const isActive = activeItem === item.label;

        return (
          <a
            key={item.id}
            href={getHref(item.id)}
            className={isActive ? "is-active" : undefined}
            onClick={() => {
              setMenuOpen(false);
              setActiveItem(item.label);
            }}
          >
            {item.label}
            <span className="nav-underline" />
          </a>
        );
      });
    },
    [activeItem, isHomePage],
  );

  return (
    <header className={`site-header ${scrolled ? "site-header-scrolled" : ""}`}>
      <div className="site-header-inner">
        <a className="brand" href="#home" aria-label="Mt. Capistrano Masonic Lodge No. 23 home">
          <div className="brand-logo-stack">
            <LogoAsset src={districtLogo} alt="District Grand Lodge of the Far East" />
            <LogoAsset src={lodgeLogo} alt="Mt. Capistrano Masonic Lodge No. 23" />
          </div>
          <div className="brand-copy">
            <p>
              <span>MT. CAPISTRANO</span>
              <strong>MASONIC LODGE NO. 23</strong>
            </p>
            <small>Valley of Bukidnon</small>
          </div>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navLinks}
        </nav>

        <div className="header-actions">
          <GoldButton href="/member-login" variant="outline" className="member-login-button">
            <LockKeyhole size={16} strokeWidth={1.8} />
            Member Access
          </GoldButton>
          <button
            className="menu-button"
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <nav className="mobile-nav" aria-label="Mobile navigation">
              {navLinks}
            </nav>
            <GoldButton href="/member-login" variant="outline" className="mobile-login-button">
              <LockKeyhole size={16} strokeWidth={1.8} />
              Member Access
            </GoldButton>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
