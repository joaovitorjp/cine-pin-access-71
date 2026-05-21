import { database } from "@/lib/firebase";
import { ref, push, set, get, update, remove, onValue, off } from "firebase/database";

const PATH = "contentRequests";

export type RequestStatus = "received" | "in_review" | "added";

export interface ContentRequest {
  id: string;
  title: string;
  category: string;
  type: "movie" | "series" | "any";
  notes?: string;
  status: RequestStatus;
  requesterName?: string;
  createdAt: string;
  updatedAt: string;
}

export const STATUS_LABEL: Record<RequestStatus, string> = {
  received: "Recebido",
  in_review: "Em análise",
  added: "Adicionado ao catálogo",
};

export const createRequest = async (
  input: Omit<ContentRequest, "id" | "status" | "createdAt" | "updatedAt">
): Promise<ContentRequest> => {
  const now = new Date().toISOString();
  const newRef = push(ref(database, PATH));
  const data: Omit<ContentRequest, "id"> = {
    ...input,
    status: "received",
    createdAt: now,
    updatedAt: now,
  };
  await set(newRef, data);
  return { id: newRef.key as string, ...data };
};

export const getAllRequests = async (): Promise<ContentRequest[]> => {
  const snap = await get(ref(database, PATH));
  if (!snap.exists()) return [];
  const val = snap.val();
  return Object.keys(val).map((k) => ({ id: k, ...val[k] }));
};

export const subscribeRequests = (
  cb: (items: ContentRequest[]) => void
): (() => void) => {
  const r = ref(database, PATH);
  const handler = onValue(r, (snap) => {
    if (!snap.exists()) return cb([]);
    const val = snap.val();
    const list = Object.keys(val).map((k) => ({ id: k, ...val[k] })) as ContentRequest[];
    list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    cb(list);
  });
  return () => off(r, "value", handler);
};

export const updateRequestStatus = async (
  id: string,
  status: RequestStatus
): Promise<void> => {
  await update(ref(database, `${PATH}/${id}`), {
    status,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteRequest = async (id: string): Promise<void> => {
  await remove(ref(database, `${PATH}/${id}`));
};
