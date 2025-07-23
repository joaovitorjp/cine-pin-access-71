import { database } from "@/lib/firebase";
import { ref, get, set, push, remove, update } from "firebase/database";

export interface BackgroundImage {
  id: string;
  url: string;
  alt: string;
  order: number;
  active: boolean;
}

// Get all background images for login
export const getLoginBackgroundImages = async (): Promise<BackgroundImage[]> => {
  const imagesRef = ref(database, 'loginBackgroundImages');
  const snapshot = await get(imagesRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.keys(data)
      .map(key => ({
        id: key,
        ...data[key]
      }))
      .filter(image => image.active)
      .sort((a, b) => a.order - b.order);
  }
  
  return [];
};

// Get all background images (including inactive)
export const getAllBackgroundImages = async (): Promise<BackgroundImage[]> => {
  const imagesRef = ref(database, 'loginBackgroundImages');
  const snapshot = await get(imagesRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.keys(data)
      .map(key => ({
        id: key,
        ...data[key]
      }))
      .sort((a, b) => a.order - b.order);
  }
  
  return [];
};

// Add a new background image
export const addBackgroundImage = async (image: Omit<BackgroundImage, 'id'>): Promise<BackgroundImage> => {
  const imagesRef = ref(database, 'loginBackgroundImages');
  const newImageRef = push(imagesRef);
  
  await set(newImageRef, image);
  
  return {
    id: newImageRef.key as string,
    ...image
  };
};

// Update an existing background image
export const updateBackgroundImage = async (id: string, image: Partial<BackgroundImage>): Promise<void> => {
  const imageRef = ref(database, `loginBackgroundImages/${id}`);
  await update(imageRef, image);
};

// Delete a background image
export const deleteBackgroundImage = async (id: string): Promise<void> => {
  const imageRef = ref(database, `loginBackgroundImages/${id}`);
  await remove(imageRef);
};

// Toggle active status of background image
export const toggleBackgroundImageStatus = async (id: string): Promise<void> => {
  const imageRef = ref(database, `loginBackgroundImages/${id}`);
  const snapshot = await get(imageRef);
  
  if (snapshot.exists()) {
    const currentData = snapshot.val();
    await update(imageRef, { active: !currentData.active });
  }
};