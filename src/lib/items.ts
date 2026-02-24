import path from "path";
import fs from "fs/promises";

const DATA_PATH = path.join(process.cwd(), "data", "items.json");

export type Item = { name: string; url: string };

export async function readItemsData(): Promise<Item[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(raw) as Item[];
  } catch (err) {
    // Silence error if file doesn't exist, as it's expected in some environments
    return [];
  }
}

export async function findItemUrlByName(name: string): Promise<string | null> {
  const trimmedName = (name || "").toLowerCase().trim();
  if (!trimmedName) return null;

  const items = await readItemsData();
  const match = items.find((it) => it.name.toLowerCase() === trimmedName);
  return match ? match.url : null;
}
