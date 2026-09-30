# AI Carousel Engine v4

A domain-neutral AI content engine inspired by the uploaded carousel reference architecture.

## What is included

- Daily Radar for 5 AI content opportunities
- Live AI/web research endpoint
- Live AI carousel generation
- AI idea rewriting
- Instagram 4:5, 1:1, 9:16 and 16:9 output formats
- Editable carousel studio
- Visual and motion directions
- Archive in browser storage
- Course Builder
- Web article/caption/hashtag generation
- PNG/ZIP export
- Server-side API key handling

## Run locally

1. Install Node.js 20+.
2. Copy `.env.example` to `.env`.
3. Put your model API key in `.env`.
4. Run:
   `npm install`
   `npm start`
5. Open:
   `http://localhost:8787`

The browser never contains the API key.

## Important

This package is a working full-stack starter, not a hosted SaaS deployment. The live research and generation require a configured API key and internet access from the server.

The uploaded reference file was used as a functional inspiration for the workflow: carousel creation, archive, course compilation, web content, sketches/visual prompts and motion concepts. Its CINMAA/filmmaking identity was intentionally removed.
