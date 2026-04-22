# Ad Brain — Ad Distribution Manager

**Live demo:** [adbrain-seven.vercel.app](https://adbrain-seven.vercel.app)

Gebaut im Rahmen des **[smoothoperators.dev](https://smoothoperators.dev)** Building Events.

AI-powered Ad Distribution Manager: synct Kampagnen über Meta / TikTok / Google / Pinterest / Instagram, lässt Gemini analysieren was zu skalieren / fixen / killen ist, schreibt schwache Ads automatisch um und generiert pro Kampagne live ein Creative-Bild.

## Features

- **Live platform sync** — 5 fake OAuth-Verbindungen mit echten API-URLs, Rate-Limit-Bars, Token-Preview
- **Live API Console** — Terminal-style Log jeder Request an `graph.facebook.com`, `business-api.tiktok.com`, `googleads.googleapis.com`, `api.pinterest.com` und `generativelanguage.googleapis.com`
- **AI Insights** — Gemini scored jeden Ad (Scale / Fix / Kill / Opportunities)
- **Fix & Replace** — automatisches Rewriting schwacher Ads mit auto-generierten Creative-Bildern (Gemini 2.5 Flash Image)
- **Ad Detail + Rewrite Studio** — SSE-Streaming-Rewrite mit 3 tone-varied Variants, Score-Circles, Before/After Preview, One-Click Launch
- **Daily / Audience / Placement Tables** pro Ad
- **Copilot Chat** — grounded auf synced Ads
- **Demo Mode** — Auto-run-Walkthrough für 2-Minuten-Pitches

## Stack

- Next.js 15 (App Router) + React 19
- TypeScript + Tailwind
- Google Gemini API (Flash, Flash Image, SSE streaming)
- Alles mocked, keine DB, kein Auth

## Lokal laufen lassen

```bash
cp .env.example .env.local   # GEMINI_API_KEY eintragen
npm install
npm run dev
```

Port 3737 default (siehe package.json scripts).

## Pre-generate creative images

```bash
node scripts/generate-ad-images.mjs
```

Schreibt nach `public/ads/*.png`.
