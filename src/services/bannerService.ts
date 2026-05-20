import { database } from "@/lib/firebase";
import { ref, get, set } from "firebase/database";

const BANNERS_PATH = "settings/homeBanners";
export const MAX_BANNERS = 7;

export interface HomeBanner {
  id: string;
  url: string;
  link?: string;
}

export const getHomeBanners = async (): Promise<HomeBanner[]> => {
  const snap = await get(ref(database, BANNERS_PATH));
  if (!snap.exists()) return [];
  const val = snap.val();
  const arr = Array.isArray(val) ? val : Object.values(val);
  return arr
    .filter((v: any) => v && typeof v.url === "string" && v.url.trim() !== "")
    .map((v: any, i: number) => ({
      id: typeof v.id === "string" ? v.id : `banner-${i}`,
      url: v.url as string,
      link: typeof v.link === "string" ? v.link : undefined,
    }))
    .slice(0, MAX_BANNERS);
};

export const setHomeBanners = async (banners: HomeBanner[]): Promise<void> => {
  const clean = banners
    .filter(b => b.url && b.url.trim() !== "")
    .slice(0, MAX_BANNERS);
  await set(ref(database, BANNERS_PATH), clean);
};
