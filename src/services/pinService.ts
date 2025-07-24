
import { database } from "@/lib/firebase";
import { ref, get, set, push, remove, update, query, orderByChild, equalTo } from "firebase/database";
import { PinAccess } from "@/types";
import { generatePin, calculateExpiryDate } from "@/lib/utils";

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

// Create a new PIN
export const createPin = async (daysValid: number, clientName: string): Promise<PinAccess> => {
  const pin = generatePin();
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

// Create a custom PIN
export const createCustomPin = async (customPin: string, daysValid: number, clientName: string): Promise<PinAccess> => {
  const expiryDate = calculateExpiryDate(daysValid);
  const createdAt = new Date().toISOString();
  
  const newPin: Omit<PinAccess, 'id'> = {
    pin: customPin,
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

// Validate a PIN and manage single session
export const validatePin = async (pinCode: string): Promise<PinAccess | null> => {
  const pinsRef = ref(database, 'pins');
  const snapshot = await get(pinsRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    const pinsArray = Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));
    
    const matchedPin = pinsArray.find(p => p.pin === pinCode && p.isActive);
    
    if (matchedPin) {
      const currentDate = new Date();
      const expiryDate = new Date(matchedPin.expiryDate);
      
      if (currentDate <= expiryDate) {
        // Generate new session ID and update PIN
        const newSessionId = generateSessionId();
        await update(ref(database, `pins/${matchedPin.id}`), { 
          sessionId: newSessionId 
        });
        
        return {
          ...matchedPin,
          sessionId: newSessionId
        };
      }
    }
  }
  
  return null;
};

// Generate unique session ID
const generateSessionId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
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
