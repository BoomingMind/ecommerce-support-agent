/**
 * Utility Functions
 * ==================
 * Common helper functions used across components.
 * Particularly useful for conditional className merging with Tailwind.
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges multiple className strings and resolves Tailwind conflicts.
 * - clsx: Handles conditional classes (true/false values)
 * - twMerge: Resolves conflicts when same Tailwind property
 *           appears multiple times (last one wins)
 *
 * @param {...any} inputs - Class names to merge
 * @returns {string} Merged class name string
 *
 * @example
 * cn("px-4 py-2", condition && "bg-red-500", "px-4") // "py-2 bg-red-500"
 *                                          // ^^^ px-4 merged correctly
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}