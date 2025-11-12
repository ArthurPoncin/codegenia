import { useState } from "react";

export function useTokens(initialValue = 100) {
  const [tokens, setTokens] = useState(initialValue);
  return { tokens, setTokens };
}

export default useTokens;
