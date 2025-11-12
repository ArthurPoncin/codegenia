import { useCallback, useEffect, useMemo, useState } from "react";
import client from "@/api/client.js";
import { initDB } from "@/db/indexedDB.js";
import { deletePokemon, listPokemons, putPokemon } from "@/db/pokemons.js";

const INVENTORY_UPDATED_EVENT = "pokeforge:inventory-updated";

function broadcastInventoryUpdate() {
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new CustomEvent(INVENTORY_UPDATED_EVENT));
  }
}

function mapServerItem(item) {
  if (!item) return item;
  return {
    ...item,
    imageUrl: item.image?.url ?? item.imageUrl ?? "",
  };
}

export function useInventory({ mode = "server", autoLoad = true } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        const aDate = typeof a.createdAt === "string" ? Date.parse(a.createdAt) : a.createdAt ?? 0;
        const bDate = typeof b.createdAt === "string" ? Date.parse(b.createdAt) : b.createdAt ?? 0;
        return bDate - aDate;
      }),
    [items]
  );

  const list = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === "server") {
        const response = await client.get("/inventory", { params: { limit: 200 } });
        const nextItems = (response.data?.items ?? []).map(mapServerItem);
        setItems(nextItems);
        return nextItems;
      }

      const db = await initDB();
      const all = await listPokemons(db, { limit: 200 });
      setItems(all);
      return all;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mode]);

  const addLocal = useCallback(async (doc) => {
    const db = await initDB();
    const stored = await putPokemon(db, doc);
    setItems((prev) => {
      const filtered = prev.filter((item) => item.id !== stored.id);
      return [...filtered, stored];
    });
    broadcastInventoryUpdate();
    return stored;
  }, []);

  const removeLocal = useCallback(async (id) => {
    if (!id) return;
    const db = await initDB();
    await deletePokemon(db, id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    broadcastInventoryUpdate();
  }, []);

  useEffect(() => {
    if (!autoLoad) return undefined;
    let active = true;
    list().catch((err) => {
      if (active) {
        console.error("[useInventory] initial load failed", err);
      }
    });
    return () => {
      active = false;
    };
  }, [autoLoad, list]);

  useEffect(() => {
    if (!autoLoad || typeof window === "undefined") {
      return undefined;
    }

    const handler = () => {
      list().catch((err) => {
        console.error("[useInventory] refresh failed", err);
      });
    };

    window.addEventListener(INVENTORY_UPDATED_EVENT, handler);
    return () => {
      window.removeEventListener(INVENTORY_UPDATED_EVENT, handler);
    };
  }, [autoLoad, list]);

  return {
    items: sortedItems,
    loading,
    error,
    list,
    addLocal,
    removeLocal,
  };
}

export default useInventory;
