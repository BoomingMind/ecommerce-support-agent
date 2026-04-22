/**
 * Button Component
 * =================
 * Reusable button component built on Radix UI Slot for composition.
 * Styled with Tailwind CSS for consistent appearance.
 *
 * Features:
 * - Polymorphic (can render as button or other element via asChild)
 * - Focus ring for accessibility
 * - Disabled state styling
 *
 * Based on shadcn/ui patterns
 */

import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const Button = React.forwardRef(({ className, asChild, ...props }, ref) => {
  // Use Slot for polymorphism - merges props onto the child element
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        // Base styles - flex container, centered content
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors",

        // Focus styles - visible ring for keyboard navigation
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2",

        // Disabled styles - no pointer events, reduced opacity
        "disabled:pointer-events-none disabled:opacity-50",

        // Default appearance - dark background, white text
        "bg-neutral-900 text-white hover:bg-neutral-800",

        // Allow className override
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };