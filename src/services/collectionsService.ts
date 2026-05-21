import { database } from "@/lib/firebase";
import { ref, push, set, get, update, remove, onValue, off } from "firebase/database";

const PATH = "editorCollections";

export interface CollectionItem {
  id: string;
  type: "movie" | "series";
}

export interface EditorCollection {
  id: string;
  title: string;
  description?: string;
  bannerUrl?: string;
  coverUrl?: string;
  featured: boolean;
  items: CollectionItem[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export const createCollection = async (
  input: Omit<EditorCollection, "id" | "createdAt" | "updatedAt">
): Promise<EditorCollection> => {
  const now = new Date().toISOString();
  const newRef = push(ref(database, PATH));
  const data = { ...input, createdAt: now, updatedAt: now };
  await set(newRef, data);
  return { id: newRef.key as string, ...data };
};

export const updateCollection = async (
  id: string,
  patch: Partial<EditorCollection>
): Promise<void> => {
  await update(ref(database, `${PATH}/${id}`), {
    ...patch,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteCollection = async (id: string): Promise<void> => {
  await remove(ref(database, `${PATH}/${id}`));
};

export const getAllCollections = async (): Promise<EditorCollection[]> => {
  const snap = await get(ref(database, PATH));
  if (!snap.exists()) return [];
  const val = snap.val();
  return Object.keys(val).map((k) => ({
    id: k,
    items: [],
    featured: false,
    order: 0,
    title: "",
    createdAt: "",
    updatedAt: "",
    ...val[k],
  })) as EditorCollection[];
};

export const subscribeCollections = (
  cb: (items: EditorCollection[]) => void
): (() => void) => {
  const r = ref(database, PATH);
  const handler = onValue(r, (snap) => {
    if (!snap.exists()) return cb([]);
    const val = snap.val();
    const list = Object.keys(val).map((k) => ({
      id: k,
      items: [] as CollectionItem[],
      featured: false,
      order: 0,
      title: "",
      createdAt: "",
      updatedAt: "",
      ...val[k],
    })) as EditorCollection[];
    list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    cb(list);
  });
  return () => off(r, "value", handler);
};
