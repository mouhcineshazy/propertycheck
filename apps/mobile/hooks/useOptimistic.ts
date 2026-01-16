/**
 * useOptimistic Hook
 *
 * Provides optimistic UI updates with automatic rollback on failure.
 * Based on React 19's useOptimistic pattern.
 */

import { useState, useCallback, useRef } from 'react';

type OptimisticReducer<T, A> = (currentState: T, action: A) => T;

/**
 * useOptimistic - Optimistic state updates with rollback
 *
 * @param initialState - The actual/server state
 * @param reducer - Function to apply optimistic update
 * @returns [optimisticState, addOptimistic]
 */
export function useOptimistic<T, A>(
  passthrough: T,
  reducer: OptimisticReducer<T, A>
): [T, (action: A) => void] {
  const [optimisticState, setOptimisticState] = useState<T | null>(null);
  const pendingRef = useRef(false);

  // If no pending optimistic update, use passthrough
  const currentState = optimisticState ?? passthrough;

  const addOptimistic = useCallback(
    (action: A) => {
      pendingRef.current = true;
      setOptimisticState(reducer(passthrough, action));
    },
    [passthrough, reducer]
  );

  // Reset optimistic state when passthrough changes (server confirmed)
  if (optimisticState !== null && passthrough !== optimisticState && !pendingRef.current) {
    setOptimisticState(null);
  }

  // Mark as no longer pending when passthrough updates
  if (pendingRef.current && passthrough !== optimisticState) {
    pendingRef.current = false;
    setOptimisticState(null);
  }

  return [currentState, addOptimistic];
}
