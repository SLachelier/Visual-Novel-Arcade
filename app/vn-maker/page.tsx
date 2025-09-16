"use client";
import '../../app/globals.css';
import React, { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';

export default function VNmaker() {
  const [name, setName] = useState<string>('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault(); // Prevent default form submission behavior
    console.log('Submitted name:', name);
    // This here will eventually send the 'name' to an API or perform other actions upon a future update
    setName(''); // Clear the input field after submission
  };

  return(
    <section className='lg:text-8xl text-center mt-10 sm:text-6xl xs:text-6xl text-6xl py-[3rem] text-gradient stroke-gold-shine'>
      <div>
        <h1>Visual Novel Studio</h1>
      </div>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className='w-full max-w-4xl mx-auto px-4'
      >
        <form className='flex items-center justify-center gap-4 mb-6' onSubmit={handleSubmit}>
          <input type='text' id='vn-setname' name='VN Game Name' value={name} onChange={(e) => setName(e.target.value)} className='flex-1 max-w-md h-12 p-4 border border-gray-300 rounded-md bg-slate-500 focus:border-gray-100 outline-none text-white placeholder-gray-300' placeholder='My Visual Novel' required/>
          <button type='submit' className='h-12 px-6 bg-yellow-600 text-white text-2xl rounded-md hover:bg-yellow-500 transition-colors duration-300 whitespace-nowrap'>
            Save Name
          </button>
        </form>
        <div id='vn-editor-container' className='flex justify-center bg-slate-500 rounded-md w-full min-h-96 p-4'>

        </div>
      </motion.div>
    </section>
  );
}