import sharedConfig from "@repo/ui/tailwind.config";

const config = {
  ...sharedConfig,
  content: ["./app/**/*.{ts,tsx}", "../../packages/ui/ui/**/*.{ts,tsx}"],
};

export default config;
