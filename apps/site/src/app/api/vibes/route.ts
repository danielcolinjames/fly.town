import Vibrant from "node-vibrant";

// Adjust the GET function to follow Next.js API route conventions
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("image");

  if (!imageUrl) {
    return new Response(JSON.stringify({ error: "Image URL not provided." }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const img = new Vibrant(imageUrl);
    const colors = await img.getPalette();
    return new Response(JSON.stringify(colors), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to process image." }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
