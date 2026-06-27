import { Vibrant } from "node-vibrant/node";
import sharp from "sharp";

export async function getDarkDominantColor(imageUrl: string) {
  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    const buffer = await sharp(inputBuffer)
      .resize(200, 200, { fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer();

    const palette = await Vibrant.from(buffer).getPalette();

    return (
      palette.DarkVibrant?.hex ||
      palette.DarkMuted?.hex ||
      palette.Vibrant?.hex ||
      "#171717"
    );
  } catch (error) {
    console.error("Error in getDarkDominantColor:", { imageUrl, error });
    return "#171717";
  }
}
