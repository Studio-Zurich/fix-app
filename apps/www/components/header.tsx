"use client";
import { Button } from "@repo/ui/button";
import { TypographySpan } from "@repo/ui/text";
import NextLink from "next/link";
import { useState } from "react";
import { Menu } from "./menu";
const Header = ({ locale }: { locale: string }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-8 w-full z-50">
        <div className="container mx-auto px-[5vw] md:px-6 bg-[#343434]/40 backdrop-blur-[40px] rounded-full py-2 w-[calc(100vw-10vw)] md:w-[calc(100vw-3rem)]">
          <div className="flex justify-between items-center">
            <NextLink href="/">
              <span className="text-white">Fix App</span>
            </NextLink>
            <Button variant="secondary" onClick={() => setIsMenuOpen(true)}>
              <TypographySpan>
                {locale === "de" ? "Menü" : "Menu"}
              </TypographySpan>
            </Button>
          </div>
        </div>
      </header>
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default Header;
