import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_AGE_MS = 1000 * 60 * 60 * 72; // 72 hours

export type TokenCheck =
  | { ok: true; participantId: string; payload: string }
  | { ok: false; reason: "missing" | "unconfigured" | "malformed" | "signature" | "expired" };

// Verifies a token minted by the study app's api/raffle-token.js. Both
// deployments must share the same RAFFLE_LINK_SECRET, set only in each
// project's own Vercel environment variables -- never in either repo.
export function checkToken(token: string | null | undefined): TokenCheck {
  if (!token) return { ok: false, reason: "missing" };

  const secret = process.env.RAFFLE_LINK_SECRET;
  if (!secret) return { ok: false, reason: "unconfigured" };

  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "malformed" };
  const [payloadB64, signature] = parts;

  let payload: string;
  try {
    payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return { ok: false, reason: "malformed" };
  }

  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "signature" };
  }

  const dot = payload.lastIndexOf(".");
  if (dot === -1) return { ok: false, reason: "malformed" };
  const participantId = payload.slice(0, dot);
  const issuedAt = Number(payload.slice(dot + 1));
  if (!participantId || !Number.isFinite(issuedAt)) return { ok: false, reason: "malformed" };
  if (Date.now() - issuedAt > MAX_AGE_MS) return { ok: false, reason: "expired" };

  return { ok: true, participantId, payload };
}
