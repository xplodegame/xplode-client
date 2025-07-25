# 💥 Xplode Client — The On-Chain Battlefield Interface
<div align="center">

![Xplode Game](https://img.shields.io/badge/Game-Xplode-blue?style=for-the-badge)
![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)
![Solana](https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

[🎮 Play Now](https://playxplode.xyz) | [🐦 Follow Us](https://x.com/xplode_game)

</div>

> “No house. No mercy. Just mind games.”  
> — Welcome to **Xplode**, the most strategic onchain PvP game you’ll ever play.
---

## 🎮 What is Xplode?

[Xplode](https://playxplode.xyz) is a real-time, on-chain PvP strategy game inspired by **Minesweeper**, reimagined as a **high-stakes, grid-based battle royale**. Every move is public. Every decision counts. No gas. No house edge. Just pure outplay.

### Why it’s 🔥:
- ⚡ **Built on [Solana](https://solana.com)** – ultra-fast, ultra-cheap  
- 🔗 **Fully On-Chain** – turns, locks, wins, all recorded on-chain  
- 🎯 **Zero House Edge** – it’s player vs player, winner takes all  
- 🚀 **Live Now** – [playxplode.xyz](https://playxplode.xyz)  

---

## 🚀 See It in Action: Blazing-Fast On-Chain Gameplay
<div align="center">
  <video src="https://github.com/user-attachments/assets/a7422acc-77e1-43f4-b99e-f58c62d5ead0" autoplay muted controls width="700">
    Your browser does not support the video tag.
  </video>
</div>

---

## 🕹️ Core Gameplay Features

> Think you’re just revealing tiles? Think again.

- 💎 **Strategic Grid Battles** – Reveal diamonds, avoid bombs.  
- ⏱️ **Blazing Turn Timers** – 30s move phase · 5s lock phase.  
- 🔒 **Locking System** – Block your opponent’s plays (2 locks per player).  
- 🧠 **Mind Over Luck** – Outsmart, don’t just outguess.  
- 🎭 **NFT-Based Taunts** – Use on-chain emotes to flex mid-game.  
- 👥 **Custom Lobbies** – Invite your friends or battle randoms.  

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

