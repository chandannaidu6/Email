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
    // Keyed on participantId, not the raw token: the study app mints a
    // fresh, independently-valid token on every page load, so keying this
    // on the token itself would let a refreshed link be handed to someone
    // else, or reused by the same person with a different email, and
    // still succeed. Keying on participantId means the *first* successful
    // submission for that participant consumes it for good -- any token
    // minted afterwards for the same participant, no matter how many
    // times the page was refreshed, is rejected as already used.
    await storeEntry(email, check.participantId);
  } catch (err) {
    if (err instanceof StorageError && err.code === "used") {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    // Deliberately not logging the email -- the error's own message never
    // contains it (see storeEntry/StorageError), only the failure reason
    // (missing config, unreachable endpoint, non-ok response, etc.).
    console.error("raffle: failed to store entry:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Something went wrong on our end. Please try again in a moment." },
      { status: 500 },
    );
  }

  // Same response for new and duplicate entries, so the endpoint can't be
  // used to check whether someone else entered.
  return NextResponse.json({ ok: true });
}
