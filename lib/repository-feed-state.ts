import type { Repository } from './feeds';

export type RepositoryFeedState = {
  items: Repository[];
  pending: Repository[] | null;
  status: 'refreshing' | 'ready' | 'error';
  appliedUpdate: boolean;
};

type Action = { type: 'loaded'; items: Repository[] } | { type: 'failed' } | { type: 'apply' };

export function createRepositoryFeedState(items: Repository[]): RepositoryFeedState {
  return { items: items.slice(0, 3), pending: null, status: 'refreshing', appliedUpdate: false };
}

export function repositoryFeedReducer(state: RepositoryFeedState, action: Action): RepositoryFeedState {
  if (action.type === 'failed') return { ...state, status: 'error' };
  if (action.type === 'apply') {
    if (state.pending === null) return state;
    return { ...state, items: state.pending, pending: null, appliedUpdate: true };
  }
  const items = action.items.slice(0, 3);
  if (JSON.stringify(items) === JSON.stringify(state.items)) return { ...state, status: 'ready', pending: null };
  // Keep existing cards stable until the visitor accepts the refreshed list.
  if (!state.items.length) return { ...state, items, pending: null, status: 'ready' };
  return { ...state, pending: items, status: 'ready' };
}
