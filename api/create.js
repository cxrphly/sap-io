import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

function generateSlug(length = 6) {
  return Math.random().toString(36).substring(2, 2 + length);
}

async function createUniqueSlug(url, expiresIn, attempts = 5) {
  for (let i = 0; i < attempts; i++) {
    const slug = generateSlug();

    const success = await redis.set(`link:${slug}`, url, {
      ex: expiresIn || 86400,
      nx: true,
    });

    if (success) return slug;
  }

  throw new Error("Não foi possível gerar slug único");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let { url, expiresIn } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL obrigatória" });
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    const slug = await createUniqueSlug(url, expiresIn);
    
    const shortUrl = `${req.headers.host}/${slug}`;
    
    res.status(200).json({ shortUrl });

  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ error: "Erro ao criar link" });
  }
}