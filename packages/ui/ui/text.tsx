import { cn } from "@repo/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const textVariants = cva("", {
  variants: {
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
  },
  defaultVariants: {
    weight: "normal",
  },
});

// Base interface for shared props
interface BaseTypographyProps extends VariantProps<typeof textVariants> {
  size?: string;
}

// Paragraph
interface TypographyParagraphProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    BaseTypographyProps {}

const TypographyParagraph = React.forwardRef<
  HTMLParagraphElement,
  TypographyParagraphProps
>(({ className, size, weight, ...props }, ref) => {
  return (
    <p
      className={cn(
        textVariants({ weight, className }),
        size ? size : "text-sm"
      )}
      ref={ref}
      {...props}
    />
  );
});

// Span
interface TypographySpanProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    BaseTypographyProps {}

const TypographySpan = React.forwardRef<HTMLSpanElement, TypographySpanProps>(
  ({ className, size, weight, ...props }, ref) => {
    return (
      <span
        className={cn(
          textVariants({ weight, className }),
          size ? size : "text-sm"
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

// Unordered List
interface TypographyUlProps
  extends React.HTMLAttributes<HTMLUListElement>,
    BaseTypographyProps {}

const TypographyUl = React.forwardRef<HTMLUListElement, TypographyUlProps>(
  ({ className, size, weight, ...props }, ref) => {
    return (
      <ul
        className={cn(
          textVariants({ weight, className }),
          size ? size : "text-sm",
          "list-disc list-inside"
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

// Ordered List
interface TypographyOlProps
  extends React.HTMLAttributes<HTMLOListElement>,
    BaseTypographyProps {}

const TypographyOl = React.forwardRef<HTMLOListElement, TypographyOlProps>(
  ({ className, size, weight, ...props }, ref) => {
    return (
      <ol
        className={cn(
          textVariants({ weight, className }),
          size ? size : "text-sm",
          "list-decimal list-inside"
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

TypographyParagraph.displayName = "TypographyParagraph";
TypographySpan.displayName = "TypographySpan";
TypographyUl.displayName = "TypographyUl";
TypographyOl.displayName = "TypographyOl";

export {
  TypographyOl,
  TypographyParagraph,
  TypographySpan,
  TypographyUl,
  type TypographyOlProps,
  type TypographyParagraphProps,
  type TypographySpanProps,
  type TypographyUlProps,
};
