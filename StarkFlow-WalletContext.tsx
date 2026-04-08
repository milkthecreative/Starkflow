// src/context/WalletContext.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Global wallet state. Wraps Starkzap's onboard() flow with Privy social login.
// Any component can call useWallet() to access the wallet, address, and status.
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { OnboardStrategy, fromAddress, type WalletInterface } from "starkzap";
import { sdk, NETWORK } from "../starkzap.config";

interface WalletState {
  wallet:    WalletInterface | null;
  address:   string | null;
  connected: boolean;
  loading:   boolean;
  error:     string | null;
  connect:   () => Promise<void>;
  disconnect: () => void;
}

const WalletCtx = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet,    setWallet]    = useState<WalletInterface | null>(null);
  const [address,   setAddress]   = useState<string | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  // ── Connect via Privy ───────────────────────────────────────────────────────
  // OnboardStrategy.Privy triggers the Privy modal (Google, Apple, Discord, etc.)
  // Starkzap handles account deployment on first login ("if_needed").
  // Users never see a seed phrase or manage gas — pure Web2 UX.
  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await sdk.onboard({
        strategy: OnboardStrategy.Privy,
        deploy:   "if_needed",   // deploy Starknet account on first use
      });

      setWallet(result.wallet);
      setAddress(result.wallet.address);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      setError(msg);
      console.error("[StarkFlow] Wallet connect error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet(null);
    setAddress(null);
  }, []);

  // Auto-reconnect on refresh if Privy session exists
  useEffect(() => {
    const restored = sdk.getExistingSession?.();
    if (restored) {
      setWallet(restored.wallet);
      setAddress(restored.wallet.address);
    }
  }, []);

  return (
    <WalletCtx.Provider value={{ wallet, address, connected: !!wallet, loading, error, connect, disconnect }}>
      {children}
    </WalletCtx.Provider>
  );
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletCtx);
  if (!ctx) throw new Error("useWallet must be used within <WalletProvider>");
  return ctx;
}
