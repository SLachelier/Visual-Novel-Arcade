"use client";
import '../../app/globals.css';
import { motion } from 'framer-motion';

export default function VNmaker() {
  return(
    <section className='lg:text-8xl text-center mt-10 sm:text-6xl xs:text-6xl text-6xl py-[3rem] text-gradient stroke-gold-shine'>
      <div>
        <h1>Visual Novel Studio</h1>
      </div>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <form className='mt-10 flex flex-col items-start justify-start gap-4'>
          <textarea className='w-full h-64 p-4 border border- border-gray-300 rounded-md bg-slate-500 focus:border-gray-100 outline-none' placeholder='My Visual Novel'></textarea>
          <button className='mt-4 px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-500 transition-colors duration-300'>
            Save Name
          </button>
        </form>
        <div id='vn-editor-container' className='flex justify-center bg-slate-500 rounded-md w-full'>

        </div>
      </motion.div>
    </section>
  );
}