// Sends an entry to the private storage endpoint configured for this
// deployment. The endpoint stores only the email address, enforces that
// `token` hasn't been used before (one entry per completed study session),
// and ignores email addresses it already has.
export async function storeEntry(email: string, token: string): Promise<void> {
  const endpoint = process.env.STORAGE_ENDPOINT;
  const secret = process.env.STORAGE_SECRET;
  if (!endpoint || !secret) {
    throw new Error("Storage is not configured (STORAGE_ENDPOINT / STORAGE_SECRET).");
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, email, token }),
    redirect: "follow",
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!res.ok || !data?.ok) {
    if (data?.error === "used") {
      throw new StorageError("used", "This drawing link has already been used.");
    }
    throw new StorageError("rejected", `Storage rejected the entry (HTTP ${res.status}).`);
  }
}

export class StorageError extends Error {
  constructor(
    public code: "used" | "rejected",
    message: string,
  ) {
    super(message);
    this.name = "StorageError";
  }
}
