// Curated set of pre-built avatars (DiceBear, no API key needed).
// Each entry is a stable PNG URL safe to render in <img>.
const STYLES = [
  "avataaars",
  "bottts",
  "fun-emoji",
  "lorelei",
  "micah",
  "notionists",
  "personas",
  "thumbs",
] as const;

const SEEDS = [
  "Atlas", "Nova", "Lumen", "Echo", "Pixel", "Mango",
  "Onyx", "Sable", "Vega", "Zephyr", "Kairo", "Iris",
];

export const AVATAR_OPTIONS: string[] = STYLES.flatMap((style) =>
  SEEDS.slice(0, 4).map(
    (seed) =>
      `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&radius=50&backgroundType=gradientLinear`
  )
);

export const isValidAvatar = (url?: string | null): boolean =>
  !!url && /^https:\/\/api\.dicebear\.com\//.test(url);
