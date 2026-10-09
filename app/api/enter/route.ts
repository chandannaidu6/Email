import { NextResponse } from "next/server";
import { storeEntry, StorageError } from "../../../lib/storage";
import { normalizeEmail } from "../../../lib/email";
import { checkToken } from "../../../lib/token";

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

  // The link is only valid when it carries a token minted by the study
  // app's completion page. Re-checked here (not just on page load) so a
  // request sent straight to this endpoint, bypassing the page, is
  // rejected the same way.
  const check = checkToken(typeof body.token === "string" ? body.token : null);
  if (!check.ok) {
    return NextResponse.json(
      { error: "This link is no longer valid. Please use the link from your completed study session." },
      { status: 403 },
    );
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
    // The storage endpoint ignores duplicate emails and rejects a token
    // it has already recorded, so entering twice (or reusing a shared
    // link) counts once.
    await storeEntry(email, check.payload);
  } catch (err) {
    if (err instanceof StorageError && err.code === "used") {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
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
