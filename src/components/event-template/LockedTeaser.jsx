import { motion } from "framer-motion";
import "./LockedTeaser.css";

const DEFAULT_MESSAGE =
  "something is waiting for you here — Some memories and a letter, sealed until your day arrives.";
const DEFAULT_FOOTER = "come back on the day to open it";

export default function LockedTeaser({
  time,
  memoryCount,
  name,
  message,
  footer,
}) {
  const units = [
    { label: "days", value: time.days },
    { label: "hours", value: time.hours },
    { label: "minutes", value: time.minutes },
    { label: "seconds", value: time.seconds },
  ];

  return (
    <section className="locked-stage">
      <motion.div
        className="lock-glyph"
        initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        ✦
      </motion.div>

      <motion.p
        className="locked-eyebrow"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        not yet, {name}
      </motion.p>

      <motion.p
        className="locked-line"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35 }}
      >
        {message || DEFAULT_MESSAGE}
      </motion.p>

      <motion.div
        className="locked-grid"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
      >
        {units.map((u) => (
          <div className="locked-unit" key={u.label}>
            <span className="locked-number">
              {String(u.value).padStart(2, "0")}
            </span>
            <span className="locked-label">{u.label}</span>
          </div>
        ))}
      </motion.div>

      <motion.p
        className="locked-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        {footer || DEFAULT_FOOTER}
      </motion.p>
    </section>
  );
}
