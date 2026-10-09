import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { ENTRIES_KEY, getRedis } from "../../../../lib/redis";

export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || expected.length < 16) return false;
  const given = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const deny = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const noStore = { "Cache-Control": "no-store" };

// GET                -> CSV of every entry
// GET ?count=1       -> { count }
// GET ?draw=5        -> { winners: [...] }  (5 distinct random entries)
export async function GET(req: Request) {
  if (!authorized(req)) return deny();
  const redis = getRedis();
  const params = new URL(req.url).searchParams;

  if (params.has("count")) {
    return NextResponse.json({ count: await redis.scard(ENTRIES_KEY) }, { headers: noStore });
  }

  const draw = params.get("draw");
  if (draw) {
    const n = Math.max(1, Math.min(50, Number.parseInt(draw, 10) || 0));
    const winners = (await redis.srandmember<string[]>(ENTRIES_KEY, n)) ?? [];
    return NextResponse.json({ winners }, { headers: noStore });
  }

  const emails = ((await redis.smembers(ENTRIES_KEY)) as string[]).sort();
  const csv = ["email", ...emails].join("\n") + "\n";
  return new NextResponse(csv, {
    headers: {
      ...noStore,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="raffle-entries.csv"',
    },
  });
}

// DELETE -> permanently removes every entry (run after the drawing).
export async function DELETE(req: Request) {
  if (!authorized(req)) return deny();
  const removed = await getRedis().del(ENTRIES_KEY);
  return NextResponse.json({ deleted: removed === 1 }, { headers: noStore });
}
