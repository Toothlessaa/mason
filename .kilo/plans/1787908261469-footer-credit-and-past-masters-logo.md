# Plan: Remove Past Masters page logos + rebrand footer credit

## Goal
1. Remove the logo images shown at the top of the Past Masters page (both district + lodge logos).
2. In the footer, replace "Crafted by Bro. Noel Blanco - I" with a visible, clickable "Anwartechlabs" link pointing to `https://anwartechlabs.com` (opens in new tab).

## Files to change

### 1. `src/components/PastMastersPage.tsx` (desktop)
- Remove the `.become-member-logos` div (lines 26-29) — the two `<img>` logo elements.
- Remove now-unused imports `lodgeLogo` and `districtLogo` (lines 4-5). Keep `Crown`, `User` imports.

### 2. `src/MobileDesign/MobilePastMastersPage.tsx` (mobile)
- Remove the `.md-light-logos` div (lines 24-27) — the two `<img>` logo elements.
- Remove now-unused imports `lodgeLogo` and `districtLogo` (lines 3-4). Keep `ArrowLeft`, `Crown` imports.

### 3. `src/components/Footer.tsx` (desktop footer)
- Replace line 52:
  - From: `<p>Crafted by Bro. Noel Blanco - I</p>`
  - To: `<p>Crafted by <a className="footer-credit-link" href="https://anwartechlabs.com" target="_blank" rel="noreferrer">Anwartechlabs</a></p>`

### 4. `src/MobileDesign/MobileHome.tsx` (mobile footer)
- Replace line 79:
  - From: `<p>Crafted by Bro. Noel Blanco - I</p>`
  - To: `<p>Crafted by <a className="footer-credit-link" href="https://anwartechlabs.com" target="_blank" rel="noreferrer">Anwartechlabs</a></p>`

### 5. `src/styles.css` (desktop styling)
- Add `.footer-credit-link` rule near `.footer-bottom` (around line 2227-2240) so it is clearly visible:
  - Color: `var(--gold-300)` (gold accent), `text-decoration: underline`, `text-underline-offset: 2px`, `font-weight: 600`.
  - Hover/focus: brighter gold (e.g. `#f3dfb2`), opacity transition.
  - Note: `.footer-bottom` uses color `rgba(217,224,237,0.66)` — the link should override this with the gold accent to be "seenable".

### 6. `src/MobileDesign/mobile.css` (mobile styling)
- Add `.md-footer .footer-credit-link` override near the `.md-footer` rules (around line 749):
  - Must undo the generic `.md-footer a` styles (which use `display: flex; min-height: 48px; border-bottom` for the full-width link rows).
  - Set `display: inline; min-height: auto; border-bottom: none; color: var(--gold-300); font-weight: 600;` plus hover brightening.
  - Ensures the inline credit link inside the `<p>` renders inline, not as a full-width row.

## Validation
- Build/typecheck with the project's existing command (e.g. `npm run build` / `npm run typecheck` if present) to confirm no unused-import or TS errors.
- Visually check:
  - Past Masters page (`/past-masters`) header shows no logos on desktop and mobile.
  - Home + Past Masters footer credit reads "Crafted by Anwartechlabs", is gold/visible, clickable, opens `https://anwartechlabs.com` in a new tab.
  - Mobile footer credit is inline (not stretched full width like the other footer links).
