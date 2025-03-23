import { useScroll, useTransform, useSpring } from "framer-motion";
import { RefObject } from "react";

export function useLibraryScrollAnimations(ref: RefObject<HTMLElement>) {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "center 35%"],
  });

  const libraryOpacity = useSpring(
    useTransform(scrollYProgress, [0, 0.04], [0, 1]),
    {
      stiffness: 100,
      damping: 20,
    }
  );

  const libraryY = useSpring(
    useTransform(scrollYProgress, [0, 0.32], [25, 0.5]),
    {
      stiffness: 100,
      damping: 20,
    }
  );

  return { libraryOpacity, libraryY };
}

export function useThumbnailsScrollAnimations(
  ref: RefObject<HTMLElement>,
  itemCount: number
) {
  const scrollYProgressArray = Array.from({ length: itemCount }, (_, index) =>
    useScroll({
      target: ref,
      offset: ["start center", `center ${35 + index * 5}%`],
    }).scrollYProgress
  );

  const opacityArray = scrollYProgressArray.map((scrollYProgress) =>
    useTransform(scrollYProgress, [0, 0.04], [0, 1])
  );

  const scaleArray = scrollYProgressArray.map((scrollYProgress) =>
    useTransform(scrollYProgress, [0, 0.08], [0.8, 1])
  );

  return { opacityArray, scaleArray };
}