# Cloudflare Deploy

This project is a Next.js App Router app deployed to Cloudflare Workers through OpenNext.

Use these Cloudflare build settings:

```txt
Build command:
npm run cf:build

Deploy command:
npx wrangler deploy
```

Do not use `npm run build` as the Cloudflare build command. That only runs `next build` and does not generate the `.open-next` Worker bundle required by Wrangler.

If your Cloudflare project supports only one command, use:

```txt
npm run deploy
```

That command runs the OpenNext build first and then deploys.
