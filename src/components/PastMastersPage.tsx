import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Crown, User } from "lucide-react";
import lodgeLogo from "../../logo1.jpg";
import districtLogo from "../../logo.jpeg";
import { getPublishedPastMasters, type PastMaster } from "../data/memberPortal";

export function PastMastersPage() {
  const [masters, setMasters] = useState<PastMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const load = async () => {
      const { data } = await getPublishedPastMasters();
      if (data) setMasters(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <section className="become-member-page">
      <div className="become-member-hero">
        <div className="become-member-hero-inner">
          <div className="become-member-logos" aria-label="Lodge logos">
            <img src={districtLogo} alt="District Grand Lodge of the Far East" />
            <img src={lodgeLogo} alt="Mt. Capistrano Masonic Lodge No. 23" />
          </div>
          <motion.h1 initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            Past Masters
          </motion.h1>
        </div>
      </div>

      <div className="become-member-intro">
        <motion.div className="become-member-intro-copy" initial={reduceMotion ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2>Honoring those who have led the lodge with distinction.</h2>
          <p>
            Our Past Masters have dedicated their time, wisdom, and leadership to the growth of
            Mt. Capistrano Masonic Lodge No. 23. Their contributions continue to shape the lodge
            and inspire the brethren who follow in their footsteps.
          </p>
        </motion.div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 80px" }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "rgba(247,248,251,0.5)", padding: "48px 0" }}>Loading past masters...</p>
        ) : masters.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 24px" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(226,196,122,0.08)", border: "1px solid rgba(226,196,122,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Crown size={36} strokeWidth={1.2} style={{ opacity: 0.35 }} />
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 8, opacity: 0.7 }}>No Past Masters Listed</h3>
            <p style={{ fontSize: "0.9rem", opacity: 0.45, maxWidth: 420, margin: "0 auto", lineHeight: 1.7 }}>
              The list of Past Masters is being prepared. Check back soon to learn about the brethren who have led our lodge with distinction.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
            {masters.map((master, index) => (
              <motion.div
                key={master.id}
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                style={{
                  background: "linear-gradient(180deg, rgba(226,196,122,0.08), rgba(226,196,122,0.02))",
                  border: "1px solid rgba(226,196,122,0.15)",
                  borderRadius: 18,
                  padding: 24,
                  textAlign: "center",
                }}
              >
                {master.image_url ? (
                  <img
                    src={master.image_url}
                    alt={master.name}
                    style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", margin: "0 auto 16px", border: "2px solid rgba(226,196,122,0.3)" }}
                  />
                ) : (
                  <div style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(226,196,122,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <Crown size={36} strokeWidth={1.2} style={{ opacity: 0.4 }} />
                  </div>
                )}
                <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: 4 }}>{master.name}</h3>
                {master.title && <p style={{ fontSize: "0.85rem", color: "var(--gold-300)", marginBottom: 4 }}>{master.title}</p>}
                {master.year_served && <p style={{ fontSize: "0.8rem", opacity: 0.6, marginBottom: 8 }}>{master.year_served}</p>}
                {master.bio && <p style={{ fontSize: "0.82rem", opacity: 0.7, lineHeight: 1.6 }}>{master.bio}</p>}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
