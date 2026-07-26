import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Gallery.css";

export default function Gallery({ photos }) {
  const [active, setActive] = useState(null);

  return (
    <section className="gallery-section">
      <motion.p
        className="section-eyebrow"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.7 }}
      >
        a few more to keep
      </motion.p>

      <div className="gallery-grid">
        {photos.map((p, i) => (
          <motion.button
            className="gallery-cell"
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
            onClick={() => p.image && setActive(p)}
            aria-label={p.caption || "photo"}
          >
            {p.image ? (
              <img src={p.image} alt={p.caption || ""} />
            ) : (
              <span className="gallery-placeholder">✦</span>
            )}
          </motion.button>
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
              src={active.image}
              alt={active.caption || ""}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
            {active.caption && <p className="lightbox-caption">{active.caption}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
