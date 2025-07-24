
// Movie data type
export interface Movie {
  id: string;
  title: string;
  imageUrl: string;
  videoUrl: string;
  description: string;
  year?: string;
  rating?: string;
  genre?: string;
}

// Series data type
export interface Series {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  year?: string;
  rating?: string;
  genre?: string;
  seasons: Season[];
}

// Anime data type
export interface Anime {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  year?: string;
  rating?: string;
  genre?: string;
  seasons: Season[];
}

export interface Season {
  id: string;
  number: number;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  number: number;
  title: string;
  videoUrl: string;
  description?: string;
  thumbnail?: string;
}

// PIN type
export interface PinAccess {
  id: string;
  pin: string;
  expiryDate: string;
  createdAt: string;
  daysValid: number;
  isActive: boolean;
  clientName: string;
  sessionId?: string;
}
