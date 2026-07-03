import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import anthemVideo from "../assets/anthem.MOV";

export function AnthemSection() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasStartedRef = useRef(false);
  const hasEndedRef = useRef(false);
  const shouldResumeRef = useRef(false);
  const wasForcedMutedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;

    if (!video || !section) {
      return;
    }

    const tryPlay = async () => {
      if (hasEndedRef.current) {
        return;
      }

      // Try unmuted first — browser may allow it
      if (!wasForcedMutedRef.current) {
        video.muted = false;
      }

      try {
        await video.play();
        hasStartedRef.current = true;
      } catch {
        if (!wasForcedMutedRef.current) {
          // Browser blocked unmuted autoplay → retry muted
          wasForcedMutedRef.current = true;
          video.muted = true;

          try {
            await video.play();
            hasStartedRef.current = true;
          } catch {
            // Even muted failed
          }
        }
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry?.isIntersecting && !hasStartedRef.current) {
          void tryPlay();
        }
      },
      { threshold: 0.45 },
    );

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        const wasPlaying = !video.paused && !video.ended && hasStartedRef.current;
        shouldResumeRef.current = wasPlaying && !hasEndedRef.current;
        video.pause();
        return;
      }

      if (shouldResumeRef.current && hasStartedRef.current && !hasEndedRef.current) {
        shouldResumeRef.current = false;
        void tryPlay();
      }
    };

    const onEnded = () => {
      hasEndedRef.current = true;
      shouldResumeRef.current = false;
    };

    const onUserInteraction = () => {
      if (wasForcedMutedRef.current && hasStartedRef.current && !hasEndedRef.current) {
        video.muted = false;
        wasForcedMutedRef.current = false;
      }
    };

    observer.observe(section);
    video.addEventListener("ended", onEnded);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pointerdown", onUserInteraction, { passive: true });
    window.addEventListener("keydown", onUserInteraction);

    return () => {
      observer.disconnect();
      video.removeEventListener("ended", onEnded);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pointerdown", onUserInteraction);
      window.removeEventListener("keydown", onUserInteraction);
    };
  }, []);

  return (
    <section className="anthem-section" ref={sectionRef}>
      <motion.div
        className="anthem-video-shell"
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
      >
        <video
          ref={videoRef}
          className="anthem-video"
          playsInline
          preload="auto"
          disablePictureInPicture
          onContextMenu={(event) => event.preventDefault()}
        >
          <source src={anthemVideo} type="video/mp4" />
        </video>
      </motion.div>
    </section>
  );
}
