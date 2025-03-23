"use client";
import { motion } from "framer-motion";

export const AnimatedCamera = () => {
  return (
    <div className="w-10 h-10 flex-shrink-0">
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
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="12"
          className="stroke-background"
        />
        <motion.circle
          cx="128"
          cy="60"
          r="12"
          className="fill-background"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.2, 1],
            filter: ["brightness(1)", "brightness(2)", "brightness(1)"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.5, 1],
          }}
        />
        <motion.circle
          cx="128"
          cy="60"
          r="16"
          className="fill-background"
          opacity={0.3}
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.5, 1],
          }}
        />
      </svg>
    </div>
  );
};

export const AnimatedLogo = () => {
  return (
    <div className="w-8 h-8 flex-shrink-0">
      <svg viewBox="0 0 404 457" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_1_7)">
          <path
            d="M362 148.5L79 446.5L127.5 148.5H28L1 1H388.5L241 148.5H362Z"
            fill="white"
          />
          <path
            d="M362 148.5L79 446.5L127.5 148.5H28L1 1H388.5L241 148.5H362Z"
            stroke="white"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_1_7"
            x="0.400391"
            y="0.5"
            width="403.307"
            height="455.52"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dx="10" dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_1_7"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_1_7"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export const AnimatedCheckmark = () => {
  return (
    <div className="w-10 h-10 flex-shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
        <rect width="256" height="256" fill="none" />
        <polyline
          points="88 136 112 160 168 104"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="16"
        />
        <circle
          cx="128"
          cy="128"
          r="96"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="16"
        />
      </svg>
    </div>
  );
};
