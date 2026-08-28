import { useState } from "react";
import { ChevronDown, LockKeyhole, Menu, X } from "lucide-react";
import districtLogo from "../../logo.jpeg";
import lodgeLogo from "../../logo1.jpg";

type ScrollLink =
  | { label: string; href: string; disabled?: never }
  | { label: string; disabled: true; href?: never };

type DropdownLink = {
  label: string;
  children: { label: string; href: string }[];
};

type NavLink = ScrollLink | DropdownLink;

function isDropdownLink(link: NavLink): link is DropdownLink {
  return "children" in link;
}

const scrollLinks: NavLink[] = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  {
    label: "Leadership",
    children: [
      { label: "Three Lights", href: "/#three-lights" },
      { label: "Past Masters", href: "/past-masters" },
    ],
  },
  { label: "Media", href: "/#media-center" },
  { label: "eBooks & Souvenirs", disabled: true },
  { label: "Contact", href: "/#contact" },
];

export function MobileNavbar() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
        <button className="md-menu-button" type="button" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((value) => !value)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open ? (
        <>
          <button className="md-menu-backdrop" type="button" aria-label="Close menu" onClick={() => setOpen(false)} />
          <nav className="md-menu" aria-label="Mobile navigation">
            <a className="md-menu-access" href="/member-login" onClick={() => setOpen(false)}>
              <LockKeyhole size={15} strokeWidth={1.8} />
              Member Access
            </a>
            {scrollLinks.map((link) => {
              if (isDropdownLink(link)) {
                return (
                  <div className={`nav-dropdown ${dropdownOpen ? "is-open" : ""}`} key={link.label}>
                    <button
                      className="nav-dropdown-trigger"
                      type="button"
                      onClick={() => setDropdownOpen((v) => !v)}
                    >
                      {link.label}
                      <ChevronDown size={14} strokeWidth={2} />
                    </button>
                    <div className="nav-dropdown-menu">
                      {link.children.map((child) => (
                        <a key={child.label} href={child.href} onClick={() => { setOpen(false); setDropdownOpen(false); }}>
                          {child.label}
                        </a>
                      ))}
                    </div>
                  </div>
                );
              }

              if (link.disabled) {
                return (
                  <span className="md-menu-disabled" key={link.label} aria-disabled="true">{link.label}</span>
                );
              }

              return (
                <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
              );
            })}
          </nav>
        </>
      ) : null}
    </header>
  );
}
