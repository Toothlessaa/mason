import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import districtLogo from "../../logo.jpeg";
import lodgeLogo from "../../logo1.jpg";

const scrollLinks = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Leadership", href: "/#leadership" },
  { label: "Media Center", href: "/#media-center" },
  { label: "Contact", href: "/#contact" },
];

const membershipLinks = [
  { label: "Become a Member", href: "/become-a-member" },
  { label: "Membership Enquiry", href: "/membership-enquiry" },
  { label: "Member Login", href: "/member-login" },
];

export function MobileNavbar() {
  const [open, setOpen] = useState(false);
  const [membershipOpen, setMembershipOpen] = useState(false);

  return (
    <header className="md-header">
      <div className="md-header-bar">
        <a className="md-brand" href="/#home" aria-label="Mt. Capistrano Masonic Lodge home">
          <span className="md-brand-logos">
            <img src={districtLogo} alt="District Grand Lodge of the Far East" />
            <img src={lodgeLogo} alt="Mt. Capistrano Masonic Lodge No. 23" />
          </span>
          <span className="md-brand-text">Masonic Lodge No. 23</span>
        </a>
        <button className="md-menu-button" type="button" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((value) => !value)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open ? (
        <nav className="md-menu" aria-label="Mobile navigation">
          {scrollLinks.slice(0, 3).map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
          ))}
          <button className="md-menu-parent" type="button" aria-expanded={membershipOpen} onClick={() => setMembershipOpen((value) => !value)}>
            Membership <ChevronDown size={16} />
          </button>
          {membershipOpen ? (
            <div className="md-submenu">
              {membershipLinks.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
              ))}
            </div>
          ) : null}
          {scrollLinks.slice(3).map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
