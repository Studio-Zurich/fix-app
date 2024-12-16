"use client";

import { cn } from "@repo/ui/lib/utils";
import { Drawer } from "vaul";

interface VaulProps {
  children: React.ReactNode;
  triggerContent?: React.ReactNode;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Vaul = ({
  children,
  triggerContent,
  className,
  open,
  onOpenChange,
}: VaulProps) => {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      repositionInputs={false}
    >
      <Drawer.Trigger
        className={cn(
          "flex items-center h-9 w-full px-3 py-1 text-base transition-colors file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        {triggerContent}
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-30" />
        <Drawer.Content className="bg-white fixed bottom-0 left-0 right-0 h-[90%] rounded-t-[10px] outline-none z-40">
          <div className="h-full overflow-y-auto">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-4" />
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default Vaul;
