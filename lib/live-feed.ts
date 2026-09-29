const FEED_ITEM_LIMIT = 3;

export type LiveFeedState<T> = {
  items: T[];
  status: 'loading' | 'ready' | 'error';
  attempt: number;
};

export type LiveFeedAction<T> =
  | { type: 'loaded'; items: T[] }
  | { type: 'failed' }
  | { type: 'retry' };

export function liveFeedReducer<T>(
  state: LiveFeedState<T>,
  action: LiveFeedAction<T>,
): LiveFeedState<T> {
  switch (action.type) {
    case 'retry':
      return { items: [], status: 'loading', attempt: state.attempt + 1 };
    case 'failed':
      return { ...state, items: [], status: 'error' };
    case 'loaded':
      return { ...state, items: action.items.slice(0, FEED_ITEM_LIMIT), status: 'ready' };
  }
}

export async function fetchLiveFeed<T>(
  endpoint: string,
  normalize: (input: unknown) => T[],
  signal: AbortSignal,
  fetcher: typeof fetch = fetch,
): Promise<T[]> {
  const response = await fetcher(endpoint, {
    signal,
    cache: 'no-store',
    credentials: 'omit',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Feed unavailable (${response.status})`);
  }

  const data: unknown = await response.json();
  return normalize(data).slice(0, FEED_ITEM_LIMIT);
}
