# Gulf Business Newsletter Builder

A simple browser-based tool for creating Eloqua-ready newsletter HTML from selected GulfBusiness.com article links.

## How it works

1. Paste GulfBusiness.com article links into the text box.
2. Click **Generate newsletter**.
3. The app extracts each story slug.
4. It fetches article data from `https://backend.gulfbusiness.com/wp-json/wp/v2/posts?slug=...&_embed=1`.
5. It outputs Eloqua-ready HTML.

## Layout order

- Link 1 = lead story
- Links 2–3 = two-column block
- Link 4 = black feature block
- Links 5 onwards = lower two-column grid

## Deploy on Vercel

1. Push this folder to GitHub.
2. Import the repo in Vercel.
3. Deploy.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.
