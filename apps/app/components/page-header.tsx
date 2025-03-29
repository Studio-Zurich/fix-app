import { TypographyH1 } from "@repo/ui/headline";
import { cn } from "@repo/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const pageHeaderVariants = cva("pt-4", {
  variants: {
    variant: {
      default: "",
      flow: "pt-2 text-center -mb-6",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface PageHeaderProps extends VariantProps<typeof pageHeaderVariants> {
  title: string;
}

const PageHeader = ({ title, variant }: PageHeaderProps) => {
  return (
    <section className={cn(pageHeaderVariants({ variant }))}>
      <TypographyH1 size={variant === "flow" ? "text-2xl" : ""}>
        {title}
      </TypographyH1>
    </section>
  );
};

export default PageHeader;
