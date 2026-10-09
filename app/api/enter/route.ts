import { NextResponse } from "next/server";
import { ENTRIES_KEY, getRedis } from "../../../lib/redis";
import { normalizeEmail } from "../../../lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real people never see or fill this field.
  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  if (body.completed !== true) {
    return NextResponse.json(
      { error: "Please confirm you completed the code review." },
      { status: 400 },
    );
  }

  const email = normalizeEmail(body.email);
  if (!email) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  try {
    // SADD is idempotent, so entering twice still counts once.
    await getRedis().sadd(ENTRIES_KEY, email);
  } catch {
    // Deliberately not logging the email.
    console.error("raffle: failed to store entry");
    return NextResponse.json(
      { error: "Something went wrong on our end. Please try again in a moment." },
      { status: 500 },
    );
  }

  // Same response for new and duplicate entries, so the endpoint can't be
  // used to check whether someone else entered.
  return NextResponse.json({ ok: true });
}
