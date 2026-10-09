import { Redis } from "@upstash/redis";

// Entries live in a single Redis SET: just the email string, nothing else.
// No timestamps, IPs or user agents are stored, so an entry can't be
// correlated with the time a study response was submitted.
export const ENTRIES_KEY = "raffle:entries";

let client: Redis | null = null;

export function getRedis(): Redis {
  if (client) return client;
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Redis is not configured (KV_REST_API_URL / KV_REST_API_TOKEN).");
  }
  client = new Redis({ url, token });
  return client;
}
