import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getDatabase, ref, get, set, push, remove, update } from "firebase/database";
import { Movie, PinAccess } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to generate a random PIN
export const generatePin = (length: number = 6): string => {
  const characters = '0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// Function to calculate expiry date based on days
export const calculateExpiryDate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

// Function to check if a PIN is valid
export const isPinValid = (pin: PinAccess): boolean => {
  if (!pin.isActive) return false;
  
  const currentDate = new Date();
  const expiryDate = new Date(pin.expiryDate);
  
  return currentDate <= expiryDate;
};

// Format date for display
export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Convert Google Drive link to direct playable URL
export const convertGoogleDriveLink = (url: string): string => {
  if (!url) return '';
  
  // Already in the correct format
  if (url.includes('drive.google.com/file/d/') && url.includes('/preview')) {
    return url;
  }
  
  // Extract file ID from Google Drive URL
  let fileId = '';
  
  // Handle format: https://drive.google.com/file/d/{ID}/view
  if (url.includes('/file/d/')) {
    const match = url.match(/\/file\/d\/([^\/\?]+)/);
    if (match && match[1]) {
      fileId = match[1];
    }
  }
  // Handle format: https://drive.google.com/open?id={ID}
  else if (url.includes('drive.google.com/open?id=')) {
    const match = url.match(/id=([^&]+)/);
    if (match && match[1]) {
      fileId = match[1];
    }
  }
  // If the URL is just the ID
  else if (/^[a-zA-Z0-9_-]{25,}$/.test(url)) {
    fileId = url;
  }
  
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  
  return url;
};
