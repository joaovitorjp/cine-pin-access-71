import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Movie } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

  // Vimeo links - Convert to player embed
  // Supports:
  //   vimeo.com/{id}
  //   vimeo.com/{id}/{hash}
  //   vimeo.com/{id}?h={hash}
  //   player.vimeo.com/video/{id}
  //   player.vimeo.com/video/{id}?h={hash}
  if (url.includes('vimeo.com')) {
    let videoId = '';
    let hash = '';
    try {
      const u = new URL(url);
      const playerMatch = u.pathname.match(/\/video\/(\d+)/);
      const rootMatch = u.pathname.match(/^\/(\d+)(?:\/([a-zA-Z0-9]+))?/);
      if (playerMatch) {
        videoId = playerMatch[1];
      } else if (rootMatch) {
        videoId = rootMatch[1];
        if (rootMatch[2]) hash = rootMatch[2];
      }
      const qHash = u.searchParams.get('h');
      if (qHash) hash = qHash;
    } catch {
      const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-zA-Z0-9]+))?/);
      if (m) {
        videoId = m[1];
        if (m[2]) hash = m[2];
      }
    }

    if (videoId) {
      const params = new URLSearchParams();
      if (hash) params.set('h', hash);
      params.set('autoplay', '1');
      params.set('title', '0');
      params.set('byline', '0');
      params.set('portrait', '0');
      params.set('dnt', '1');
      return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
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
