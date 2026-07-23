import { motion } from "framer-motion";
import "./Closing.css";

export default function Closing({ line, name }) {
  return (
    <section className="closing-section">
      <motion.p
        className="closing-line"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.8 }}
      >
        {line}
      </motion.p>
      <motion.p
        className="closing-name"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        {name}
      </motion.p>
    </section>
  );
}
