import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let { url, expiresIn } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL obrigatória" });
    }

    // 🔧 garante protocolo
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    const slug = Math.random().toString(36).substring(2, 8);

    await kv.set(`link:${slug}`, url, { ex: expiresIn || 86400 });

    const shortUrl = `${req.headers.origin}/s/${slug}`;

    res.status(200).json({ shortUrl });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar link" });
  }
}