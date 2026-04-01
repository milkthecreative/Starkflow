# StarkFlow ⚡
### Gasless · Private · Always Earning — Your DeFi savings dashboard on Starknet

> Built with [Starkzap v2](https://starkzap.io) — the TypeScript SDK that collapses DeFi integration from months to minutes.

**Live Demo**: [starkflow.netlify.app](https://starkflow.netlify.app)  
**Network**: Starknet Mainnet + Sepolia Testnet  
**Submission**: Starkzap Developer Bounty (April 2026) · $3,000 prize pool

---

## What is StarkFlow?

StarkFlow is a **gasless DeFi savings dashboard** that lets any user — with just a Google account — start earning yield on Starknet in under 60 seconds.

No seed phrases. No gas management. No complexity.

Under the hood, StarkFlow uses **4 Starkzap v2 DeFi modules** in one unified interface:

| Feature | Module | APY / Benefit |
|---|---|---|
| **Native BTC Staking** | `wallet.stake(StakingPool.BTC)` | ~5.2% APY |
| **STRK Staking** | `wallet.stake(StakingPool.STRK)` | ~8.7% APY |
| **USDC Lending** | `wallet.vesu.supply()` | ~6.1% APY |
| **Automated DCA** | `wallet.dca.create()` | Cost averaging |
| **Private Transfers** | `wallet.confidential.send()` | ZK shielded |

All transactions are **gasless** via AVNU Paymaster — users never touch gas.

---

## Quick Start

### Prerequisites
- Node.js 18+
- A [Privy](https://privy.io) account (free) — for social login
- An AVNU API key (optional for testnet, required for mainnet high volume)

### 1. Clone & Install

```bash
git clone https://github.com/yourname/starkflow
cd starkflow
npm install
```

### 2. Environment Variables

Create `.env.local`:

```bash
# Required
VITE_PRIVY_APP_ID=clxxxxxxxxxxxxxxxx   # Get from privy.io/dashboard
VITE_NETWORK=sepolia                    # "sepolia" | "mainnet"

# Optional — for higher AVNU Paymaster rate limits on mainnet
VITE_AVNU_API_KEY=your_avnu_key
```

### 3. Run Locally

```bash
npm run dev
# Open http://localhost:5173
```

### 4. Deploy to Netlify (1 command)

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

Or click: [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourname/starkflow)

### 5. Deploy to Vercel

```bash
vercel --prod
# Set env vars in Vercel dashboard
```

---

## Architecture

```
StarkFlow
├── Privy                    → Social/email login, embedded wallets
│   └── OnboardStrategy.Privy → No seed phrases, biometric support
├── AVNU Paymaster           → Sponsors all gas fees (users pay $0)
├── Starkzap SDK v2          → Unified DeFi interface
│   ├── wallet.stake()       → Native BTC & STRK staking pools
│   ├── wallet.vesu.*        → Vesu money market (supply/borrow)
│   ├── wallet.dca.*         → AVNU recurring swap scheduler
│   └── wallet.confidential.*→ Tongo Cash ZK private transfers
└── Starknet                 → ZK-rollup execution layer (~5s finality)
```

### Key Starkzap API Calls

```typescript
// 1. Social login — no seed phrases, pure Web2 UX
const { wallet } = await sdk.onboard({
  strategy: OnboardStrategy.Privy,
  deploy:   "if_needed",  // auto-deploys Starknet account on first use
});

// 2. Gasless BTC staking (AVNU Paymaster covers gas automatically)
const tx = await wallet.stake(StakingPool.BTC, {
  amount: Amount.parse("0.05", tokens.WBTC),
});
await tx.wait();

// 3. Vesu lending — batches approve + supply into ONE user signature
const tx = await wallet.vesu.supply({
  token:  tokens.USDC,
  amount: Amount.parse("1000", tokens.USDC),
});

// 4. DCA schedule — on-chain contract executes recurring AVNU swaps
const tx = await wallet.dca.create({
  sell: { token: tokens.USDC, amount: Amount.parse("20", tokens.USDC) },
  buy:  { token: tokens.STRK },
  frequency: DCAFrequency.Weekly,
});

// 5. Private transfer via Tongo ZK — amount + recipient hidden on-chain
const tx = await wallet.confidential.send({
  to:     fromAddress("0xRECIPIENT"),
  token:  tokens.STRK,
  amount: Amount.parse("100", tokens.STRK),
});
```

---

## Why These 4 Modules?

| Integration | Why Chosen |
|---|---|
| **Native Staking** | Highest trust, native Starknet, competitive APY, flexible exit |
| **Vesu Lending** | Best-in-class Starknet money market, audited, algorithmic rates |
| **AVNU DCA** | Best price aggregation (multi-DEX routing), gasless execution |
| **Tongo Confidential** | Only ZK private transfer on Starknet — unique UX differentiator |

Together they form a **complete savings lifecycle**: earn (stake) → multiply (lend) → accumulate (DCA) → spend privately (Tongo).

---

## Monetization Strategy

StarkFlow can generate revenue via three streams:

### 1. Performance Fee (0.5% of yield)
Charge a small performance fee on staking/lending rewards. $8,760 TVL at 6.8% blended APY = $596/yr in yield → ~$3/yr from this user. At 1,000 users = $3,000/yr minimum, scales linearly.

### 2. Referral Yield from AVNU
AVNU has a referral program for aggregator integrations. StarkFlow can capture a share of swap fees from DCA executions without charging users.

### 3. Premium Features ($5/month)
Gated features: unlimited DCA schedules, advanced privacy (batch Tongo shielding), portfolio analytics, tax reports.

### 4. B2B White-Label
Package StarkFlow as an embeddable DeFi widget for wallets, exchanges, or fintech apps — license the integration.

---

## Starknet Foundation Grant Application

StarkFlow qualifies for multiple Starknet Foundation grant tracks:

**Seed Grant (up to $25K STRK)**
- Consumer DeFi app with measurable onboarding improvement
- Demonstrates Web2→Web3 UX: social login, gasless, no seed phrases
- 4 DeFi protocol integrations (staking, Vesu, AVNU, Tongo)

**Propulsion Grant (gas reimbursement)**
- All user transactions are gasless — high potential gas usage at scale
- Apply for reimbursement as TVL grows

**Key metrics to track for grant application:**
- Daily Active Users (DAU)
- Total Value Locked (TVL)
- # gasless transactions submitted
- User retention (week-1, week-4)

---

## Tech Stack

| Layer | Technology |
|---|---|
| DeFi SDK | Starkzap v2 |
| Wallet/Auth | Privy (social login + embedded wallets) |
| Gas | AVNU Paymaster (sponsored) |
| Lending | Vesu Money Market |
| Swaps/DCA | AVNU Aggregator |
| Privacy | Tongo Cash (ZK shielded) |
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + custom design system |
| Deployment | Netlify / Vercel |
| Network | Starknet Mainnet + Sepolia |

---

## Bounty Submission Checklist

- [x] Built with Starkzap v2 (all 4 DeFi modules)
- [x] Social login via Privy (zero seed phrases)
- [x] Gasless transactions (AVNU Paymaster)
- [x] Native staking (BTC + STRK)
- [x] Vesu lending integration
- [x] Automated DCA
- [x] Tongo confidential transfers
- [x] TypeScript + React (type-safe throughout)
- [x] Deployable in one command
- [x] Live on testnet

---

## License

MIT — fork it, ship it, build on it.

---

*Built for the [Starkzap Developer Bounty](https://github.com/keep-starknet-strange/starkzap) · April 2026*
