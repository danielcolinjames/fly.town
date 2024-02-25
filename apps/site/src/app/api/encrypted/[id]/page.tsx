// This page generates the token to prevent generating OG images with random parameters (`id`).
import { createHmac } from "node:crypto";

function getToken(id: string): string {
  const hmac = createHmac("sha256", "my_secret");
  hmac.update(JSON.stringify({ id: id }));
  const token = hmac.digest("hex");
  return token;
}

interface PageParams {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageParams) {
  // console.log(params)
  const { id } = params;
  const token = getToken(id);

  return (
    <div>
      <h1>Encrypted Open Graph Image.</h1>
      <p>Only /a, /b, /c with correct tokens are accessible:</p>
      <a
        href={`/api/encrypted?id=${id}&token=${token}`}
        target="_blank"
        rel="noreferrer"
      >
        <code>
          /api/encrypted?id={id}&token={token}
        </code>
      </a>
    </div>
  );
}
