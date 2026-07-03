import { Compass, Square } from "lucide-react";
import { AnimatedParticles } from "./AnimatedParticles";
import heroBackground from "../../bg.png";

export function BackgroundEffects() {
  return (
    <div className="background-effects" aria-hidden="true">
      <div className="background-image" style={{ backgroundImage: `url(${heroBackground})` }} />
      <div className="background-scrim" />
      <div className="background-fog" />
      <div className="background-watermark">
        <Compass size={240} strokeWidth={1.1} />
        <Square size={180} strokeWidth={1.1} />
      </div>
      <AnimatedParticles />
    </div>
  );
}
