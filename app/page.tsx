import Image from "next/image";
import Library from "../components/Library";
import SectionDivider from "../components/Section-divider";

export default function Home() {
  return (
    <main className="flex flex-col items-center px-4 bg-gradient bg-gradient-to-b from-purple-900/20 to-zinc-950 min-h-fit">
      <h1 className="lg:text-8xl text-center mt-10 sm:text-4xl py-[3rem] text-gradient stroke-gold-shine">
        Visual Novel Arcade 
      </h1>
        <Image 
          src="/logo.png"
          alt="Gaming Choices Logo"
          width={165}
          height={165}
        />
      
            <b className="text-3xl text-center font-light w-[36rem] pt-14 pb-0 mb-0">
            Welcome to Visual Novel Arcade!</b>
      <p className="text-xl text-center w-[36rem] pt-8 pb-4">
        Here you can find a collection of free & interactive visual novels made by our dev team. We are a group of passionate developers & artists who love to create stories and share them with the world. We hope you enjoy our work and have fun exploring our library below.
      </p>
      <SectionDivider />
      <Library />
    </main>
  );
}
