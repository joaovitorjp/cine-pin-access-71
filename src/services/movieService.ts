
import { database } from "@/lib/firebase";
import { ref, get, set, push, remove, update } from "firebase/database";
import { Movie } from "@/types";

// Get all movies
export const getAllMovies = async (): Promise<Movie[]> => {
  const moviesRef = ref(database, 'movies');
  const snapshot = await get(moviesRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));
  }
  
  return [];
};

// Get a single movie by ID
export const getMovieById = async (id: string): Promise<Movie | null> => {
  const movieRef = ref(database, `movies/${id}`);
  const snapshot = await get(movieRef);
  
  if (snapshot.exists()) {
    return {
      id,
      ...snapshot.val()
    };
  }
  
  return null;
};

// Add a new movie
export const addMovie = async (movie: Omit<Movie, 'id'>): Promise<Movie> => {
  const moviesRef = ref(database, 'movies');
  const newMovieRef = push(moviesRef);
  
  await set(newMovieRef, movie);
  
  return {
    id: newMovieRef.key as string,
    ...movie
  };
};

// Update an existing movie
export const updateMovie = async (id: string, movie: Partial<Movie>): Promise<void> => {
  const movieRef = ref(database, `movies/${id}`);
  await update(movieRef, movie);
};

// Delete a movie
export const deleteMovie = async (id: string): Promise<void> => {
  const movieRef = ref(database, `movies/${id}`);
  await remove(movieRef);
};
