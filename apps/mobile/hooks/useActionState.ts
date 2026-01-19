/**
 * useActionState Polyfill for React Native
 *
 * React Native doesn't have full React 19 support for useActionState yet.
 * This is a compatible implementation that provides the same API.
 *
 * Usage:
 *   const [state, action, isPending] = useActionState(serverAction, initialState);
 */

import { useState, useTransition, useCallback } from 'react';

type ActionFunction<State, Payload> = (
  previousState: State,
  payload: Payload
) => Promise<State> | State;

/**
 * useActionState - Manages form/action state with pending status
 *
 * @param action - Async function that receives previous state and payload
 * @param initialState - Initial state value
 * @returns [state, dispatch, isPending]
 */
export function useActionState<State, Payload = FormData>(
  action: ActionFunction<State, Payload>,
  initialState: State
): [State, (payload: Payload) => void, boolean] {
  const [state, setState] = useState<State>(initialState);
  const [isPending, startTransition] = useTransition();

  const dispatch = useCallback(
    (payload: Payload) => {
      startTransition(async () => {
        const result = await action(state, payload);
        setState(result);
      });
    },
    [action, state]
  );

  return [state, dispatch, isPending];
}
