import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatMetric(value: number, suffix = "") {
  return `${Math.round(value * 10) / 10}${suffix}`;
}
