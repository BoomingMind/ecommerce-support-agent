/**
 * Input Component
 * =================
 * Styled text input component.
 * Features:
 * - Clean, minimal styling with subtle border
 * - Focus ring for accessibility
 * - Placeholder text styling
 *
 * Based on shadcn/ui patterns
 */

import React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      className={cn(
        // Layout - full width, fixed height
        "flex h-11 w-full rounded-lg",

        // Border and background
        "border border-neutral-200 bg-white",

        // Internal spacing
        "px-4 py-2",

        // Typography
        "text-sm placeholder:text-neutral-400",

        // Focus state - dark border and ring
        "focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1",

        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",

        // Smooth transitions
        "transition-colors",

        // Allow className override
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };