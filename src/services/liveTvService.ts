import { database } from "@/lib/firebase";
import { ref, get, set, push, remove, update } from "firebase/database";
import { LiveTV } from "@/types";

// Get all live TV channels
export const getAllLiveTVChannels = async (): Promise<LiveTV[]> => {
  const liveTvRef = ref(database, 'livetv');
  const snapshot = await get(liveTvRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));
  }
  
  return [];
};

// Get a single live TV channel by ID
export const getLiveTVChannelById = async (id: string): Promise<LiveTV | null> => {
  const liveTvRef = ref(database, `livetv/${id}`);
  const snapshot = await get(liveTvRef);
  
  if (snapshot.exists()) {
    return {
      id,
      ...snapshot.val()
    };
  }
  
  return null;
};

// Add a new live TV channel
export const addLiveTVChannel = async (channel: Omit<LiveTV, 'id'>): Promise<LiveTV> => {
  const liveTvRef = ref(database, 'livetv');
  const newChannelRef = push(liveTvRef);
  
  await set(newChannelRef, channel);
  
  return {
    id: newChannelRef.key as string,
    ...channel
  };
};

// Update an existing live TV channel
export const updateLiveTVChannel = async (id: string, channel: Partial<LiveTV>): Promise<void> => {
  const liveTvRef = ref(database, `livetv/${id}`);
  await update(liveTvRef, channel);
};

// Delete a live TV channel
export const deleteLiveTVChannel = async (id: string): Promise<void> => {
  const liveTvRef = ref(database, `livetv/${id}`);
  await remove(liveTvRef);
};