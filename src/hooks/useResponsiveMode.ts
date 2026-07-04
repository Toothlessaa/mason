import { useEffect, useState } from "react";

export function useResponsiveMode() {
  const [isMobileDesign, setIsMobileDesign] = useState(() => window.innerWidth <= 1024);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1024px)");
    const update = () => setIsMobileDesign(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  return { isMobileDesign };
}
