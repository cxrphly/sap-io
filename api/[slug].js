import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  const { slug } = req.query;

  try {
    const url = await redis.get(`link:${slug}`);

    if (!url) {
      return res.redirect('/?error=expired');
    }

    res.writeHead(302, { Location: url });
    res.end();
  } catch (err) {
    console.error("REDIRECT ERROR:", err);
    return res.redirect('/?error=server');
  }
}