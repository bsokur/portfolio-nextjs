'use client';

import { useLiveFeed } from './use-live-feed';
import { ArrowIcon } from './icons';
import { profile } from '@/lib/profile';
import { articleEndpoint, formatDate, normalizeArticles } from '@/lib/feeds';

export function ArticleFeed() {
  const state = useLiveFeed(articleEndpoint, normalizeArticles);
  let message = '';
  if (state.status === 'loading') {
    message = 'Loading articles…';
  } else if (state.status === 'error') {
    message = 'Articles couldn’t be loaded. Please try again or visit my DEV.to profile.';
  } else if (state.items.length === 0) {
    message = 'No public articles to display.';
  }

  return (
    <section
      className="feed-section writing-section"
      id="writing"
      aria-labelledby="writing-heading"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">DEV.to</p>
          <h2 id="writing-heading">
            Writing<span className="heading-period">.</span>
          </h2>
        </div>
        <a
          className="text-link"
          href={profile.dev}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View all articles on DEV.to (opens in a new tab)"
          title="Opens in a new tab"
        >
          View all articles <ArrowIcon />
        </a>
      </div>
      <div className="article-list" id="article-list">
        {state.items.map((article) => (
          <a
            className="article"
            key={article.id}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${article.title} (opens in a new tab)`}
            title="Opens in a new tab"
          >
            <div className="article-meta">
              <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
              <span>{article.readingMinutes} min read</span>
            </div>
            <h3>{article.title}</h3>
            {article.description && <p>{article.description}</p>}
            <span className="article-read">
              Read on DEV.to <ArrowIcon />
            </span>
          </a>
        ))}
      </div>
      <div className="feed-feedback">
        <p className="feed-notice feed-status" role="status" aria-atomic="true">
          {message}
        </p>
        {state.status === 'error' && (
          <button className="text-link feed-retry-button" type="button" onClick={state.retry}>
            Retry articles
          </button>
        )}
        <noscript>
          <p>Enable JavaScript to load articles, or use the DEV.to link above.</p>
        </noscript>
      </div>
    </section>
  );
}
