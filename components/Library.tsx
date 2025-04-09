"use client";

import React, { useRef, useState } from "react";
import { novelsData } from "@/lib/data";
import Thumbnail from "./Thumbnails";
import { motion, useSpring } from "framer-motion";
import { useLibraryScrollAnimations, useThumbnailsScrollAnimations } from "@/lib/hooks";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

export default function Library() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showTags, setShowTags] = useState<boolean>(false); // State to toggle tag dropdown visibility
  const [tagStates, setTagStates] = useState<Record<string, "neutral" | "include" | "exclude">>({});

  const filterNovels = () => {
    return novelsData.filter((novel) => {
      const matchesTags = Object.entries(tagStates).every(([tag, state]) => {
        if (state === "include") return novel.tags.includes(tag);
        if (state === "exclude") return !novel.tags.includes(tag);
        return true; // Neutral state
      });
  
      const matchesSearch =
        searchQuery === "" ||
        novel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        novel.description.toLowerCase().includes(searchQuery.toLowerCase());
  
      return matchesTags && matchesSearch;
    });
  };

  const handleTagClick = (tag: string) => {
    setTagStates((prevStates) => {
      const currentState = prevStates[tag] || "neutral";
      const nextState =
        currentState === "neutral" ? "include" : currentState === "include" ? "exclude" : "neutral";
  
      return { ...prevStates, [tag]: nextState };
    });
  };

  const libraryRef = useRef<HTMLDivElement>(null);

  // Use custom hooks for animations
  const { libraryOpacity, libraryY } = useLibraryScrollAnimations(libraryRef as React.RefObject<HTMLElement>);
  const { opacityArray, scaleArray } = useThumbnailsScrollAnimations(
    libraryRef as React.RefObject<HTMLElement>,
    novelsData.length
  ) || { opacityArray: [], scaleArray: [] };

  // Generate animation variants for the Thumbnails
  const thumbnailVariants = novelsData.map((_, index) => ({
    opacity: useSpring(opacityArray[index], {
      stiffness: 100,
      damping: 20,
    }),
    scale: useSpring(scaleArray[index], {
      stiffness: 100,
      damping: 20,
    }),
  }));

  const filteredNovels = filterNovels();

  // Framer Motion variants for tag buttons
  const tagVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.05, // Stagger the appearance of each tag button
        duration: 0.3,
      },
    }),
  };

  return (
    <motion.section
      ref={libraryRef}
      id="projects"
      className="scroll-mt-6 mb-[2.5rem]"
    >
      <motion.div
        style={{ opacity: libraryOpacity, y: libraryY }}
        className="lg:text-4xl sm:text-2xl text-center pt-[2.5rem] pb-[2rem] font-bold uppercase"
      >
        Library
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.125 }}
        className="search-container"
      >
        <form
          name="search"
          className="flex flex-wrap justify-center items-center max-w-3xl mx-auto mb-6"
          onMouseOut={(e) => {
        e.currentTarget.value = '';
        e.currentTarget.blur();
          }}
        >
          <input
        className="input focus:outline-none selection:background-transparent border-2 border-amber-300/70"
        type="search"
        placeholder=""
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <motion.div
          initial={{ opacity: 0, y: -60}}
          animate={{ opacity: 1, y: -60 }}
          transition={{ delay: 0, duration: 0.3 }}
          className="flex items-center justify-center"
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} className="icon text-amber-300/70" />
        </motion.div>
        <motion.button
          className="tag-toggle-btn text-[var(--foreground)] px-4 py-2 rounded-sm mb-4 border-2 border-amber-300/70"
          onClick={() => setShowTags((prev) => !prev)} // Toggle tag dropdown visibility
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {showTags ? "Hide Tags" : "Search by Tags"}
        </motion.button>
        {showTags && ( // Conditionally render the tag buttons
          <motion.div
        className="lg:text-2xl sm:text-lg text-center text-white tag-btn-container flex flex-wrap justify-center mt-4 border-amber-300/70"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.375 }}
          >
        {[
          "Action",
          "Adventure",
          "Celebrity",
          "Crime",
          "Rivalry",
          "Fantasy",
          "Horror",
          "Mystery",
          "Romance",
          "Sci-fi",
          "Modern",
          "Supernatural",
          "Introspective",
          "Slice of Life",
          "Survival",
          "Thriller",
          "Tragedy",
          "Comedy",
          "Drama",
          "Historical Fiction",
          "Psychological",
          "Dystopian",
          "School Life",
          "RPG",
          "Martial Arts",
          "Sports",
          "Isekai",
          "Time Travel",
          "Military",
          "Superheroes",
          "Villainess",
          "Reincarnation",
          "Magic",
          "Boys' Love",
          "Girls' Love",
          "Fan Work",
          "Completed",
          "On-going",
          "Hiatus",
          "Dropped",
          "Overpowered MC",
          "Adaptation",
          "Weak to Strong",
          "Oneshot",
          "Space Opera",
          "Slow Burn",
          "Hurt-Comfort",
          "Apocalypse",
        ].map((tag, index) => (
          <motion.button
            key={tag}
            className={`tag-btn ${
          tagStates[tag] === "include"
            ? "include"
            : tagStates[tag] === "exclude"
            ? "exclude"
            : ""
            }`}
            onClick={() => handleTagClick(tag)}
            custom={index} // Pass the index to the variants
            variants={tagVariants}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
          >
            {tag}
          </motion.button>
        ))}
          </motion.div>
        )}
      </motion.div>

      <motion.div className="lg:grid-cols-4 grid gap-y-8 gap-x-8 md:grid-cols-3 sm:grid-cols-2 mt-16" layout>
        {filteredNovels.map((novel, index) => {
          const variants = {
            hidden: {
              opacity: thumbnailVariants[index]?.opacity.get() || 0,
              scale: thumbnailVariants[index]?.scale.get() || 0,
            },
            visible: {
              opacity: thumbnailVariants[index]?.opacity.get() || 1,
              scale: thumbnailVariants[index]?.scale.get() || 1,
            },
          };

          return (
            <motion.div
              className='novels'
              key={index}
              custom={index} // Pass the index to the variants
              initial="hidden"
              animate="visible"
              variants={variants}
            >
              <Thumbnail {...novel} />
            </motion.div>
          );
        })}
      </motion.div>
      <motion.p
        style={{ opacity: libraryOpacity, y: libraryY }}
        className="mt-24 flex justify-center text-white text-2xl"
      >
        You&apos;ve reached the end of the current library. Check back for more
        releases later!
      </motion.p>
    </motion.section>
  );
}