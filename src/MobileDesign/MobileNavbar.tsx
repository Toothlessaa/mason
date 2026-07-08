import { useState } from "react";
import { LockKeyhole, Menu, X } from "lucide-react";
import districtLogo from "../../logo.jpeg";
import lodgeLogo from "../../logo1.jpg";

type ScrollLink =
  | { label: string; href: string; disabled?: never }
  | { label: string; disabled: true; href?: never };

const scrollLinks: ScrollLink[] = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Leadership", href: "/#leadership" },
  { label: "Media", href: "/#media-center" },
  { label: "eBooks & Souvenirs", disabled: true },
  { label: "Contact", href: "/#contact" },
];

export function MobileNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="md-header">
      <div className="md-header-bar">
        <a className="md-brand" href="/#home" aria-label="Mt. Capistrano Masonic Lodge home">
          <span className="md-brand-logos">
            <img src={districtLogo} alt="District Grand Lodge of the Far East" />
            <img src={lodgeLogo} alt="Mt. Capistrano Masonic Lodge No. 23" />
          </span>
          <span className="md-brand-text">
            <span>Masonic Lodge</span>
            <span className="md-brand-number">No. 23</span>
          </span>
        </a>
        <a href="/member-login" className="md-access-link">
          <LockKeyhole size={14} strokeWidth={1.8} />
          Member Access
        </a>
        <button className="md-menu-button" type="button" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((value) => !value)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open ? (
        <nav className="md-menu" aria-label="Mobile navigation">
          {scrollLinks.map((link) => (
            link.disabled ? (
              <span className="md-menu-disabled" key={link.label} aria-disabled="true">{link.label}</span>
            ) : (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
            )
          ))}
        </nav>
      ) : null}
    </header>
  );
}
