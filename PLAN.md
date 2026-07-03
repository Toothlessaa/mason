## Premium Hero Asset Integration Plan

### Confirmed Assets

1. `grand.jpg` is the Grandmaster portrait and already includes the Philippine and Portuguese flags.
2. `bg.png` is strong enough to become the main hero environment.
3. `logo.jpeg` is the District Grand Lodge of the Far East seal.
4. Only one logo file is currently present in the repo root: `logo.jpeg`.

### Planned Changes

1. Replace the synthetic hero background with `bg.png`.
2. Keep only subtle enhancement layers over it:
   dark gradient scrim for text readability
   very soft fog
   faint watermark
   low-opacity particles
3. Remove most of the current fake architectural background shapes because `bg.png` already contains columns, floor, banners, and lighting.
4. Replace the portrait placeholder in `Hero.tsx` with `grand.jpg`.
5. Remove the separate CSS flag cards, since the real portrait already contains the flags.
6. Keep the halo, spotlight, and glass info card around the real portrait.
7. Use `logo.jpeg` in the navbar as the District Grand Lodge logo.
8. Preserve the current responsive behavior, but retune portrait sizing because `grand.jpg` is tall and full-body.

### About Removing the Black Background from `grand.jpg`

1. A clean true cutout cannot be guaranteed with frontend code alone.
2. Best-case in-code approach:
   place `grand.jpg` on a very dark right-side stage
   crop and frame it so the black blends into the hero
   add halo and edge shadow to hide the hard rectangle
3. Riskier in-code approach:
   use CSS blend and filter tricks to suppress the black background
   this can damage the suit, shadows, and gold regalia
4. Recommended fallback:
   do not force fake transparency
   instead integrate it into a black-to-navy portrait chamber so it looks intentional and premium

### Best Visual Direction

1. `bg.png` should dominate the whole hero.
2. `grand.jpg` should sit in a refined right-side glass stage, not float raw on top.
3. The page should become simpler and more believable once the real assets replace the synthetic placeholders.

### Remaining Asset Need

1. There is currently only one discovered logo file.
2. If there are really two logos, the second file still needs to be identified or added so it can be mapped as:
   District Grand Lodge logo
   Mt. Capistrano Lodge logo
