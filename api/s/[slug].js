import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  const { slug } = req.query;

  const url = await kv.get(`link:${slug}`);

  if (!url) {
    return res.status(404).send("Link expirado 🌿");
  }

  res.writeHead(302, { Location: url });
  res.end();
}