import { formatDate, type Article } from './feeds';
import { articleDescriptions } from './profile';

export type ArticleFeedState = {
  items: Article[];
  pending: Article[] | null;
  savedAt: string;
  status: 'refreshing' | 'ready' | 'error';
  appliedUpdate: boolean;
  populatedEmptyList: boolean;
};

type ArticleFeedAction =
  | { type: 'loaded'; items: Article[] }
  | { type: 'failed' }
  | { type: 'apply' };

export function articleDescription(article: Article): string {
  return articleDescriptions[article.id] || article.description;
}

export function createArticleFeedState(initial: Article[], savedAt: string): ArticleFeedState {
  return {
    items: initial.slice(0, 3),
    pending: null,
    savedAt,
    status: 'refreshing',
    appliedUpdate: false,
    populatedEmptyList: false,
  };
}

function visibleContent(items: Article[]): string {
  return JSON.stringify(items.map((article) => [
    article.title,
    article.url,
    articleDescription(article),
    formatDate(article.publishedAt),
    article.readingMinutes,
  ]));
}

export function articleFeedReducer(state: ArticleFeedState, action: ArticleFeedAction): ArticleFeedState {
  if (action.type === 'failed') return { ...state, status: 'error' };
  if (action.type === 'apply') {
    if (state.pending === null) return state;
    return { ...state, items: state.pending, pending: null, appliedUpdate: true };
  }

  const items = action.items.slice(0, 3);
  if (visibleContent(state.items) === visibleContent(items)) {
    return { ...state, pending: null, status: 'ready' };
  }
  // Empty lists have no reading position to preserve. Existing rows change only
  // after the visitor chooses to show the update, including an empty response.
  if (!state.items.length) {
    return { ...state, items, pending: null, status: 'ready', populatedEmptyList: true };
  }
  return { ...state, pending: items, status: 'ready' };
}

export function articleFeedMessage(state: ArticleFeedState): string {
  if (state.status === 'error') {
    const savedDate = formatDate(state.savedAt);
    return state.items.length
      ? `Latest articles couldn’t be loaded. Showing articles saved ${savedDate}.`
      : `Latest articles couldn’t be loaded. The saved list from ${savedDate} has no articles.`;
  }
  if (state.pending !== null) return 'Updated articles are available.';
  if (state.status === 'refreshing') return state.items.length ? '' : 'Loading articles…';
  if (!state.items.length) return 'No articles to display here.';
  if (state.appliedUpdate) return 'Articles updated.';
  return state.populatedEmptyList ? 'Latest articles loaded.' : '';
}
