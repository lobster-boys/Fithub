import React from 'react';
import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
  // 페이지 전환 애니메이션 설정
  const variants = {
    initial: {
      opacity: 0,
      x: 10
    },
    in: {
      opacity: 1,
      x: 0
    },
    out: {
      opacity: 0,
      x: -10
    }
  };
  
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={variants}
      transition={{ duration: 0.3 }}
      className="w-full min-h-screen"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition; 