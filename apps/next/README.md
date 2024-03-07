This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, link the package to the Vercel project:

```bash
npx vercel@latest link
```

You should select `Sanity` as the scope, and `visual-editing-next` as the project:

```bash
npx vercel@latest link
Need to install the following packages:
vercel@33.5.4
Ok to proceed? (y) y
Vercel CLI 33.5.4
? Set up “~/Developer/GitHub/visual-editing/apps/next”? [Y/n] y
? Which scope should contain your project? Sanity
? Link to existing project? [y/N] y
? What’s the name of your existing project? visual-editing-next
✅  Linked to sanity-io/visual-editing-next (created .vercel)
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
