import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardType } from "./Card";
import PlayingCard from "./Card";

interface SetAnimationProps {
  set: CardType[];
  onComplete: () => void;
}

export default function SetAnimation({ set, onComplete }: SetAnimationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Show animation for 2 seconds then call onComplete
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500); // Wait for exit animation to complete
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
        >
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className="bg-card p-6 rounded-lg shadow-lg text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Set Completed!</h2>
            <motion.div
              className="flex justify-center gap-2"
              initial={{ scale: 0.9 }}
              animate={{
                scale: 1.1,
                transition: {
                  repeat: 1,
                  repeatType: "reverse",
                  duration: 0.5,
                },
              }}
            >
              {set.map((card) => (
                <motion.div
                  key={card.id}
                  initial={{ rotate: -10, y: 20 }}
                  animate={{
                    rotate: 10,
                    y: 0,
                    transition: {
                      repeat: Infinity,
                      repeatType: "mirror",
                      duration: 0.5 + Math.random() * 0.5,
                    },
                  }}
                >
                  <PlayingCard card={card} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
