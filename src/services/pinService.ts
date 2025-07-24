
import { database } from "@/lib/firebase";
import { ref, get, set, push, remove, update, query, orderByChild, equalTo } from "firebase/database";
import { PinAccess } from "@/types";
import { generatePin, calculateExpiryDate } from "@/lib/utils";
import { generateSecureSessionId, generateSecurePin, pinRateLimiter, getClientIdentifier, isValidPinFormat } from "@/lib/security";

// Get all PINs
export const getAllPins = async (): Promise<PinAccess[]> => {
  const pinsRef = ref(database, 'pins');
  const snapshot = await get(pinsRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));
  }
  
  return [];
};

// Create a new PIN with enhanced security
export const createPin = async (daysValid: number, clientName: string): Promise<PinAccess> => {
  const pin = generateSecurePin(8); // Use secure PIN generation
  const expiryDate = calculateExpiryDate(daysValid);
  const createdAt = new Date().toISOString();
  
  const newPin: Omit<PinAccess, 'id'> = {
    pin,
    expiryDate,
    createdAt,
    daysValid,
    isActive: true,
    clientName
  };
  
  const pinsRef = ref(database, 'pins');
  const newPinRef = push(pinsRef);
  
  await set(newPinRef, newPin);
  
  return {
    id: newPinRef.key as string,
    ...newPin
  };
};

// Create a custom PIN with validation
export const createCustomPin = async (customPin: string, daysValid: number, clientName: string): Promise<PinAccess> => {
  // Validate PIN format for security
  if (!isValidPinFormat(customPin)) {
    throw new Error('PIN format inválido. Use apenas letras e números (6-12 caracteres).');
  }
  
  // Check if PIN already exists
  const existingPins = await getAllPins();
  if (existingPins.some(p => p.pin === customPin && p.isActive)) {
    throw new Error('Este PIN já está em uso. Escolha outro.');
  }
  
  const expiryDate = calculateExpiryDate(daysValid);
  const createdAt = new Date().toISOString();
  
  const newPin: Omit<PinAccess, 'id'> = {
    pin: customPin.toUpperCase(), // Normalize to uppercase
    expiryDate,
    createdAt,
    daysValid,
    isActive: true,
    clientName
  };
  
  const pinsRef = ref(database, 'pins');
  const newPinRef = push(pinsRef);
  
  await set(newPinRef, newPin);
  
  return {
    id: newPinRef.key as string,
    ...newPin
  };
};

// Validate a PIN with rate limiting and security checks
export const validatePin = async (pinCode: string): Promise<PinAccess | null> => {
  const clientId = getClientIdentifier();
  
  // Check rate limiting
  if (pinRateLimiter.isBlocked(clientId)) {
    const remainingTime = Math.ceil(pinRateLimiter.getRemainingTime(clientId) / 60000);
    throw new Error(`Muitas tentativas. Tente novamente em ${remainingTime} minutos.`);
  }
  
  // Validate PIN format
  if (!isValidPinFormat(pinCode)) {
    pinRateLimiter.recordAttempt(clientId);
    throw new Error('Formato de PIN inválido.');
  }
  
  const pinsRef = ref(database, 'pins');
  const snapshot = await get(pinsRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    const pinsArray = Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));
    
    const matchedPin = pinsArray.find(p => p.pin === pinCode.toUpperCase() && p.isActive);
    
    if (matchedPin) {
      const currentDate = new Date();
      const expiryDate = new Date(matchedPin.expiryDate);
      
      if (currentDate <= expiryDate) {
        // Generate secure session ID and update PIN
        const newSessionId = generateSecureSessionId();
        await update(ref(database, `pins/${matchedPin.id}`), { 
          sessionId: newSessionId,
          lastLogin: new Date().toISOString()
        });
        
        return {
          ...matchedPin,
          sessionId: newSessionId
        };
      }
    }
  }
  
  // Record failed attempt
  pinRateLimiter.recordAttempt(clientId);
  return null;
};

// Legacy function - now using secure version from security.ts
// Kept for backward compatibility
const generateSessionId = (): string => {
  return generateSecureSessionId();
};

// Check if session is still valid
export const validateSession = async (pinCode: string, sessionId: string): Promise<boolean> => {
  const pinsRef = ref(database, 'pins');
  const snapshot = await get(pinsRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    const pinsArray = Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));
    
    const matchedPin = pinsArray.find(p => p.pin === pinCode && p.isActive);
    
    if (matchedPin && matchedPin.sessionId === sessionId) {
      const currentDate = new Date();
      const expiryDate = new Date(matchedPin.expiryDate);
      return currentDate <= expiryDate;
    }
  }
  
  return false;
};

// Deactivate a PIN
export const deactivatePin = async (id: string): Promise<void> => {
  const pinRef = ref(database, `pins/${id}`);
  await update(pinRef, { isActive: false });
};

// Delete a PIN completely
export const deletePin = async (id: string): Promise<void> => {
  const pinRef = ref(database, `pins/${id}`);
  await remove(pinRef);
};
