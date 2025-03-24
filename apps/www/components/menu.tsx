"use client";
import { Link } from "@/i18n/navigation";

import { TypographySpan } from "@repo/ui/text";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import LocaleToggle from "./ui/locale-toggle";

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
}

// Animation variants from header.tsx
const menuVars: Variants = {
  initial: {
    scaleY: 0,
  },
  animate: {
    scaleY: 1,
    transition: {
      duration: 0.5,
      ease: [0.12, 0, 0.39, 0],
    },
  },
  exit: {
    scaleY: 0,
    transition: {
      delay: 0.5,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const containerVars: Variants = {
  initial: {
    transition: {
      staggerChildren: 0.09,
      staggerDirection: -1,
    },
  },
  open: {
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.09,
      staggerDirection: 1,
    },
  },
};

const mobileLinkVars: Variants = {
  initial: {
    y: "30vh",
    transition: {
      duration: 0.5,
      ease: [0.37, 0, 0.63, 1],
    },
  },
  open: {
    y: 0,
    transition: {
      ease: [0, 0.55, 0.45, 1],
      duration: 0.7,
    },
  },
};

const MobileNavLink = ({
  title,
  href,
  onClose,
}: {
  title: string;
  href: string;
  onClose: () => void;
}) => {
  return (
    <Link
      href={href}
      target={href.includes("https") ? "_blank" : undefined}
      onClick={onClose}
      className="text-4xl sm:text-5xl uppercase text-primary font-headline overflow-hidden block hover:underline underline-offset-4"
    >
      <motion.div
        variants={mobileLinkVars}
        className={`${href.includes("https") ? "underline underline-offset-5" : ""}`}
      >
        {title}
      </motion.div>
    </Link>
  );
};

export const Menu = ({ isOpen, onClose }: MenuProps) => {
  const t = useTranslations("Navigation");

  const navLinks = [
    { title: t("how-it-works"), href: "/#how-it-works" },
    { title: "Report", href: "https://app.fixapp.ch" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={menuVars}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed left-0 top-0 w-full h-svh origin-top bg-white z-60"
        >
          <div className="flex h-full flex-col relative">
            <div className="absolute top-0 left-0 w-full grid grid-cols-8 lg:grid-cols-12 py-8 px-4 lg:px-6 gap-8">
              <div className="col-span-4 lg:col-span-7 flex justify-start items-center" />

              <div className="col-span-4 lg:col-span-5 flex justify-end items-center">
                <button
                  className="cursor-pointer text-primary font-body-light"
                  onClick={onClose}
                  aria-label={t("close")}
                >
                  {t("close")}
                </button>
              </div>
            </div>
            <div
              className="absolute top-[94px] left-0 w-full flex justify-center items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <LocaleToggle onClose={onClose} />
            </div>
            <motion.div
              variants={containerVars}
              initial="initial"
              animate="open"
              exit="initial"
              className="flex flex-col h-full justify-center items-center gap-6 text-center"
            >
              {navLinks.map((link) => (
                <MobileNavLink
                  key={link.title}
                  title={link.title}
                  href={link.href}
                  onClose={onClose}
                />
              ))}
              {/* <a href="https://app.fixapp.ch" target="_blank">
                <Button className="w-full min-w-60 lg:min-w-lg">Report</Button>
              </a> */}
            </motion.div>
            <div className="absolute bottom-12 left-0 w-full flex justify-center items-center space">
              <a href="mailto:info@fixapp.ch" target="_blank">
                <TypographySpan className="block" size="text-lg">
                  info@fixapp.ch
                </TypographySpan>
              </a>
              {/* <Link
                href="/imprint"
                className="text-primary/80 font-body-light"
                onClick={onClose}
              >
                {t("imprint")}
              </Link>
              <Link
                href="/privacy"
                className="text-primary/80 font-body-light"
                onClick={onClose}
              >
                {t("privacy")}
              </Link> */}
            </div>
            <div className="absolute bottom-4 left-0 w-full flex justify-center items-center space-x-4">
              <TypographySpan className="text-primary/50" size="text-sm">
                Copyright © {new Date().getFullYear()} Fixapp GmbH i.G.
              </TypographySpan>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
