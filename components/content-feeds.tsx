'use client';

import { useEffect, useReducer } from 'react';
import { ArrowIcon } from './icons';
import { profile } from '@/lib/profile';
import { articleEndpoint, formatDate, normalizeArticles, type Article } from '@/lib/feeds';
import { articleDescription, articleFeedMessage, articleFeedReducer, createArticleFeedState } from '@/lib/feed-state';

export function ArticleFeed({ initial, savedAt }: { initial: Article[]; savedAt: string }) {
  const [state, dispatch] = useReducer(articleFeedReducer, { initial, savedAt }, ({ initial, savedAt }) => createArticleFeedState(initial, savedAt));

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timer = window.setTimeout(() => controller.abort(), 10000);

    fetch(articleEndpoint, { signal: controller.signal, credentials: 'omit', headers: { Accept: 'application/json' } })
      .then(async (response) => {
        if (!response.ok) throw new Error('Articles unavailable');
        return normalizeArticles(await response.json());
      })
      .then((items) => { if (active) dispatch({ type: 'loaded', items }); })
      .catch(() => { if (active) dispatch({ type: 'failed' }); })
      .finally(() => window.clearTimeout(timer));

    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, []);

  const showProfileLink = state.status === 'error' || (!state.items.length && state.status === 'ready');

  return <section className="feed-section writing-section" id="writing" aria-labelledby="writing-heading">
    <div className="section-heading">
      <div><p className="eyebrow">DEV.to</p><h2 id="writing-heading">Writing<span className="heading-period">.</span></h2></div>
      <a className="text-link" href={profile.dev} aria-label="View all articles on DEV.to">View all articles <ArrowIcon /></a>
    </div>
    <div className="article-list" id="article-list">
      {state.items.map((article) => <a className="article" key={article.id} href={article.url}>
        <div className="article-meta"><time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time><span>{article.readingMinutes} min read</span></div>
        <h3>{article.title}</h3>
        {articleDescription(article) && <p>{articleDescription(article)}</p>}
        <span className="article-read">Read on DEV.to <ArrowIcon /></span>
      </a>)}
    </div>
    <div className="feed-feedback">
      <p className="feed-notice feed-status" role="status" aria-atomic="true">{articleFeedMessage(state)}</p>
      {showProfileLink && <a className="text-link" href={profile.dev}>Browse my DEV.to profile <ArrowIcon /></a>}
      {(state.pending !== null || state.appliedUpdate) && <button
        className="text-link feed-update-button"
        type="button"
        aria-controls="article-list"
        aria-disabled={state.pending === null}
        onClick={() => dispatch({ type: 'apply' })}
      >{state.pending !== null ? 'Show updated articles' : 'Articles updated'} <span aria-hidden="true">{state.pending !== null ? '↓' : '✓'}</span></button>}
    </div>
  </section>;
}
