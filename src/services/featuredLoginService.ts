import { database } from "@/lib/firebase";
import { ref, get, set } from "firebase/database";

const FEATURED_PATH = "settings/featuredLoginMovies";

// Retorna lista de IDs de filmes em destaque na tela de login
export const getFeaturedLoginMovieIds = async (): Promise<string[]> => {
  const snap = await get(ref(database, FEATURED_PATH));
  if (!snap.exists()) return [];
  const val = snap.val();
  if (Array.isArray(val)) return val.filter((v): v is string => typeof v === "string");
  if (val && typeof val === "object") {
    return Object.values(val).filter((v): v is string => typeof v === "string");
  }
  return [];
};

// Salva a lista de IDs em destaque
export const setFeaturedLoginMovieIds = async (ids: string[]): Promise<void> => {
  await set(ref(database, FEATURED_PATH), ids);
};
