import { useEffect, useState } from 'react';

const secondsLeft = (targetMs) =>
  targetMs ? Math.max(0, Math.ceil((targetMs - Date.now()) / 1000)) : 0;

/**
 * Returns the whole seconds left until `targetMs` (epoch milliseconds).
 * Re-renders the component while a target is set.
 */
export default function useCountdown(targetMs) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!targetMs) return undefined;
    const id = setInterval(() => setTick((value) => value + 1), 250);
    return () => clearInterval(id);
  }, [targetMs]);

  return secondsLeft(targetMs);
}
