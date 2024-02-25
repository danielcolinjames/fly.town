import { ImageResponse } from "next/og";
// App router includes @vercel/og.
// No need to install it.

export const runtime = "edge";

const key = crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode("my_secret"),
  { name: "HMAC", hash: { name: "SHA-256" } },
  false,
  ["sign"],
);

function toHex(arrayBuffer: ArrayBuffer) {
  return Array.prototype.map
    .call(new Uint8Array(arrayBuffer), (n) => n.toString(16).padStart(2, "0"))
    .join("");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const id = searchParams.get("id");
  const token = searchParams.get("token");

  const verifyToken = toHex(
    await crypto.subtle.sign(
      "HMAC",
      await key,
      new TextEncoder().encode(JSON.stringify({ id })),
    ),
  );

  if (token !== verifyToken) {
    return new Response("Invalid token.", { status: 401 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          fontSize: 40,
          color: "black",
          background: "white",
          width: "100%",
          height: "100%",
          padding: "50px 200px",
          textAlign: "center",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1>Card generated, id={id}.</h1>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
