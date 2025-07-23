
import { database } from "@/lib/firebase";
import { ref, get, set, push, remove, update } from "firebase/database";
import { Series, Season, Episode } from "@/types";

// Get all series
export const getAllSeries = async (): Promise<Series[]> => {
  const seriesRef = ref(database, 'series');
  const snapshot = await get(seriesRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));
  }
  
  return [];
};

// Get a single series by ID
export const getSeriesById = async (id: string): Promise<Series | null> => {
  const seriesRef = ref(database, `series/${id}`);
  const snapshot = await get(seriesRef);
  
  if (snapshot.exists()) {
    return {
      id,
      ...snapshot.val()
    };
  }
  
  return null;
};

// Add a new series
export const addSeries = async (series: Omit<Series, 'id'>): Promise<Series> => {
  const seriesRef = ref(database, 'series');
  const newSeriesRef = push(seriesRef);
  
  await set(newSeriesRef, series);
  
  return {
    id: newSeriesRef.key as string,
    ...series
  };
};

// Update an existing series
export const updateSeries = async (id: string, series: Partial<Series>): Promise<void> => {
  const seriesRef = ref(database, `series/${id}`);
  await update(seriesRef, series);
};

// Delete a series
export const deleteSeries = async (id: string): Promise<void> => {
  const seriesRef = ref(database, `series/${id}`);
  await remove(seriesRef);
};
