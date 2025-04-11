"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { novelsData } from "../lib/data";

type NovelProps = (typeof novelsData)[number];

export default function Thumbnail({
  title,
  tgtLink,
  description,
  tags,
  imageUrl,
}: NovelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "center center"],
  });

  // Add a smoother transform effect
  const scale = useTransform(scrollYProgress, [0, 0.10, .2], [0.75, 0.95, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.35, .6], [0.5, 0.75, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ scale, opacity }}
      className="mb-3 last:mb-0 transition-transform duration-500 ease-in-out transform hover:scale-105 will-change-transform w-auto xs:w-[14rem] sm:w-auto"
    >
      <section className="group rounded-[.25rem] border-2 border-amber-300/70 hover:box-shadow overflow-hidden transition bg-white/10 hover:bg-white/20">
        <div className="thumbnail">
          <Image
            src={imageUrl}
            alt={title}
            quality={95}
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-around items-center text-white p-6 sm:w-auto xs:fit-content">
            <h2 className="text-pretty xs:text-xl sm:text-2xl md:text-2xl lg:text-5xl font-semibold text-center leading-normal">
              <a href={tgtLink}>{title}</a>
            </h2>
            <p className="text-center text-pretty lg:text-3xl md:text-lg sm:text-lg xs:text-lg">{description}</p>
            <ul className="flex flex-wrap justify-center my-4 gap-2 xs:min-w-[12rem]" >
              {tags.map((tag, index) => (
                <li
                  className="bg-black/[0.7] px-3 text-pretty xs:text-xs sm:text-xs md:text-xs lg:text-lg uppercase tracking-wider text-white rounded-md"
                  key={index}
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </motion.div>
  );
}