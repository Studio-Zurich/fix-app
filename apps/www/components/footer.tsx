import { Link } from "@/i18n/navigation";
import { TypographyH3 } from "@repo/ui/headline";
import { Separator } from "@repo/ui/separator";
import { TypographySpan } from "@repo/ui/text";
import { useTranslations } from "next-intl";
import NextLink from "next/link";

const Footer = () => {
  const t = useTranslations("Navigation");
  const navLinks = [
    { title: t("home"), href: "/" },
    { title: t("how-it-works"), href: "/#how-it-works" },
    { title: t("report"), href: "https://app.fixapp.ch" },
  ];

  return (
    <footer className="pt-16 pb-24 bg-foreground dark:bg-background relative">
      <div className="container mx-auto px-[5vw] md:px-6 grid md:grid-cols-2 gap-8">
        <NextLink href="/">
          <span className="text-white font-medium">FIX App</span>
        </NextLink>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <TypographyH3
              className="text-background/50 mb-2 uppercase"
              size="text-sm"
            >
              {t("links")}
            </TypographyH3>
            {navLinks.map((link) => (
              <NextLink key={link.href} href={link.href} className="block">
                <TypographySpan className="text-background">
                  {link.title}
                </TypographySpan>
              </NextLink>
            ))}
          </div>
          <div className="md:w-1/2">
            <TypographyH3
              className="text-background/50 mb-2 uppercase"
              size="text-sm"
            >
              {t("legal")}
            </TypographyH3>
            <Link href="/impressum" className="block">
              <TypographySpan className="text-background">
                {t("imprint")}
              </TypographySpan>
            </Link>
            <Link href="/datenschutz" className="block">
              <TypographySpan className="text-background">
                {t("privacy")}
              </TypographySpan>
            </Link>
          </div>
        </div>
        <div className="md:col-start-2">
          <TypographyH3 className="text-background" size="text-6xl">
            {t("getInTouch")}
          </TypographyH3>
          <Separator className="bg-background/10 my-4" />

          <TypographySpan className="text-background">
            info@fixapp.ch
          </TypographySpan>
        </div>
      </div>
      <div className="absolute bottom-4 left-0 w-full flex justify-center items-center space-x-4">
        <TypographySpan className="text-white/50" size="text-sm">
          Copyright © {new Date().getFullYear()} Fixapp GmbH i.G.
        </TypographySpan>
      </div>
    </footer>
  );
};

export default Footer;
