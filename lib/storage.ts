// Sends an entry to the private storage endpoint configured for this
// deployment. The endpoint stores only the email address and ignores
// addresses it already has.
export async function storeEntry(email: string): Promise<void> {
  const endpoint = process.env.STORAGE_ENDPOINT;
  const secret = process.env.STORAGE_SECRET;
  if (!endpoint || !secret) {
    throw new Error("Storage is not configured (STORAGE_ENDPOINT / STORAGE_SECRET).");
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, email }),
    redirect: "follow",
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
  if (!res.ok || !data?.ok) {
    throw new Error(`Storage rejected the entry (HTTP ${res.status}).`);
  }
}
