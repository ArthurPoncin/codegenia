import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import fetchTokenBalance from "@/api/tokens.js";
import { initDB } from "@/db/indexedDB.js";
import {
  ensureInitialTokens,
  setBalance as setStoredBalance,
} from "@/db/tokens.js";
import {
  GENERATION_COST,
  RESALE_REWARD,
} from "@/lib/constants.js";
import {
  TokenError,
  TOKEN_ERROR_CODES,
} from "@/features/tokens/tokenErrors.js";

const TokensContext = createContext(null);

function computeGenerationKey({ idempotencyKey, jobId } = {}) {
  return idempotencyKey ?? jobId ?? null;
}

function createBalanceNotReadyError() {
  return new TokenError(
    TOKEN_ERROR_CODES.BALANCE_NOT_READY,
    "Le solde des jetons n'est pas encore initialisé."
  );
}

async function persistBalance(mode, nextBalance) {
  if (mode !== "offline") {
    return;
  }
  const db = await initDB();
  await setStoredBalance(db, nextBalance);
}

function useProvideTokens({ mode }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generationChargesRef = useRef(new Map());
  const resaleRef = useRef(new Set());

  const updateBalance = useCallback((updater) => {
    let result = { balance: null, changed: false };
    setBalance((prev) => {
      if (prev == null) {
        result = { balance: prev, changed: false };
        return prev;
      }
      result = updater(prev);
      return result.balance;
    });
    return result;
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === "offline") {
        const db = await initDB();
        const current = await ensureInitialTokens(db);
        setBalance(current);
        return { balance: current };
      }

      const data = await fetchTokenBalance();
      setBalance(data.balance);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    refresh().catch((err) => {
      console.error("[Tokens] initial refresh failed", err);
    });
  }, [refresh]);

  const ensureReady = useCallback(() => {
    if (balance == null) {
      throw createBalanceNotReadyError();
    }
  }, [balance]);

  const applyGenerationCharge = useCallback(
    async ({ idempotencyKey, jobId } = {}) => {
      const key = computeGenerationKey({ idempotencyKey, jobId });
      if (!key) {
        throw new TokenError(
          TOKEN_ERROR_CODES.MISSING_IDEMPOTENCY_KEY,
          "Une Idempotency-Key est requise pour lancer une génération."
        );
      }

      ensureReady();

      const existing = generationChargesRef.current.get(key);
      if (existing?.charged && !existing.refunded) {
        return { balance, applied: false };
      }

      const result = updateBalance((current) => {
        if (current < GENERATION_COST) {
          throw new TokenError(
            TOKEN_ERROR_CODES.INSUFFICIENT_TOKENS,
            "Solde insuffisant pour lancer une génération.",
            { balance: current, required: GENERATION_COST }
          );
        }
        return { balance: current - GENERATION_COST, changed: true };
      });

      if (!result.changed) {
        return { balance: result.balance ?? balance, applied: false };
      }

      generationChargesRef.current.set(key, {
        charged: true,
        refunded: false,
        jobId,
      });

      await persistBalance(mode, result.balance);
      return { balance: result.balance, applied: true };
    },
    [balance, ensureReady, mode, updateBalance]
  );

  const refundGenerationCharge = useCallback(
    async ({ idempotencyKey, jobId } = {}) => {
      const key = computeGenerationKey({ idempotencyKey, jobId });
      if (!key) {
        return { balance, refunded: false };
      }

      ensureReady();

      const entry = generationChargesRef.current.get(key);
      if (!entry?.charged || entry.refunded) {
        return { balance, refunded: false };
      }

      const result = updateBalance((current) => ({
        balance: current + GENERATION_COST,
        changed: true,
      }));

      generationChargesRef.current.set(key, {
        ...entry,
        refunded: true,
      });

      await persistBalance(mode, result.balance);
      return { balance: result.balance, refunded: true };
    },
    [balance, ensureReady, mode, updateBalance]
  );

  const applyResaleReward = useCallback(
    async (pokemonId) => {
      if (!pokemonId) {
        throw new TokenError(
          TOKEN_ERROR_CODES.MISSING_POKEMON_ID,
          "Un identifiant de Pokémon est requis pour la revente."
        );
      }

      ensureReady();

      if (resaleRef.current.has(pokemonId)) {
        return { balance, rewarded: false };
      }

      const result = updateBalance((current) => ({
        balance: current + RESALE_REWARD,
        changed: true,
      }));

      resaleRef.current.add(pokemonId);
      await persistBalance(mode, result.balance);
      return { balance: result.balance, rewarded: true };
    },
    [balance, ensureReady, mode, updateBalance]
  );

  const syncBalance = useCallback(
    async (nextBalance) => {
      setBalance(nextBalance);
      await persistBalance(mode, nextBalance);
      return nextBalance;
    },
    [mode]
  );

  const isGenerationCharged = useCallback(({ idempotencyKey, jobId } = {}) => {
    const key = computeGenerationKey({ idempotencyKey, jobId });
    if (!key) return false;
    const entry = generationChargesRef.current.get(key);
    return Boolean(entry?.charged && !entry.refunded);
  }, []);

  const isGenerationRefunded = useCallback(({ idempotencyKey, jobId } = {}) => {
    const key = computeGenerationKey({ idempotencyKey, jobId });
    if (!key) return false;
    const entry = generationChargesRef.current.get(key);
    return Boolean(entry?.charged && entry.refunded);
  }, []);

  const isPokemonSold = useCallback((pokemonId) => resaleRef.current.has(pokemonId), []);

  return {
    balance,
    loading,
    error,
    mode,
    refresh,
    syncBalance,
    applyGenerationCharge,
    refundGenerationCharge,
    applyResaleReward,
    isGenerationCharged,
    isGenerationRefunded,
    isPokemonSold,
  };
}

export function TokensProvider({ children, mode = "server" }) {
  const value = useProvideTokens({ mode });
  return <TokensContext.Provider value={value}>{children}</TokensContext.Provider>;
}

export function useTokens() {
  const context = useContext(TokensContext);
  if (!context) {
    throw new Error("useTokens must be used within a TokensProvider");
  }
  return context;
}

export default useTokens;
