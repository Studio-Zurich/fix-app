"use client";
import { GoogleTagManager } from "@next/third-parties/google";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { Label } from "@repo/ui/label";
import { Switch } from "@repo/ui/switch";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@repo/ui/dialog";
import { TypographyParagraph } from "@repo/ui/text";
import { useEffect, useState } from "react";

type CookiePreferences = {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
};

type CookieBannerProps = {
  locale: string;
};

// Helper function to set item with expiration in localStorage
const setWithExpiry = (key: string, value: CookiePreferences, ttl: number) => {
  const now = new Date();
  const item = {
    value,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

// Helper function to get item with expiration from localStorage
const getWithExpiry = (key: string) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    return null;
  }
  const item = JSON.parse(itemStr);
  const now = new Date();
  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
};

export default function CookieBanner({ locale }: CookieBannerProps) {
  const [cookiePreferences, setCookiePreferences] = useState<CookiePreferences>(
    {
      essential: true, // essential cookies are always enabled
      analytics: true,
      marketing: true,
    }
  );
  const [open, setOpen] = useState(false);

  // Load initial state from localStorage and check expiration
  useEffect(() => {
    const savedPreferences = getWithExpiry("cookiePreferences");
    if (savedPreferences) {
      setCookiePreferences(savedPreferences);
    } else {
      setOpen(true);
    }
  }, []);

  const handleToggle = (cookieType: keyof CookiePreferences) => {
    setCookiePreferences((prevState) => {
      const updatedState = {
        ...prevState,
        [cookieType]: !prevState[cookieType],
      };

      return updatedState;
    });
  };

  const handleSavePreferences = () => {
    setWithExpiry(
      "cookiePreferences",
      cookiePreferences,
      30 * 24 * 60 * 60 * 1000
    ); // 30 days
    setOpen(false);

    window.location.reload(); // reload to re-evaluate the GTM condition
  };

  const text = {
    en: {
      title: "Cookie Preferences",
      description: "Manage your cookie settings below.",
      essential: "Essential Cookies",
      essentialDesc:
        "These cookies are necessary for the website to function and cannot be switched off.",
      analytics: "Analytics Cookies",
      analyticsDesc:
        "These cookies allow us to count visits and traffic sources, so we can measure and improve the performance of our site.",
      marketing: "Marketing Cookies",
      marketingDesc: "These cookies help us show you relevant ads.",
      save: "Save Preferences",
    },
    de: {
      title: "Cookie-Einstellungen",
      description: "Verwalten Sie Ihre Cookie-Einstellungen unten.",
      essential: "Essentielle Cookies",
      essentialDesc:
        "Diese Cookies sind notwendig, damit die Website funktioniert und können nicht ausgeschaltet werden.",
      analytics: "Analyse-Cookies",
      analyticsDesc:
        "Diese Cookies ermöglichen es uns, Besuche und Traffic-Quellen zu zählen, damit wir die Leistung unserer Website messen und verbessern können.",
      marketing: "Marketing-Cookies",
      marketingDesc:
        "Diese Cookies helfen uns, Ihnen relevante Werbung zu zeigen.",
      save: "Einstellungen speichern",
    },
  };

  const localeText = locale === "de" ? text.de : text.en;

  return (
    <>
      <Dialog open={open}>
        <DialogContent className="left-auto top-auto bottom-10 right-10 z-50 grid w-full translate-x-[0%] translate-y-[0%]">
          <Card key="1" className="w-full max-w-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center">
                <CookieIcon className="mr-2" />
                <DialogTitle asChild>
                  <CardTitle>{localeText.title}</CardTitle>
                </DialogTitle>
              </div>

              <TypographyParagraph>
                {localeText.description}
              </TypographyParagraph>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex justify-between items-start space-y-2">
                <div>
                  <Label htmlFor="essential">{localeText.essential}</Label>
                  <p className="text-dark-gray-500 text-sm">
                    {localeText.essentialDesc}
                  </p>
                </div>
                <Switch
                  className="ml-auto"
                  id="essential"
                  checked={cookiePreferences.essential}
                  disabled
                />
              </div>
              <div className="flex justify-between items-start space-y-2">
                <div>
                  <Label htmlFor="analytics">{localeText.analytics}</Label>
                  <p className="text-dark-gray-500 text-sm">
                    {localeText.analyticsDesc}
                  </p>
                </div>
                <Switch
                  className="ml-auto"
                  id="analytics"
                  checked={cookiePreferences.analytics}
                  onCheckedChange={() => handleToggle("analytics")}
                />
              </div>

              {/*
              <div className="flex justify-between items-start space-y-2">
                <div>
                  <Label htmlFor="marketing">{localeText.marketing}</Label>
                  <p className="text-dark-gray-500 text-sm">
                    {localeText.marketingDesc}
                  </p>
                </div>
                <Switch
                  className="ml-auto"
                  id="marketing"
                  checked={cookiePreferences.marketing}
                  onCheckedChange={() => handleToggle("marketing")}
                />
              </div> 
              */}
            </CardContent>

            <CardFooter>
              <DialogClose asChild>
                <Button
                  className="ml-auto bg-[#ff781e] hover:bg-[#ff781e]/80"
                  type="button"
                  onClick={handleSavePreferences}
                >
                  {localeText.save}
                </Button>
              </DialogClose>
            </CardFooter>
          </Card>
        </DialogContent>
      </Dialog>
      {cookiePreferences.analytics && <GoogleTagManager gtmId="GTM-5NQHQWM9" />}
    </>
  );
}

function CookieIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
      <path d="M8.5 8.5v.01" />
      <path d="M16 15.5v.01" />
      <path d="M12 12v.01" />
      <path d="M11 17v.01" />
      <path d="M7 14v.01" />
    </svg>
  );
}
