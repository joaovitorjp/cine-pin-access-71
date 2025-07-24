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

// Convert various video links to playable formats
export const convertVideoLink = (url: string): string => {
  if (!url) return '';

  // YouTube links - Convert to embed format
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    
    // Handle youtube.com/watch?v=ID
    if (url.includes('watch?v=')) {
      const match = url.match(/[?&]v=([^&]+)/);
      if (match && match[1]) {
        videoId = match[1];
      }
    }
    // Handle youtu.be/ID
    else if (url.includes('youtu.be/')) {
      const match = url.match(/youtu\.be\/([^?]+)/);
      if (match && match[1]) {
        videoId = match[1];
      }
    }
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0`;
    }
  }

  // Google Drive links
  if (url.includes('drive.google.com')) {
    // Already in the correct format
    if (url.includes('/preview')) {
      return url;
    }
    
    let fileId = '';
    
    // Handle format: https://drive.google.com/file/d/{ID}/view
    if (url.includes('/file/d/')) {
      const match = url.match(/\/file\/d\/([^\/\?]+)/);
      if (match && match[1]) {
        fileId = match[1];
      }
    }
    // Handle format: https://drive.google.com/open?id={ID}
    else if (url.includes('open?id=')) {
      const match = url.match(/id=([^&]+)/);
      if (match && match[1]) {
        fileId = match[1];
      }
    }
    
    if (fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  }

  // Direct video files (.mp4, .webm, .ogg, etc.) or HLS streams (.m3u8)
  if (url.match(/\.(mp4|webm|ogg|avi|mov|wmv|flv|m3u8)(\?.*)?$/i)) {
    return url;
  }

  // Already embedded or iframe-ready URLs
  if (url.includes('/embed/') || url.includes('iframe')) {
    return url;
  }

  // For any other URL, return as-is (could be from various video hosting services)
  return url;
};

// Backward compatibility - keep the old function name but use the new one
export const convertGoogleDriveLink = convertVideoLink;
