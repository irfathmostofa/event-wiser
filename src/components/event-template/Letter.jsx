import { motion } from "framer-motion";
import "./Letter.css";

export default function Letter({ message, signature }) {
  const paragraphs = message.split("\n").filter(Boolean);

  return (
    <section className="letter-section">
      <motion.div
        className="letter-paper"
        initial={{ opacity: 0, y: 40, rotateX: -8 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <span className="letter-mark" aria-hidden="true">
          ❦
        </span>
        {paragraphs.map((p, i) => (
          <p className="letter-line" key={i}>
            {p}
          </p>
        ))}
        <p className="letter-signature">{signature}</p>
      </motion.div>
    </section>
  );
}
