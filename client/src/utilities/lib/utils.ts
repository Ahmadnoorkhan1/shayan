import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind classes with clsx
export function cn(...inputs: string[]): string {
  return twMerge(clsx(inputs));
}

// Check if the location matches
export const isLocationMatch = (targetLocation: string, locationName: string): boolean => {
  return (
    locationName === targetLocation ||
    locationName.startsWith(`${targetLocation}/`)
  );
};

// Convert RGB values to Hex
export const RGBToHex = (r: number, g: number, b: number): string => {
  const componentToHex = (c: number): string => {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const redHex = componentToHex(r);
  const greenHex = componentToHex(g);
  const blueHex = componentToHex(b);

  return `#${redHex}${greenHex}${blueHex}`;
};

// Convert HSL to Hex
export function hslToHex(hsl: string): string {
  hsl = hsl.replace("hsla(", "").replace(")", "");
  const [h, s, l] = hsl.split(" ").map((value) => {
    if (value.endsWith("%")) {
      return parseFloat(value.slice(0, -1));
    } else {
      return parseInt(value, 10);
    }
  });

  const hslToRgb = (h: number, s: number, l: number): string => {
    h /= 360;
    s /= 100;
    l /= 100;

    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (value: number): string => {
      const hex = Math.round(value * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  return hslToRgb(h, s, l);
}

// Convert Hex to RGB
export const hexToRGB = (hex: string, alpha?: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return alpha !== undefined
    ? `rgba(${r}, ${g}, ${b}, ${alpha})`
    : `rgb(${r}, ${g}, ${b})`;
};

// Format time
export const formatTime = (time: string | Date): string => {
  if (!time) return "";

  const date = new Date(time);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Check if object is not empty
export function isObjectNotEmpty(obj: unknown): boolean {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  return Object.keys(obj).length > 0;
}

// Format date
export const formatDate = (date: string | Date): string => {
  const options = { year: "numeric", month: "long", day: "numeric" } as const;
  return new Date(date).toLocaleDateString("en-US", options);
};

// Get random words
export function getWords(inputString: string): string {
  const stringWithoutSpaces = inputString.replace(/\s/g, "");
  return stringWithoutSpaces.substring(0, 3);
}
