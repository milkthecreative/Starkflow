// src/starkzap.config.ts
// ─────────────────────────────────────────────────────────────────────────────
// StarkFlow: Core SDK bootstrap.
// Starkzap v2 gives us ONE unified SDK surface for wallets, gasless txs,
// staking, lending, DCA, swaps, and confidential transfers.
// ─────────────────────────────────────────────────────────────────────────────

import {
  StarkZap,
  OnboardStrategy,
  type WalletInterface,
  type StarkZapConfig,
} from "starkzap";

// ── Network config ────────────────────────────────────────────────────────────
// Toggle between "mainnet" | "sepolia" via env var.
// Vercel/Netlify: set VITE_NETWORK=mainnet for production.
const NETWORK = (import.meta.env.VITE_NETWORK as "mainnet" | "sepolia") ?? "sepolia";

// ── Privy config ──────────────────────────────────────────────────────────────
// Privy handles social/email/passkey login with embedded wallets.
// Users never see seed phrases — pure Web2 UX on Web3 rails.
export const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID as string;

// ── Starkzap SDK singleton ────────────────────────────────────────────────────
// One SDK instance for the whole app. All DeFi modules share the same
// wallet and tx builder, so a stake + lend + DCA can be batched atomically.
const sdkConfig: StarkZapConfig = {
  network: NETWORK,

  // AVNU Paymaster: sponsors all gas fees so users pay nothing.
  // This is the core UX unlock — zero friction from "Connect Wallet" to tx.
  paymaster: {
    provider: "avnu",
    // Optional: your AVNU API key for higher rate limits on mainnet
    apiKey: import.meta.env.VITE_AVNU_API_KEY,
  },

  // Privy for social login (Google, Apple, Discord, Email).
  // Cartridge is available as an alternative for gaming use-cases.
  wallet: {
    provider: "privy",
    privyAppId: PRIVY_APP_ID,
  },
};

export const sdk = new StarkZap(sdkConfig);

// ── Token references ──────────────────────────────────────────────────────────
// Starkzap exports canonical token configs for each network.
// Using these (vs raw addresses) gives type-safe Amount.parse() calls.
export { mainnetTokens, sepoliaTokens } from "starkzap";
export const tokens = NETWORK === "mainnet"
  ? (await import("starkzap")).mainnetTokens
  : (await import("starkzap")).sepoliaTokens;

export type { WalletInterface };
export { NETWORK };
