# 💣 Xplode Frontend — Minesweeper Meets Battle Royale

> "No house. No mercy. Just mind games."  
> — Welcome to **Xplode**, the most strategic onchain PvP game you’ll ever play.

---

## 🎮 What Is Xplode?

[Xplode](https://playxplode.xyz) is a real-time, multiplayer blockchain game inspired by **Minesweeper**, reimagined as a high-speed, **PvP battle royale** — with **zero house edge**, no gas fees, and all action on-chain. You’ll uncover diamonds, dodge bombs, lock down territory, and outsmart your opponents in a cosmic arena of pure mind games.

✅ **Built on [Solana](https://solana.com)** — lightning fast, low fees  
✅ **Fully on-chain**: matchmaking, turns, outcomes — everything  
✅ **Zero gas** experience  
✅ **Live now**: [https://playxplode.xyz](https://playxplode.xyz)

---

## 🚀 Gameplay Overview

> Think you’re just revealing tiles? Think again.

- **🧠 Strategic Grid Battles**: Reveal hidden diamonds, avoid bombs.
- **⏱️ Fast-Paced Turns**: 30s move timer, 5s lock phase — make decisions fast.
- **🔒 Lock System**: Block your opponents' cells with limited locks (2 per game).
- **🪙 Real Stakes**: No house. Player vs player. Winner takes the pot.
- **🕹️ Custom Lobbies**: Invite your friends and battle it out.
- **😈 NFT Emotes**: Taunt your rivals mid-game with chain-native flair.

---

## ✨ Built With

This is the **official frontend** of Xplode. It runs the entire player-facing experience.

### Tech Stack

| Area | Stack |
|------|-------|
| Frontend | React, TypeScript, TailwindCSS |
| Game Logic | WebSockets, custom state engine |
| Blockchain | Solana, Rust smart contracts (Anchor framework) |
| UI/UX | Particle effects, sound cues, cosmic theme |

---

## 🧠 Key Components

| File | Purpose |
|------|---------|
| `MultiplayerGame.tsx` | Game state, socket handling, main logic |
| `GameBoard.tsx` | Grid UI, cell clicks, animations |
| `LobbyDetails.tsx` | Pre-game lobby + matchmaking |
| `EnhancedTurnIndicator.tsx` | Shows whose turn it is + timers |
| `hooks/` | Game logic, timers, refs |
| `lib/` | WebSocket types, state helpers |

---

## 🛠️ Local Development

```bash
# Clone the repo
git clone https://github.com/xplodegame/xplode-client.git
cd xplode-client

# Install dependencies
npm install

# Start local dev server
npm run dev
```

## 🧬 State & Timing Logic

- **Game States**: `WAITING`, `RUNNING`, `FINISHED`, `ABORTED`
- **Timers**:
  - `30s` move phase
  - `5s` lock phase
- **Locks per player**: `2` total
- **Backend**: WebSocket server using JSON-based `GameUpdate` protocol

---

## 🌐 Live Now

- 🔗 [https://playxplode.xyz](https://playxplode.xyz)
- 💬 Join our Discord [Discord](https://discord.gg/VhsZ5P79BS)
- 📸 Follow us on [Twitter/X](https://twitter.com/xplode_game)

---

## 🙌 Contributing

We’re building the **most ruthless grid game in Web3** — and we’d love your help.

- 💡 Feature ideas? File an issue.  
- 🐞 Found a bug? Drop a PR.  
- 🧠 Want to build an AI bot, analytics layer, or skin system? Let’s talk.

> We believe the future of gaming is PvP-first, trustless, and transparent.  
> Let’s build it together.

---

## 🔐 License

MIT — but please don’t just fork it and launch a rug.

---

## 👨‍🚀 Built With Intention

> One public contribution I’m most proud of is **Xplode** — a fully onchain multiplayer game that reimagines gambling by removing the house and letting players out-strategize each other in real time.

It was born from frustration with house-edge games like Stake’s “Mines.”  
We stripped out the house, made it multiplayer, and introduced **cell-locking** for a pure test of mind.  
Everything is on-chain: fast, transparent, fair — and fun.

---

> 💣 **Ready to Xplode?** The grid awaits.  
> 🕹️ [Play Now](https://playxplode.xyz)

