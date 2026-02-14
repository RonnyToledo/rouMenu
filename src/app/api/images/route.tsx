// app/api/find/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const DATA_PATH = path.join(process.cwd(), "data", "items.json");

type Item = { name: string; url: string };

async function readData(): Promise<Item[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(raw) as Item[];
  } catch (err) {
    console.error("Error reading data file:", err);
    return [];
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const name = (url.searchParams.get("name") || "").toLowerCase().trim();

    if (!name)
      return NextResponse.json({ error: "name required" }, { status: 400 });

    const items = await readData();
    const match = items.find((it) => it.name.toLowerCase() === name);
    // Devuelve *solo* la url (o null si no existe)
    return NextResponse.json(match ? match.url : null);
  } catch (err) {
    console.error(err);
    return NextResponse.json(null, { status: 500 });
  }
}
