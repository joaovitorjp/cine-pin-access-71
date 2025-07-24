// Environment configuration
// WARNING: These should be moved to environment variables in production

interface AppConfig {
  firebase: {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  admin: {
    password: string;
  };
  security: {
    sessionTimeout: number; // in hours
    pinAttempts: number;
    adminAttempts: number;
    rateLimitWindow: number; // in minutes
  };
}

// SECURITY WARNING: These credentials should be moved to environment variables
// For production, use proper secret management
const config: AppConfig = {
  firebase: {
    apiKey: "AIzaSyChKZnGqFLgdIaajP3SIQV40R4zR6LY7jg",
    authDomain: "niloatacadista-54052.firebaseapp.com",
    databaseURL: "https://niloatacadista-54052-default-rtdb.firebaseio.com/",
    projectId: "niloatacadista-54052",
    storageBucket: "niloatacadista-54052.appspot.com",
    messagingSenderId: "1080093680253",
    appId: "1:1080093680253:web:2e2ecbb7a8ed26c3e2ec6c"
  },
  admin: {
    // SECURITY WARNING: This should be moved to environment variable
    password: "SecureAdmin2024!@#"
  },
  security: {
    sessionTimeout: 24, // 24 hours
    pinAttempts: 5,
    adminAttempts: 3,
    rateLimitWindow: 15 // 15 minutes
  }
};

export default config;

// Helper function to get config values
export const getConfig = () => config;

// Validation function to ensure required config is present
export const validateConfig = (): boolean => {
  const required = [
    config.firebase.apiKey,
    config.firebase.projectId,
    config.admin.password
  ];
  
  return required.every(value => value && value.length > 0);
};

// Log security warnings in development
if (typeof window !== 'undefined') {
  console.warn('🚨 SECURITY WARNING: Firebase credentials are exposed in client code');
  console.warn('🚨 SECURITY WARNING: Admin password is hardcoded');
  console.warn('📋 TODO: Move credentials to environment variables');
  console.warn('📋 TODO: Implement proper Firebase Security Rules');
  console.warn('📋 TODO: Use server-side authentication for admin functions');
}