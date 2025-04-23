"use client";
import { List } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { TypographySpan } from "@repo/ui/text";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { Menu } from "./menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations("Navigation");
  const navLinks = [{ title: t("how-it-works"), href: "/#how-it-works" }];

  return (
    <>
      <header className="fixed top-8 w-full z-50">
        <div className="container ml-[5vw] lg:mx-auto px-[5vw] md:px-6 bg-[#343434]/40 backdrop-blur-[40px] rounded-full py-2 w-max lg:w-[calc(100vw-10vw)] md:w-[calc(100vw-3rem)]">
          <div className="flex justify-start space-x-4 lg:justify-between items-center">
            <Link href="/">
              <span className="text-white">Fix</span>
            </Link>
            <button
              className="md:hidden mx-auto"
              onClick={() => setIsMenuOpen(true)}
            >
              <List className="text-white" size={24} />
            </button>

            <div className="hidden md:flex md:justify-between gap-8 items-center w-full">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <TypographySpan className="text-background " size="text-base">
                    {link.title}
                  </TypographySpan>
                </Link>
              ))}
              <a
                href="https://app.fixapp.ch/reports/new-report"
                target="_blank"
                className="cursor-pointer hidden md:block"
              >
                <Button className="cursor-pointer" variant="secondary">
                  Report
                </Button>
              </a>
            </div>
          </div>
        </div>
        <a href="https://app.fixapp.ch/reports/new-report" target="_blank">
          <Button
            variant="secondary"
            className="fixed top-7 right-[5vw] md:hidden"
          >
            Report
          </Button>
        </a>
      </header>
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default Header;
