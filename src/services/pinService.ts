
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
export const createPin = async (daysValid: number): Promise<PinAccess> => {
  const pin = generatePin();
  const expiryDate = calculateExpiryDate(daysValid);
  const createdAt = new Date().toISOString();
  
  const newPin: Omit<PinAccess, 'id'> = {
    pin,
    expiryDate,
    createdAt,
    daysValid,
    isActive: true
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
export const createCustomPin = async (customPin: string, daysValid: number): Promise<PinAccess> => {
  const expiryDate = calculateExpiryDate(daysValid);
  const createdAt = new Date().toISOString();
  
  const newPin: Omit<PinAccess, 'id'> = {
    pin: customPin,
    expiryDate,
    createdAt,
    daysValid,
    isActive: true
  };
  
  const pinsRef = ref(database, 'pins');
  const newPinRef = push(pinsRef);
  
  await set(newPinRef, newPin);
  
  return {
    id: newPinRef.key as string,
    ...newPin
  };
};

// Validate a PIN
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
        return matchedPin;
      }
    }
  }
  
  return null;
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
