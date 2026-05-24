
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
export const createPin = async (daysValid: number, clientName: string, createdBy?: string): Promise<PinAccess> => {
  const pin = generatePin();
  const expiryDate = calculateExpiryDate(daysValid);
  const createdAt = new Date().toISOString();
  
  const newPin: Omit<PinAccess, 'id'> = {
    pin,
    expiryDate,
    createdAt,
    daysValid,
    isActive: true,
    clientName,
    createdBy: createdBy || "desconhecido",
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
export const createCustomPin = async (customPin: string, daysValid: number, clientName: string, createdBy?: string): Promise<PinAccess> => {
  const expiryDate = calculateExpiryDate(daysValid);
  const createdAt = new Date().toISOString();
  
  const newPin: Omit<PinAccess, 'id'> = {
    pin: customPin,
    expiryDate,
    createdAt,
    daysValid,
    isActive: true,
    clientName,
    createdBy: createdBy || "desconhecido",
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

// Check whether a PIN code is already taken by a different record
const isPinCodeTaken = async (pinCode: string, excludeId?: string): Promise<boolean> => {
  const snapshot = await get(ref(database, 'pins'));
  if (!snapshot.exists()) return false;
  const data = snapshot.val();
  return Object.keys(data).some(
    (key) => key !== excludeId && data[key]?.pin === pinCode
  );
};

// Get a PIN record by its code
export const getPinByCode = async (pinCode: string): Promise<PinAccess | null> => {
  const snapshot = await get(ref(database, 'pins'));
  if (!snapshot.exists()) return null;
  const data = snapshot.val();
  const key = Object.keys(data).find((k) => data[k]?.pin === pinCode);
  if (!key) return null;
  return { id: key, ...data[key] };
};

// Client self-update: only name + PIN allowed
export const updatePinSelf = async (
  id: string,
  payload: { clientName?: string; pin?: string; avatar?: string }
): Promise<{ sessionId?: string }> => {
  const updates: Record<string, unknown> = {};
  let newSessionId: string | undefined;
  if (payload.clientName !== undefined) updates.clientName = payload.clientName.trim();
  if (payload.avatar !== undefined) updates.avatar = payload.avatar;
  if (payload.pin !== undefined) {
    const newPin = payload.pin.trim();
    if (newPin.length < 4) throw new Error("O PIN deve ter pelo menos 4 caracteres");
    if (await isPinCodeTaken(newPin, id)) throw new Error("Este PIN já está em uso");
    updates.pin = newPin;
    newSessionId = Date.now().toString() + Math.random().toString(36).slice(2, 11);
    updates.sessionId = newSessionId;
  }
  if (Object.keys(updates).length > 0) {
    await update(ref(database, `pins/${id}`), updates);
  }
  return { sessionId: newSessionId };
};

// Admin full update: name, pin, daysValid, isActive, expiryDate
export const updatePinAdmin = async (
  id: string,
  payload: {
    clientName?: string;
    pin?: string;
    daysValid?: number;
    isActive?: boolean;
    expiryDate?: string;
  }
): Promise<void> => {
  const updates: Record<string, unknown> = {};
  if (payload.clientName !== undefined) updates.clientName = payload.clientName.trim();
  if (payload.pin !== undefined) {
    const newPin = payload.pin.trim();
    if (newPin.length < 4) throw new Error("O PIN deve ter pelo menos 4 caracteres");
    if (await isPinCodeTaken(newPin, id)) throw new Error("Este PIN já está em uso");
    updates.pin = newPin;
  }
  if (payload.daysValid !== undefined) updates.daysValid = payload.daysValid;
  if (payload.isActive !== undefined) updates.isActive = payload.isActive;
  if (payload.expiryDate !== undefined) updates.expiryDate = payload.expiryDate;
  if (Object.keys(updates).length === 0) return;
  await update(ref(database, `pins/${id}`), updates);
};
