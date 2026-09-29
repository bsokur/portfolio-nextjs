'use client';

import { useEffect, useReducer } from 'react';
import { fetchLiveFeed, liveFeedReducer, type LiveFeedState } from '@/lib/live-feed';

const REQUEST_TIMEOUT_MS = 10_000;

export function useLiveFeed<T>(endpoint: string, normalize: (input: unknown) => T[]) {
  const initialState: LiveFeedState<T> = { items: [], status: 'loading', attempt: 0 };
  const [state, dispatch] = useReducer(liveFeedReducer<T>, initialState);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    fetchLiveFeed(endpoint, normalize, controller.signal)
      .then((items) => {
        if (isActive) {
          dispatch({ type: 'loaded', items });
        }
      })
      .catch(() => {
        if (isActive) {
          dispatch({ type: 'failed' });
        }
      })
      .finally(() => window.clearTimeout(timeoutId));

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [endpoint, normalize, state.attempt]);

  return { ...state, retry: () => dispatch({ type: 'retry' }) };
}
