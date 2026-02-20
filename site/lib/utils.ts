import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * @ai-context Utility function to merge tailwind classes
 * @ai-related components/layout/*
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
