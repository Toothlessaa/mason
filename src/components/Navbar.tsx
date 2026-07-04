import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, LockKeyhole, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { GoldButton } from "./GoldButton";
import districtLogo from "../../logo.jpeg";
import lodgeLogo from "../../logo1.jpg";

const scrollNavItems = ["Home", "About", "Leadership", "Media Center", "Contact"];

const membershipLinks = [
  { label: "Become a Member", href: "/become-a-member" },
  { label: "Membership Enquiry", href: "/membership-enquiry" },
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
  const [membershipOpen, setMembershipOpen] = useState(false);
  const membershipRef = useRef<HTMLDivElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeItem, setActiveItem] = useState("Home");
  const isHomePage = window.location.pathname === "/";
  const isMembershipPage = window.location.pathname === "/become-a-member" || window.location.pathname === "/membership-enquiry" || window.location.pathname === "/be-a-freemason";

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!membershipRef.current?.contains(event.target as Node)) {
        setMembershipOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMembershipOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    const sectionEntries = scrollNavItems.map((item) => ({
      id: item.toLowerCase().replaceAll(" ", "-"),
      name: item,
    }));

    const onScroll = () => {
      setScrolled(window.scrollY > 20);

      if (!isHomePage) {
        setActiveItem(isMembershipPage ? "Membership" : "");
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
  }, [isHomePage, isMembershipPage]);

  const navLinks = useMemo(
    () => {
      const getHref = (slug: string) => (isHomePage ? `#${slug}` : `/#${slug}`);

      const scrollLinks = scrollNavItems.map((item) => {
        const slug = item.toLowerCase().replaceAll(" ", "-");
        const isActive = activeItem === item;

        return (
          <a
            key={item}
            href={getHref(slug)}
            className={isActive ? "is-active" : undefined}
            onClick={() => {
              setMenuOpen(false);
              setMembershipOpen(false);
              setActiveItem(item);
            }}
          >
            {item}
            <span className="nav-underline" />
          </a>
        );
      });

      return [
        ...scrollLinks.slice(0, 3),
        <div
          ref={membershipRef}
          className={`nav-dropdown ${activeItem === "Membership" ? "is-active" : ""} ${membershipOpen ? "is-open" : ""}`}
          key="Membership"
          onMouseEnter={() => setMembershipOpen(true)}
          onMouseLeave={() => setMembershipOpen(false)}
        >
          <button
            className="nav-dropdown-trigger"
            type="button"
            aria-expanded={membershipOpen}
            onClick={() => setMembershipOpen((open) => !open)}
          >
            Membership <ChevronDown size={14} strokeWidth={2} />
            <span className="nav-underline" />
          </button>
          <div className="nav-dropdown-menu">
            {membershipLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => {
                  setMenuOpen(false);
                  setMembershipOpen(false);
                  setActiveItem("Membership");
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>,
        ...scrollLinks.slice(3),
      ];
    },
    [activeItem, isHomePage, membershipOpen],
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
            Member&apos;s Login
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
              Member&apos;s Login
            </GoldButton>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
