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

// Convert video links - simplified version
export const convertVideoLink = (url: string): string => {
  console.log('convertVideoLink input:', url);
  
  if (!url) {
    console.log('convertVideoLink: URL is empty');
    return '';
  }

  // Return URL as-is for HTML5 video player
  console.log('convertVideoLink output:', url);
  return url;
};

// Backward compatibility - keep the old function name but use the new one
export const convertGoogleDriveLink = convertVideoLink;
