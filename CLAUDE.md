# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server at localhost:5173
npm run build     # tsc -b && vite build
npm run lint      # eslint .
npm run preview   # preview production build locally
npm run deploy    # gh-pages -d dist  (pushes dist/ to GitHub Pages)
```

## Architecture

**What it is:** Fin is a serverless planning-poker / Fibonacci-estimation app. No backend — all game state is synchronized peer-to-peer over WebRTC using [PeerJS](https://peerjs.com/).

**WebRTC topology:** Star topology. One browser tab is the host; every other participant (joiner) opens a direct PeerJS `DataConnection` to the host's peer ID. The host is the single source of truth and broadcasts `STATE_SYNC` messages to all joiners after every state change. Joiners send commands (`JOIN`, `PICK_CARD`, `DESELECT_CARD`, `EMOTE`) to the host; they never talk to each other.

**Message protocol:** Defined in `src/types/index.ts`.
- `JoinerMessage` — joiner → host: `JOIN`, `PICK_CARD`, `DESELECT_CARD`, `EMOTE`
- `HostMessage` — host → joiner: `STATE_SYNC` (full `GameState` snapshot), `NAME_TAKEN`

**Game phases:** `lobby` → `estimating` → `revealed` (host-controlled). Card values are Fibonacci: `['0', '1', '2', '3', '5', '8', '13', '∞']`.

**State management:** No global state library. The host's `useHostPeer` hook keeps a `useRef<GameState>` as the synchronous source of truth and a parallel `useState` to trigger React re-renders. The joiner's `useJoinerPeer` hook stores whatever `STATE_SYNC` it last received.

**Routing:** No URL-based routes. A single `<App>` component reads the `?join=<peerId>` query param — if present it renders `JoinerApp`, otherwise `HostApp`. Navigation within each flow is managed by local `useState` screen variables. `BrowserRouter` is used with `basename` set to `BASE_URL` (stripped trailing slash) so deep-links work on GitHub Pages.

**Deployment target:** GitHub Pages at `/fin/`. `vite.config.ts` sets `base: '/fin/'` for builds and `base: '/'` for dev.

**UI stack:** MUI v7 with Emotion, dark theme defined in `src/theme.ts` (`#0F0F1A` background, `#6C63FF` primary, `#43D9B2` secondary, Inter font, 12px border-radius).

## Conventions

- **Indentation:** 4 spaces throughout.
- **Component pattern:** `const Foo = (props) => { ... }` arrow functions; `export default Foo` at the bottom of each file, never inline on the declaration.
- **Action buttons:** Always use `FinButton` (wraps MUI `Button` with `size="large"` default) for primary actions. Raw `<Button>` is used only for secondary/inline controls like "Copy link" or dialog cancel actions.
- **Layout wrappers:** `HostLayout` and `JoinerLayout` in `src/layouts/` provide the full-height flex column with `AppHeader`. Every host page wraps its content in `HostLayout`; every joiner page wraps in `JoinerLayout`.
- **Page organisation:** Pages live in `src/pages/host/` and `src/pages/joiner/`. Shared UI primitives live in `src/components/`.
- **Inline styles:** All styling is done via MUI `sx` prop — no CSS modules or separate style files.
- **TypeScript:** `satisfies` is used when sending messages to keep message objects type-safe without widening (`conn.send({ type: 'JOIN', name } satisfies JoinerMessage)`).
- **Icons:** `@mui/icons-material` with the `Rounded` variant preferred (e.g. `EastRoundedIcon`, `ContentCopyRoundedIcon`).
