import { database } from "@/lib/firebase";
import { ref, update, get, push, set } from "firebase/database";

export interface DeviceSession {
  id: string;
  sessionId: string;
  userAgent: string;
  platform: string;
  deviceType: "mobile" | "tablet" | "desktop";
  createdAt: string;
  lastSeen: string;
}

const detectDeviceType = (ua: string): DeviceSession["deviceType"] => {
  const s = ua.toLowerCase();
  if (/ipad|tablet/.test(s)) return "tablet";
  if (/mobi|android|iphone/.test(s)) return "mobile";
  return "desktop";
};

const detectPlatform = (ua: string): string => {
  const s = ua.toLowerCase();
  if (s.includes("android")) return "Android";
  if (s.includes("iphone") || s.includes("ipad") || s.includes("ipod")) return "iOS";
  if (s.includes("mac")) return "macOS";
  if (s.includes("windows")) return "Windows";
  if (s.includes("linux")) return "Linux";
  return "Desconhecido";
};

// Register a device session under a PIN (keeps last 10)
export const registerDevice = async (
  pinId: string,
  sessionId: string
): Promise<void> => {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "unknown";
  const now = new Date().toISOString();
  const entry = {
    sessionId,
    userAgent: ua.slice(0, 250),
    platform: detectPlatform(ua),
    deviceType: detectDeviceType(ua),
    createdAt: now,
    lastSeen: now,
  };
  const sessionsRef = ref(database, `pins/${pinId}/devices`);
  const newRef = push(sessionsRef);
  await set(newRef, entry);

  // Trim to last 10
  const snap = await get(sessionsRef);
  if (snap.exists()) {
    const data = snap.val() as Record<string, DeviceSession>;
    const entries = Object.entries(data).sort(
      ([, a], [, b]) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (entries.length > 10) {
      const toDelete = entries.slice(10);
      const updates: Record<string, null> = {};
      toDelete.forEach(([k]) => { updates[`pins/${pinId}/devices/${k}`] = null; });
      await update(ref(database), updates);
    }
  }
};

export const touchDevice = async (pinId: string, sessionId: string): Promise<void> => {
  const sessionsRef = ref(database, `pins/${pinId}/devices`);
  const snap = await get(sessionsRef);
  if (!snap.exists()) return;
  const data = snap.val() as Record<string, DeviceSession>;
  const found = Object.entries(data).find(([, v]) => v.sessionId === sessionId);
  if (found) {
    await update(ref(database, `pins/${pinId}/devices/${found[0]}`), {
      lastSeen: new Date().toISOString(),
    });
  }
};

export const getDevices = async (pinId: string): Promise<DeviceSession[]> => {
  const snap = await get(ref(database, `pins/${pinId}/devices`));
  if (!snap.exists()) return [];
  const data = snap.val();
  return Object.keys(data)
    .map((k) => ({ id: k, ...data[k] } as DeviceSession))
    .sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());
};

// Revoke a single device entry (just removes the record; current session check elsewhere)
export const revokeDevice = async (pinId: string, deviceId: string): Promise<void> => {
  await update(ref(database, `pins/${pinId}/devices`), { [deviceId]: null });
};

// Encerrar todas as sessões: rotate sessionId so all devices get logged out on next poll
export const revokeAllSessions = async (pinId: string): Promise<string> => {
  const newSessionId = Date.now().toString() + Math.random().toString(36).slice(2, 11);
  await update(ref(database, `pins/${pinId}`), { sessionId: newSessionId, devices: null });
  return newSessionId;
};

// Find PIN id by pin code (lightweight)
export const findPinIdByCode = async (pinCode: string): Promise<string | null> => {
  const snap = await get(ref(database, "pins"));
  if (!snap.exists()) return null;
  const data = snap.val();
  const k = Object.keys(data).find((id) => data[id]?.pin === pinCode);
  return k || null;
};
