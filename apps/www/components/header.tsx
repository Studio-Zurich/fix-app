"use client";
import Logo from "@/public/logo/fix_logo.svg";
import NextImage from "next/image";
import { useState } from "react";
import { Menu } from "./menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-8 w-full z-50">
        <div className="container mx-auto px-[5vw] md:px-6 bg-[#343434]/40 backdrop-blur-[40px] rounded-full py-4">
          <div className="flex justify-between items-center">
            <div>
              <NextImage src={Logo} alt="Fix App Logo" className="h-8 w-auto" />
            </div>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="text-primary font-body-light"
              aria-label="Open menu"
            >
              Menu
            </button>
          </div>
        </div>
      </header>
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default Header;
