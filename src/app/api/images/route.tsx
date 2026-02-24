// app/api/find/route.ts
import { NextResponse } from "next/server";
import { findItemUrlByName } from "@/lib/items";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const name = url.searchParams.get("name") || "";

    if (!name)
      return NextResponse.json({ error: "name required" }, { status: 400 });

    const matchUrl = await findItemUrlByName(name);
    // Devuelve *solo* la url (o null si no existe)
    return NextResponse.json(matchUrl);
  } catch (err) {
    console.error(err);
    return NextResponse.json(null, { status: 500 });
  }
}
