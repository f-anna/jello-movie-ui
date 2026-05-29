import { useState, useEffect, useCallback, useRef } from 'react';

export const useJobStatus = (fetchStatus, { pollIntervalMs = 3000 } = {}) => {
  const [status, setStatus] = useState({ running: false, startedAt: null, lastFinishedAt: null });
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchStatus();
      setStatus(data || { running: false, startedAt: null, lastFinishedAt: null });
      setError(null);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [fetchStatus]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!status.running) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return undefined;
    }
    if (intervalRef.current) return undefined;
    intervalRef.current = setInterval(refresh, pollIntervalMs);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status.running, pollIntervalMs, refresh]);

  return { status, error, refresh };
};
