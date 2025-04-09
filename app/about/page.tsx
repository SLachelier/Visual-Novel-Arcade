import '../../app/globals.css';
import { motion } from 'framer-motion';

export default function About() {
  return(
    <section className='flex flex-col items-center px-4 min-h-fit'>
      <h1 className='lg:text-8xl text-center mt-10 sm:text-4xl py-[3rem] text-gradient stroke-gold-shine'>About</h1>
      <span className='border-2 border-amber-400/70 rounded-xl w-3/5 px-10 py-12 mt-10 mb-6'> 
        <p className='lg:text-2xl sm:text-lg m-0 p-8 text-center'>I am a freelance developer that has a love for interactive fiction storytelling, web development and art. 
          I want to share my creative ideas in a way that is fun and accessible. 
          I decided to take on this ambitious project in the hopes to share how enjoyable visual novels and interactive fiction can be.
          I look forward to sharing more updates with you in the future.</p>

          <p className='lg:text-2xl sm:text-lg m-0 p-8 text-center'>
            Because it is currently just me working on this project, some updates may take time to release. I appreciate your patience and support.
            {/* If you wish to support us, you can donate to our patreon so that we can release more games and updates faster. */}
          </p>

          <p className='lg:text-2xl sm:text-lg m-0 p-8 text-center'>
          Thank you for visiting and I hope you enjoy the interactive stories that are created here!
          </p>
        </span>
    </section>
  );
}