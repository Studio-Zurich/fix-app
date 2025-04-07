import { Locale } from "../../../apps/app/lib/types";
import de from "./de.json";
import en from "./en.json";

const messages: Record<Locale, typeof de> = {
  de,
  en,
} as const;

export default messages;
