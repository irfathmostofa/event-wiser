import { AnimatePresence, motion } from "framer-motion";
import "./Timeline.css";
import { useState } from "react";

export default function Timeline({ entries, eyebrow }) {
  const [active, setActive] = useState(null);

  // Helper function to get image source
  const getImageSrc = (image) => {
    if (!image) return null;
    // If it's a string (URL), use it directly
    if (typeof image === "string") return image;
    // If it's an imported image object, use it
    return image;
  };

  return (
    <section className="timeline-section">
      <motion.p
        className="section-eyebrow"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.7 }}
      >
        {eyebrow || "The moments worth remembering"}
      </motion.p>

      <div className="timeline-track">
        <div className="timeline-line" aria-hidden="true" />
        {entries.map((entry, i) => (
          <motion.div
            className={`timeline-item ${i % 2 === 0 ? "left" : "right"}`}
            key={entry.date + i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="timeline-dot" aria-hidden="true" />
            <div className="timeline-card">
              <div className="timeline-photo">
                {entry.image ? (
                  <img
                    src={getImageSrc(entry.image)}
                    alt={entry.caption || "Memory"}
                    onClick={() => entry.image && setActive(entry)}
                    loading="lazy"
                    onError={(e) => {
                      // Show placeholder on error
                      e.target.style.display = "none";
                      const placeholder = document.createElement("span");
                      placeholder.className = "timeline-placeholder";
                      placeholder.textContent = "✧";
                      e.target.parentElement.appendChild(placeholder);
                    }}
                  />
                ) : (
                  <span className="timeline-placeholder">✧</span>
                )}
              </div>
              <p className="timeline-date">{entry.date}</p>
              <p className="timeline-caption">{entry.caption}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <motion.img
              src={getImageSrc(active.image)}
              alt={active.caption || ""}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onError={(e) => {
                // You could show a fallback message
                console.log("Image failed to load:", active.image);
              }}
            />
            {active.caption && (
              <p className="lightbox-caption">{active.caption}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
