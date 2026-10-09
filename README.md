# CSU Code Review Study: Gift Card Drawing

A standalone page where participants can optionally enter a $100 gift card drawing after they finish the CSU code review study. It runs separately from the study app, with its own storage, so an email address can't be linked to anyone's study answers.

## What gets stored

- Only the email address (trimmed and lowercased), kept in a single Redis set (`raffle:entries`).
- No name, IP address, user agent or timestamp. Because entries have no timestamps, they can't be matched to study submissions by time.
- Entering twice counts once. The API gives the same response either way, so nobody can use it to check whether an address was entered.

## Deploy to Vercel

1. Import this repo in Vercel. It's detected as Next.js, so no build settings are needed.
2. In the project, open **Storage → Create / Connect Database → Upstash for Redis** (the free tier is enough) and connect it to the project. This adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.
3. In **Settings → Environment Variables**, add `ADMIN_TOKEN`: a long random string, at least 16 characters. One way to generate it:
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
4. Redeploy so the new variables take effect.
5. Put the deployed URL in place of `[RAFFLE SURVEY LINK]` on the study's final page.

## Running the drawing (admin)

Replace `$URL` with the deployed URL and `$TOKEN` with your `ADMIN_TOKEN`.

```bash
# How many entries so far
curl -H "Authorization: Bearer $TOKEN" "$URL/api/admin/entries?count=1"

# Draw 5 distinct random winners
curl -H "Authorization: Bearer $TOKEN" "$URL/api/admin/entries?draw=5"

# Download every entry as CSV
curl -H "Authorization: Bearer $TOKEN" "$URL/api/admin/entries" -o entries.csv

# After winners have been notified: permanently delete all entries
curl -X DELETE -H "Authorization: Bearer $TOKEN" "$URL/api/admin/entries"
```

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the Redis URL/token and ADMIN_TOKEN
npm run dev
```
