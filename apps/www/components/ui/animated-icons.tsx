import { motion } from "motion/react";

export const AnimatedCamera = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <rect width="256" height="256" fill="none" />
      <rect
        x="24"
        y="64"
        width="208"
        height="128"
        rx="16"
        transform="translate(256) rotate(90)"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="16"
      />
      <motion.circle cx="128" cy="60" r="12" />
    </svg>
  );
};
