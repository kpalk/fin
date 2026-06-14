# Fin

A serverless Fibonacci planning poker app. No backend — all game state is synced peer-to-peer over WebRTC via [PeerJS](https://peerjs.com/).

## How it works

One browser tab acts as the host; everyone else joins via QR code or link. The host is the single source of truth and broadcasts state to all participants. No server, no database — it all runs in the browser.

Card values: `0 1 2 3 5 8 13 ∞`

Features:
- Quick estimations without setup hassle
- Disagreements? Re-estimate with a selection of cards

## Run

```bash
npm install
npm run dev # dev server at localhost:5173
```

## Stack

- **React 19** + **TypeScript**
- **MUI v7** (dark theme, Inter font)
- **PeerJS** for WebRTC data connections
- **Vite** for build tooling
- Deployed to **GitHub Pages** at `/fin/`

## Project structure

```
src/
  components/     # Shared UI primitives (EstimationCard, FinButton, AnimatedDots, …)
  hooks/          # useHostPeer, useJoinerPeer — all WebRTC logic
  layouts/        # HostLayout, JoinerLayout, AppHeader
  pages/
    host/         # HostCardConfig, HostLobby, HostEstimation
    joiner/       # JoinerEntry, JoinerWaiting, JoinerCards
  types/          # Message protocol + shared types
  theme.ts        # MUI theme
  App.tsx         # Entry point — reads ?join= param to route host vs joiner
```

## Deployment

Every push to main will build and deploy automatically.
