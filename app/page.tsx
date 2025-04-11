import Image from "next/image";
import Library from "../components/Library";
import SectionDivider from "../components/Section-divider";

export default function Home() {
  return (
    <main className="flex flex-col items-center min-h-fit overflow-x-hidden">
      <h1 className="lg:text-8xl text-center mt-10 sm:text-6xl xs:text-6xl text-6xl py-[3rem] text-gradient stroke-gold-shine">
        Visual Novel Arcade 
      </h1>
        <Image 
          src="/logo.png"
          alt="Gaming Choices Logo"
          width={165}
          height={165}
        />
        <section className="flex flex-wrap justify-around xxs:max-w-[20rem] sm:max-w-[30rem] md:max-w-[40rem] lg:max-w-[50rem] xl:max-w-[60rem] 2xl:max-w-[70rem] xs:mx-6">
            <b className="text-3xl text-center font-light w-[36rem] pt-14 pb-0 mb-0">
              Welcome to Visual Novel Arcade!
            </b>
        <p className="text-xl text-center w-[36rem] pt-8 pb-4 px-8">
          Here you will find a collection of free and interactive visual novels made by me. I am a developer passionate about coding, literature and art. I love to create stories and share them with the world. I hope you enjoy my work and have fun exploring the library below.
        </p>
      </section>
      <SectionDivider />
      <Library />
    </main>
  );
}
