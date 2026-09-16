# CloseBuy Frontend

The real, coded consumer site for CloseBuy — replaces the earlier concept-walkthrough
mockup with something wired to the actual live backend.

No build step, no framework: plain HTML/CSS/JS. It talks directly to the backend
in [`closebuy-backend`](https://github.com/xxAlmightyxx7/closebuy-backend), which is
already deployed at `https://closebuy-backend.onrender.com`.

## What it does

- Browses real stores and a real product catalog pulled live from `/stores` and `/products`.
- Category rail + horizontal product rails, DoorDash-style.
- Search a product → shows matching catalog items and the stores whose category would carry them.
- Store detail view → "Ask this store" sends a real request to `POST /request` (this
  logs the request and — only if the store has a phone number on file — texts them via Twilio).
- Floating chat widget → talks to the Claude-powered assistant at `POST /chat`.

## Running it locally

No dependencies. From this folder:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploying

This is static, so any static host works: GitHub Pages, Netlify, Vercel, Cloudflare Pages.
Nothing needs a server-side build.

If you ever move the backend off Render or onto a custom domain, update the one line in
`config.js`.

## Known limitations (Phase 1, by design)

- No real geolocation/distance — the "near you" framing is corridor-level, not GPS-based, matching
  where CloseBuy actually is in its validation phase.
- Most stores don't have a phone number on file yet (outreach hasn't started), so "Ask this store"
  logs the request but won't always trigger a real text — that's expected until store outreach fills
  in phone numbers in Supabase.
- Product-to-store matching is by category, not a real per-store inventory feed — CloseBuy is
  explicitly not an inventory system in Phase 1.
