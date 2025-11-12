import { useCallback, useState } from "react";

export function useAsync(asyncFn, deps = []) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const run = useCallback(
    async (...args) => {
      setStatus("pending");
      setError(null);
      try {
        const value = await asyncFn(...args);
        setResult(value);
        setStatus("resolved");
        return value;
      } catch (err) {
        setError(err);
        setStatus("rejected");
        throw err;
      }
    },
    deps // eslint-disable-line react-hooks/exhaustive-deps
  );

  return { run, status, error, result };
}

export default useAsync;
