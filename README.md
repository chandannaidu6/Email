# CSU Code Review Study: Gift Card Drawing

A standalone page where participants can optionally enter a $100 gift card drawing after they finish the CSU code review study. It runs separately from the study app, with its own storage, so an email address can't be linked to anyone's study answers.

## What gets stored

- Only the email address (trimmed and lowercased) is sent to the configured storage endpoint.
- No name, IP address, user agent or timestamp is sent. Because entries carry no timestamps, they can't be matched to study submissions by when they happened.
- Entering twice counts once — the storage endpoint ignores an address it already has, and the API gives the same response either way, so nobody can use it to check whether an address was entered.

## Deploy to Vercel

1. Import this repo in Vercel. It's detected as Next.js, so no build settings are needed.
2. Set up a private storage endpoint that accepts `POST { secret, email }` and returns `{ ok: true }` on success (ignoring the request if it already has that email). Where that endpoint lives and what it writes to is outside this repo on purpose.
3. In **Settings → Environment Variables**, add:
   - `STORAGE_ENDPOINT` — the URL of that endpoint.
   - `STORAGE_SECRET` — a long random string that matches what the endpoint expects. Generate one with:
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
4. Redeploy so the new variables take effect.
5. Put the deployed URL in place of `[RAFFLE SURVEY LINK]` on the study's final page.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in STORAGE_ENDPOINT and STORAGE_SECRET
npm run dev
```
