
import { database } from "@/lib/firebase";
import { ref, get, set, push, remove, update } from "firebase/database";
import { Anime, Season, Episode } from "@/types";

// Get all animes
export const getAllAnimes = async (): Promise<Anime[]> => {
  const animeRef = ref(database, 'animes');
  const snapshot = await get(animeRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));
  }
  
  return [];
};

// Get a single anime by ID
export const getAnimeById = async (id: string): Promise<Anime | null> => {
  const animeRef = ref(database, `animes/${id}`);
  const snapshot = await get(animeRef);
  
  if (snapshot.exists()) {
    return {
      id,
      ...snapshot.val()
    };
  }
  
  return null;
};

// Add a new anime
export const addAnime = async (anime: Omit<Anime, 'id'>): Promise<Anime> => {
  const animeRef = ref(database, 'animes');
  const newAnimeRef = push(animeRef);
  
  await set(newAnimeRef, anime);
  
  return {
    id: newAnimeRef.key as string,
    ...anime
  };
};

// Update an existing anime
export const updateAnime = async (id: string, anime: Partial<Anime>): Promise<void> => {
  const animeRef = ref(database, `animes/${id}`);
  await update(animeRef, anime);
};

// Delete an anime
export const deleteAnime = async (id: string): Promise<void> => {
  const animeRef = ref(database, `animes/${id}`);
  await remove(animeRef);
};
