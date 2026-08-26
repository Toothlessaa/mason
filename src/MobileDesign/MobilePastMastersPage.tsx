import { useEffect, useState } from "react";
import { ArrowLeft, Crown } from "lucide-react";
import lodgeLogo from "../../logo1.jpg";
import districtLogo from "../../logo.jpeg";
import { getPublishedPastMasters, type PastMaster } from "../data/memberPortal";

export function MobilePastMastersPage() {
  const [masters, setMasters] = useState<PastMaster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await getPublishedPastMasters();
      if (data) setMasters(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <section className="md-light-page">
      <a className="md-back-link" href="/"><ArrowLeft size={17} /> Home</a>
      <div className="md-light-hero">
        <div className="md-light-logos">
          <img src={districtLogo} alt="District Grand Lodge of the Far East" />
          <img src={lodgeLogo} alt="Mt. Capistrano Masonic Lodge No. 23" />
        </div>
        <h1>Past Masters</h1>
      </div>

      <div className="md-light-intro">
        <h2>Honoring those who have led the lodge with distinction.</h2>
        <p>Our Past Masters have dedicated their time, wisdom, and leadership to the growth of Mt. Capistrano Masonic Lodge No. 23.</p>
      </div>

      <div style={{ padding: "0 20px 60px" }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "rgba(247,248,251,0.5)", padding: "32px 0" }}>Loading past masters...</p>
        ) : masters.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(226,196,122,0.08)", border: "1px solid rgba(226,196,122,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Crown size={28} strokeWidth={1.2} style={{ opacity: 0.35 }} />
            </div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 6, opacity: 0.7 }}>No Past Masters Listed</h3>
            <p style={{ fontSize: "0.82rem", opacity: 0.45, maxWidth: 320, margin: "0 auto", lineHeight: 1.6 }}>
              The list of Past Masters is being prepared. Check back soon to learn about the brethren who have led our lodge with distinction.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {masters.map((master) => (
              <article
                key={master.id}
                style={{
                  background: "rgba(226,196,122,0.06)",
                  border: "1px solid rgba(226,196,122,0.15)",
                  borderRadius: 16,
                  padding: 20,
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                {master.image_url ? (
                  <img
                    src={master.image_url}
                    alt={master.name}
                    style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(226,196,122,0.3)" }}
                  />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(226,196,122,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Crown size={24} strokeWidth={1.2} style={{ opacity: 0.4 }} />
                  </div>
                )}
                <div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: 2 }}>{master.name}</h3>
                  {master.title && <p style={{ fontSize: "0.8rem", color: "var(--gold-300)" }}>{master.title}</p>}
                  {master.year_served && <p style={{ fontSize: "0.75rem", opacity: 0.6 }}>{master.year_served}</p>}
                  {master.bio && <p style={{ fontSize: "0.78rem", opacity: 0.65, marginTop: 6, lineHeight: 1.5 }}>{master.bio}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
