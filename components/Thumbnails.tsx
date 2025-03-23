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
    offset: ["start center", "center start"],
  });

  // Add a smoother transform effect
  const scale = useTransform(scrollYProgress, [0, 0.10, .25], [0.75, 0.95, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.35, .6], [0.5, 0.75, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ scale, opacity }}
      className="mb-3 sm:mb-8 last:mb-0 transition-transform duration-500 ease-in-out transform hover:scale-105 will-change-transform"
    >
      <section className="group rounded-[.25rem] border-2 border-amber-300/70 hover:box-shadow overflow-hidden relative transition bg-white/10 hover:bg-white/20 flex flex-col">
        <div className="thumbnail">
          <Image
            src={imageUrl}
            alt={title}
            quality={95}
            className=""
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center text-white p-4">
            <h3 className="text-5xl font-semibold text-center leading-normal">
              <a href={tgtLink}>{title}</a>
            </h3>
            <p className="mt-2 leading-relaxed text-center text-2xl">{description}</p>
            <ul className="flex flex-wrap mt-4 gap-2 justify-center">
              {tags.map((tag, index) => (
                <li
                  className="bg-black/[0.7] px-3 py-1 text-[1rem] uppercase tracking-wider text-white rounded-full"
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