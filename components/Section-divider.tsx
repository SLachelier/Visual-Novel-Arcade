"use client"; //becoming a client component in order to use 'useEffect' for the motion.div

import React from 'react';
import { motion } from 'framer-motion';

export default function SectionDivider() {
  return (
    <div>
      <motion.div className='mt-16 mb-4 hidden sm:block' initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.125 }}>
        <svg
          className="animate-[bounce_1s_ease-in-out_8.5] w-40 h-14"
          fill="none"
          strokeLinecap="square"
          strokeLinejoin="miter"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="url(#goldGradient)"
          style={{ filter: "drop-shadow(0 0 10px rgba(0, 0, 0, 0.1))" }}
        >
          <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#996600" /> //#996600, #ffaa2b, #f3d392
          <stop offset="50%" stopColor="#ffaa2b" />
          <stop offset="100%" stopColor="#f3d392" />
        </linearGradient>
          </defs>
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </motion.div>


    </div>
  );
}
