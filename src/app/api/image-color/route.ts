// app/api/image-color/route.ts
import { NextResponse } from "next/server";
import { getDarkDominantColor } from "@/lib/get-dark-dominant-color";

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 },
      );
    }

    const darkColor = await getDarkDominantColor(imageUrl);

    return NextResponse.json({ darkColor });
  } catch (error) {
    console.error("Error extracting color:", error);
    return NextResponse.json(
      { error: "Could not extract color" },
      { status: 500 },
    );
  }
}
