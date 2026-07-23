import { useState } from "react";
import { motion } from "framer-motion";
import "./Envelope.css";

export default function Envelope({
  name,
  onOpen,
  envelopeLetterMark = "✦",
  letterContent = "",
  signature = "",
  closingLine = "",
}) {
  const [opening, setOpening] = useState(false);

  const handleClick = () => {
    if (opening) return;
    setOpening(true);
    setTimeout(onOpen, 8000);
  };

  // Prepare letter content - show message or default
  const letterText =
    letterContent ||
    "My days would be incomplete without you — today, and forever.";

  return (
    <div className="envelope-stage">
      <motion.div
        className="envelope-wrap"
        animate={
          opening ? { opacity: 0, scale: 0.96 } : { opacity: 1, scale: 1 }
        }
        transition={{
          duration: 0.6,
          delay: opening ? 3.3 : 0,
          ease: "easeInOut",
        }}
      >
        <button
          className="envelope"
          onClick={handleClick}
          aria-label="Open your surprise"
          disabled={opening}
        >
          <span className="envelope-body">
            <motion.span
              className="envelope-letter"
              initial={{ y: 0, opacity: 0 }}
              animate={opening ? { y: -92, opacity: 1 } : { y: 0, opacity: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            >
              <span
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0 0.9rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                    fontSize: "0.95rem",
                    lineHeight: 1.5,
                    color: "#4a2418",
                    textAlign: "center",
                  }}
                >
                  {name}, {envelopeLetterMark}
                </span>
              </span>
            </motion.span>
            <motion.span
              className="envelope-flap"
              style={{ transformOrigin: "top center" }}
              animate={opening ? { rotateX: 160 } : { rotateX: 0 }}
              transition={{ duration: 0.55, ease: "easeInOut" }}
            />
            {!opening && (
              <span className="seal">
                <span className="seal-glyph">{name?.charAt(0) || "✧"}</span>
              </span>
            )}
          </span>
        </button>
        {!opening && <p className="envelope-hint">Press to Open</p>}
      </motion.div>
    </div>
  );
}
