// import { motion } from 'framer-motion'

// const variants = {
//   hidden: { opacity: 0, x: -200, y: 0 },
//   enter: { opacity: 1, x: 0, y: 0 },
// }

import React from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    // <motion.main
    //   variants={variants}
    //   initial="hidden"
    //   animate="enter"
    //   transition={{ type: "linear" }}
    // >
    <div>{children}</div>
    // </motion.main>
  );
}
