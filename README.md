# Neptun Website

The website of the neptun-tool. View status [here](https://pfn4gnjb.status.cron-job.org).

## Info

Built with [Nuxt 3](https://nuxt.com/docs/getting-started/introduction), [Nitro](https://nitro.unjs.io), [Vite](https://vitejs.dev) and [Vue 3](https://vuejs.org).

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm run dev
```

### Known Issues

- Doesn't work in `bun@1.1.30`.
- Extremely slow on `Windows11` (faster in WSL (might be better in nuxt@v4, which is currently in nightly-channel)).
- `srcDir` causes some imports and types to break... (could improve performance on windows theoretically)

## Production

```bash
pnpm run build
```

Locally preview production build:

```bash
pnpm run preview
```
