type Entry = { value: string; expiry?: number };
const store = new Map<string, { value: string; expiry?: number }>();

function getEntry(key: string): string | null {
  const entry = store.get(key);
  if (!entry) return null;

  if (entry.expiry && Date.now() > entry.expiry) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

function setEntry(key: string, value: string, expiry?: number) {
  store.set(key, { value, expiry });
}

export { getEntry, setEntry, store, type Entry };
