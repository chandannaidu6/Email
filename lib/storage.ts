// Sends an entry to the private storage endpoint configured for this
// deployment. The endpoint stores only the email address, enforces that
// `entryKey` (the participant id, not the raw token -- a fresh token is
// minted on every completion-page load, but the participant id stays the
// same across those reloads) hasn't been used before, and ignores email
// addresses it already has.
export async function storeEntry(email: string, entryKey: string): Promise<void> {
  const endpoint = process.env.STORAGE_ENDPOINT;
  const secret = process.env.STORAGE_SECRET;
  if (!endpoint || !secret) {
    throw new Error("Storage is not configured (STORAGE_ENDPOINT / STORAGE_SECRET).");
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Field is still named "token" on the wire so the existing Apps
    // Script storage endpoint needs no changes -- it just treats this as
    // an opaque dedupe key, whatever the caller sends.
    body: JSON.stringify({ secret, email, token: entryKey }),
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
