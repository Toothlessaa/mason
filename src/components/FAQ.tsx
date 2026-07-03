import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What is Freemasonry?",
    a: "Freemasonry is one of the oldest fraternities in the world. It is a brotherhood of men dedicated to personal growth, moral values, and service to humanity. It teaches lessons through symbols, traditions, and fellowship",
  },
  {
    q: "Is Freemasonry a religion?",
    a: "No. Freemasonry is not a religion. However, members are required to believe in a Supreme Being. It respects all faiths and promotes unity among men of different religious backgrounds.",
  },
  {
    q: "Is Freemasonry secret?",
    a: "Freemasonry is not a secret society, but it is a society with traditions and private ceremonies. Its core values—truth, brotherhood, and charity—are open and known",
  },
  {
    q: "What do Freemasons actually do?",
    a: "Freemasons focus on: Self-improvement and character building. Brotherhood and fellowship. Charity and community service. Leadership and discipline development",
  },
  {
    q: "Who can become a Freemason?",
    a: "A man who: Is of legal age. Has good moral character. Believes in a Supreme Being. Seeks personal growth and brotherhood",
  },
  {
    q: "How can I join Freemasonry?",
    a: "You must ask a Mason and express your interest.",
  },
];

export function FAQ() {
  const reduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="faq-section" id="faq">
      <motion.div
        className="faq-heading"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="section-label">Frequently Asked Questions</p>
        <h2>Everything you need to know about Freemasonry.</h2>
      </motion.div>

      <div className="faq-list">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            className={`faq-item ${openIndex === index ? "faq-item-open" : ""}`}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
          >
            <button
              className="faq-question"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              aria-expanded={openIndex === index}
            >
              <span>{faq.q}</span>
              <ChevronDown
                size={18}
                strokeWidth={1.8}
                className={`faq-chevron ${openIndex === index ? "faq-chevron-open" : ""}`}
              />
            </button>
            <div className="faq-answer" hidden={openIndex !== index}>
              <p>{faq.a}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
