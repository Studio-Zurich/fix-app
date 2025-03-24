"use client";
import { List } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { TypographySpan } from "@repo/ui/text";
import { useTranslations } from "next-intl";
import NextLink from "next/link";
import { useState } from "react";
import { Menu } from "./menu";

const Header = ({ locale }: { locale: string }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations("Navigation");
  const navLinks = [{ title: t("how-it-works"), href: "/#how-it-works" }];

  return (
    <>
      <header className="fixed top-8 w-full z-50">
        <div className="container ml-[5vw] lg:mx-auto px-[5vw] md:px-6 bg-[#343434]/40 backdrop-blur-[40px] rounded-full py-2 w-max lg:w-[calc(100vw-10vw)] md:w-[calc(100vw-3rem)]">
          <div className="flex justify-start space-x-4 lg:justify-between items-center">
            <NextLink href="/">
              <span className="text-white">Fix</span>
            </NextLink>
            <button
              className="md:hidden mx-auto"
              onClick={() => setIsMenuOpen(true)}
            >
              <List className="text-white" size={24} />
            </button>

            <div className="hidden md:flex gap-8 items-center">
              {navLinks.map((link) => (
                <NextLink key={link.href} href={link.href}>
                  <TypographySpan className="text-background " size="text-base">
                    {link.title}
                  </TypographySpan>
                </NextLink>
              ))}
              <a
                href="https://app.fixapp.ch"
                target="_blank"
                className="cursor-pointer"
              >
                <Button
                  className="hidden md:flex cursor-pointer"
                  variant="secondary"
                >
                  Report
                </Button>
              </a>
            </div>
          </div>
        </div>
        <Button
          variant="secondary"
          className="fixed top-7 right-[5vw] lg:hidden"
        >
          Report
        </Button>
      </header>
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default Header;
