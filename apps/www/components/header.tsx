"use client";
import { Button } from "@repo/ui/button";
import { useState } from "react";
import { Menu } from "./menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-8 w-full z-50">
        <div className="container mx-auto px-[5vw] md:px-6 bg-[#343434]/40 backdrop-blur-[40px] rounded-full py-2 w-[calc(100vw-10vw)] md:w-[calc(100vw-3rem)]">
          <div className="flex justify-between items-center">
            <span className="text-white">Fix App</span>
            <a href="https://app.fixapp.ch" target="_blank">
              <Button variant="secondary">Report</Button>
            </a>
          </div>
        </div>
      </header>
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default Header;
