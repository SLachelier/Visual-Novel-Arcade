import '../../app/globals.css';
import { motion } from 'framer-motion';

export default function About() {
  return(
    <section className='flex flex-col items-center px-4 min-h-fit'>
      <h1 className='lg:text-8xl text-center mt-10 sm:text-4xl py-[3rem] text-gradient stroke-gold-shine'>About Us</h1>
      <span className='border-2 border-amber-400/70 rounded-xl w-3/5 px-10 py-12 mt-10 mb-6'> 
        <p className='lg:text-2xl sm:text-lg m-0 p-8 text-center'>We are a team of passionate artists, writers and developers that have a love of games, literature and art. 
          We want to share our creative ideas in a way that is fun and accessible. 
          We decided to take on this ambitious project in the hopes to share how enjoyable visual novel games can be.
          We look forward to sharing more of our games with you in the future. This platform we created is a passion project of a group of friends.</p>

          <p className='lg:text-2xl sm:text-lg m-0 p-8 text-center'>
            Because we are a small team, some updates may take time to release. We appreciate your patience and support.
            If you wish to support us, you can donate to our patreon so that we can release more games and updates faster.
          </p>

          <p className='lg:text-2xl sm:text-lg m-0 p-8 text-center'>
          Thank you for playing our games and we hope you enjoy them as much as we enjoy making them!
          </p>
        </span>
    </section>
  );
}