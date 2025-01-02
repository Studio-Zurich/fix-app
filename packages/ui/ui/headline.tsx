import { cn } from "@repo/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const headlineVariants = cva("", {
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
interface BaseHeadlineProps extends VariantProps<typeof headlineVariants> {
  size?: string;
}

// H1
interface TypographyH1Props
  extends React.HTMLAttributes<HTMLHeadingElement>,
    BaseHeadlineProps {}

const TypographyH1 = React.forwardRef<HTMLHeadingElement, TypographyH1Props>(
  ({ className, size, weight, ...props }, ref) => {
    return (
      <h1
        className={cn(
          headlineVariants({ weight, className }),
          size ? size : "text-4xl"
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

// H2
interface TypographyH2Props
  extends React.HTMLAttributes<HTMLHeadingElement>,
    BaseHeadlineProps {}

const TypographyH2 = React.forwardRef<HTMLHeadingElement, TypographyH2Props>(
  ({ className, size, weight, ...props }, ref) => {
    return (
      <h2
        className={cn(
          headlineVariants({ weight, className }),
          size ? size : "text-2xl"
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

// H3
interface TypographyH3Props
  extends React.HTMLAttributes<HTMLHeadingElement>,
    BaseHeadlineProps {}

const TypographyH3 = React.forwardRef<HTMLHeadingElement, TypographyH3Props>(
  ({ className, size, weight, ...props }, ref) => {
    return (
      <h3
        className={cn(
          headlineVariants({ weight, className }),
          size ? size : "text-2xl"
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

// H4
interface TypographyH4Props
  extends React.HTMLAttributes<HTMLHeadingElement>,
    BaseHeadlineProps {}

const TypographyH4 = React.forwardRef<HTMLHeadingElement, TypographyH4Props>(
  ({ className, size, weight, ...props }, ref) => {
    return (
      <h4
        className={cn(
          headlineVariants({ weight, className }),
          size ? size : "text-xl"
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

// H5
interface TypographyH5Props
  extends React.HTMLAttributes<HTMLHeadingElement>,
    BaseHeadlineProps {}

const TypographyH5 = React.forwardRef<HTMLHeadingElement, TypographyH5Props>(
  ({ className, size, weight, ...props }, ref) => {
    return (
      <h5
        className={cn(
          headlineVariants({ weight, className }),
          size ? size : "text-lg"
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

// Add display names
TypographyH1.displayName = "TypographyH1";
TypographyH2.displayName = "TypographyH2";
TypographyH3.displayName = "TypographyH3";
TypographyH4.displayName = "TypographyH4";
TypographyH5.displayName = "TypographyH5";

export {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyH5,
  type TypographyH1Props,
  type TypographyH2Props,
  type TypographyH3Props,
  type TypographyH4Props,
  type TypographyH5Props,
};
