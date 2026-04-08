// src/hooks/useStarkFlow.ts
// ─────────────────────────────────────────────────────────────────────────────
// All DeFi operations in one hook. Each function returns the tx receipt so
// callers can show confirmations. Error handling is centralised here.
//
// Starkzap v2 API surface used:
//   wallet.stake()            → native BTC / STRK staking
//   wallet.unstake()          → exit staking position
//   wallet.claimStakingRewards()
//   wallet.vesu.supply()      → Vesu lending (earn yield)
//   wallet.vesu.borrow()      → Vesu borrow
//   wallet.vesu.repay()
//   wallet.vesu.withdraw()
//   wallet.dca.create()       → AVNU recurring swap
//   wallet.dca.cancel()
//   wallet.confidential.send()→ Tongo Cash ZK private transfer
//   wallet.transfer()         → standard ERC-20 transfer
//   wallet.balanceOf()        → token balance
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import {
  Amount,
  fromAddress,
  StakingPool,
  DCAFrequency,
  type TxReceipt,
} from "starkzap";
import { useWallet } from "../context/WalletContext";
import { tokens } from "../starkzap.config";

// ── Generic tx wrapper ────────────────────────────────────────────────────────
// Wraps any Starkzap tx in loading/error state so UI stays clean.
function useTx() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const exec = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        return await fn();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Transaction failed";
        setError(msg);
        console.error("[StarkFlow] TX error:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, error, exec };
}

// ══════════════════════════════════════════════════════════════════════════════
// STAKING
// Native staking via Starkzap — BTC earns ~5% APY, STRK earns ~8.7% APY.
// All rewards auto-compound unless claimed manually.
// ══════════════════════════════════════════════════════════════════════════════

export function useStaking() {
  const { wallet } = useWallet();
  const { loading, error, exec } = useTx();

  /** Stake BTC. amount is a human-readable string e.g. "0.05" */
  const stakeBTC = async (amount: string): Promise<TxReceipt | null> =>
    exec(async () => {
      if (!wallet) throw new Error("Wallet not connected");
      // Amount.parse converts "0.05" to the correct 8-decimal bigint
      // StakingPool.BTC targets the native BTC staking pool on Starknet
      const tx = await wallet.stake(StakingPool.BTC, {
        amount: Amount.parse(amount, tokens.WBTC),
      });
      return tx.wait(); // resolves when tx is confirmed on-chain
    });

  /** Stake STRK. amount is a human-readable string e.g. "100" */
  const stakeSTRK = async (amount: string): Promise<TxReceipt | null> =>
    exec(async () => {
      if (!wallet) throw new Error("Wallet not connected");
      const tx = await wallet.stake(StakingPool.STRK, {
        amount: Amount.parse(amount, tokens.STRK),
      });
      return tx.wait();
    });

  const claimRewards = async (): Promise<TxReceipt | null> =>
    exec(async () => {
      if (!wallet) throw new Error("Wallet not connected");
      const tx = await wallet.claimStakingRewards();
      return tx.wait();
    });

  const getPositions = useCallback(async () => {
    if (!wallet) return [];
    return wallet.getStakingPositions(); // returns [{ pool, stakedAmount, pendingRewards, apy }]
  }, [wallet]);

  return { stakeBTC, stakeSTRK, claimRewards, getPositions, loading, error };
}

// ══════════════════════════════════════════════════════════════════════════════
// VESU LENDING
// Vesu is a Starknet-native money market. Supply assets to earn yield,
// or borrow against collateral. Rates are algorithmic (utilization-based).
// ══════════════════════════════════════════════════════════════════════════════

export function useLending() {
  const { wallet } = useWallet();
  const { loading, error, exec } = useTx();

  /** Supply USDC to Vesu to earn ~6% APY */
  const supplyUSDC = async (amount: string): Promise<TxReceipt | null> =>
    exec(async () => {
      if (!wallet) throw new Error("Wallet not connected");
      // Starkzap batches the ERC-20 approve + Vesu supply in one user tx
      const tx = await wallet.vesu.supply({
        token:  tokens.USDC,
        amount: Amount.parse(amount, tokens.USDC),
      });
      return tx.wait();
    });

  /** Borrow from Vesu against existing collateral */
  const borrow = async (
    token: keyof typeof tokens,
    amount: string
  ): Promise<TxReceipt | null> =>
    exec(async () => {
      if (!wallet) throw new Error("Wallet not connected");
      const tx = await wallet.vesu.borrow({
        token:  tokens[token],
        amount: Amount.parse(amount, tokens[token]),
      });
      return tx.wait();
    });

  /** Repay a borrow position */
  const repay = async (
    token: keyof typeof tokens,
    amount: string
  ): Promise<TxReceipt | null> =>
    exec(async () => {
      if (!wallet) throw new Error("Wallet not connected");
      const tx = await wallet.vesu.repay({
        token:  tokens[token],
        amount: Amount.parse(amount, tokens[token]),
      });
      return tx.wait();
    });

  /** Withdraw supplied assets */
  const withdraw = async (
    token: keyof typeof tokens,
    amount: string
  ): Promise<TxReceipt | null> =>
    exec(async () => {
      if (!wallet) throw new Error("Wallet not connected");
      const tx = await wallet.vesu.withdraw({
        token:  tokens[token],
        amount: Amount.parse(amount, tokens[token]),
      });
      return tx.wait();
    });

  const getMarketStats = useCallback(async () => {
    if (!wallet) return null;
    // Returns { supplyAPY, borrowAPR, totalSupplied, utilization }
    return wallet.vesu.getMarketStats(tokens.USDC);
  }, [wallet]);

  return { supplyUSDC, borrow, repay, withdraw, getMarketStats, loading, error };
}

// ══════════════════════════════════════════════════════════════════════════════
// DCA (Dollar-Cost Averaging)
// Starkzap v2 automates recurring swaps via the AVNU aggregator.
// Execution is gasless — paymaster covers each periodic purchase.
// ══════════════════════════════════════════════════════════════════════════════

export function useDCA() {
  const { wallet } = useWallet();
  const { loading, error, exec } = useTx();

  interface CreateDCAParams {
    spendToken:  keyof typeof tokens; // e.g. "USDC"
    buyToken:    keyof typeof tokens; // e.g. "STRK" | "WBTC"
    amount:      string;              // human-readable spend amount per interval
    frequency:   "daily" | "weekly" | "monthly";
  }

  const createSchedule = async (p: CreateDCAParams): Promise<TxReceipt | null> =>
    exec(async () => {
      if (!wallet) throw new Error("Wallet not connected");

      // DCAFrequency maps to on-chain interval blocks
      const freqMap: Record<string, DCAFrequency> = {
        daily:   DCAFrequency.Daily,
        weekly:  DCAFrequency.Weekly,
        monthly: DCAFrequency.Monthly,
      };

      // wallet.dca.create() deploys a Starknet contract that executes
      // recurring AVNU swaps on behalf of the user via session keys
      const tx = await wallet.dca.create({
        sell:      { token: tokens[p.spendToken], amount: Amount.parse(p.amount, tokens[p.spendToken]) },
        buy:       { token: tokens[p.buyToken] },
        frequency: freqMap[p.frequency],
        // slippage: 0.5% default — AVNU finds best route at execution time
      });
      return tx.wait();
    });

  const cancelSchedule = async (dcaId: string): Promise<TxReceipt | null> =>
    exec(async () => {
      if (!wallet) throw new Error("Wallet not connected");
      const tx = await wallet.dca.cancel(dcaId);
      return tx.wait();
    });

  const getSchedules = useCallback(async () => {
    if (!wallet) return [];
    // Returns [{ id, sellToken, buyToken, amount, frequency, nextExecution, totalExecuted }]
    return wallet.dca.getSchedules();
  }, [wallet]);

  return { createSchedule, cancelSchedule, getSchedules, loading, error };
}

// ══════════════════════════════════════════════════════════════════════════════
// CONFIDENTIAL TRANSFERS (Tongo Cash)
// Tongo integrates ZK proofs to shield sender, recipient, and amount.
// On-chain, the transfer looks like a note commitment — nothing is readable.
// This is the "Swiss bank privacy" layer of StarkFlow.
// ══════════════════════════════════════════════════════════════════════════════

export function useConfidentialTransfer() {
  const { wallet } = useWallet();
  const { loading, error, exec } = useTx();

  /**
   * Send tokens privately using Tongo ZK shielding.
   * The recipient must also have a Tongo deposit address.
   */
  const privateSend = async (
    to: string,
    amount: string,
    token: keyof typeof tokens = "STRK"
  ): Promise<TxReceipt | null> =>
    exec(async () => {
      if (!wallet) throw new Error("Wallet not connected");

      // wallet.confidential.send() handles:
      //   1. Generating a ZK proof of the transfer
      //   2. Shielding the amount into Tongo's merkle tree
      //   3. Submitting the proof on-chain (only the proof hash is visible)
      const tx = await wallet.confidential.send({
        to:     fromAddress(to),
        token:  tokens[token],
        amount: Amount.parse(amount, tokens[token]),
      });

      return tx.wait();
    });

  /** Shield existing tokens (deposit to Tongo pool) */
  const shield = async (
    amount: string,
    token: keyof typeof tokens = "STRK"
  ): Promise<TxReceipt | null> =>
    exec(async () => {
      if (!wallet) throw new Error("Wallet not connected");
      const tx = await wallet.confidential.shield({
        token:  tokens[token],
        amount: Amount.parse(amount, tokens[token]),
      });
      return tx.wait();
    });

  /** Unshield (withdraw from Tongo pool back to public balance) */
  const unshield = async (
    amount: string,
    token: keyof typeof tokens = "STRK"
  ): Promise<TxReceipt | null> =>
    exec(async () => {
      if (!wallet) throw new Error("Wallet not connected");
      const tx = await wallet.confidential.unshield({
        token:  tokens[token],
        amount: Amount.parse(amount, tokens[token]),
      });
      return tx.wait();
    });

  const getPrivateBalance = useCallback(async (token: keyof typeof tokens = "STRK") => {
    if (!wallet) return null;
    // Returns shielded balance — only visible to the wallet holder via local ZK state
    return wallet.confidential.getBalance(tokens[token]);
  }, [wallet]);

  return { privateSend, shield, unshield, getPrivateBalance, loading, error };
}

// ══════════════════════════════════════════════════════════════════════════════
// PORTFOLIO
// Aggregate all positions into a single portfolio view.
// ══════════════════════════════════════════════════════════════════════════════

export function usePortfolio() {
  const { wallet } = useWallet();

  const getBalances = useCallback(async () => {
    if (!wallet) return {};
    // Fetch all token balances in parallel — Amount type is type-safe
    const [strk, wbtc, usdc, eth] = await Promise.all([
      wallet.balanceOf(tokens.STRK),
      wallet.balanceOf(tokens.WBTC),
      wallet.balanceOf(tokens.USDC),
      wallet.balanceOf(tokens.ETH),
    ]);
    return { strk, wbtc, usdc, eth };
  }, [wallet]);

  return { getBalances };
}
