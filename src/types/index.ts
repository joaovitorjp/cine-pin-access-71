// Movie data type
export interface Movie {
  id: string;
  title: string;
  imageUrl: string;
  videoUrl: string;
  playerUrl: string;
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

// Live TV data type
export interface LiveTV {
  id: string;
  name: string;
  imageUrl: string;
  playerUrl: string;
  description?: string;
  category?: string;
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
  playerUrl: string;
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