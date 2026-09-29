'use client';

import { useLiveFeed } from './use-live-feed';
import { ArrowIcon } from './icons';
import { profile } from '@/lib/profile';
import { formatDate, normalizeRepositories, repositoryEndpoint } from '@/lib/feeds';

export function RepositoryFeed() {
  const state = useLiveFeed(repositoryEndpoint, normalizeRepositories);
  let message = '';
  if (state.status === 'loading') {
    message = 'Loading repositories…';
  } else if (state.status === 'error') {
    message = 'Repositories couldn’t be loaded. Please try again or visit my GitHub profile.';
  } else if (state.items.length === 0) {
    message = 'No public repositories to display.';
  }

  return (
    <section className="feed-section" id="projects" aria-labelledby="projects-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">GitHub</p>
          <h2 id="projects-heading">
            Projects<span className="heading-period">.</span>
          </h2>
        </div>
        <a
          className="text-link"
          href={`${profile.github}?tab=repositories`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View all repositories on GitHub (opens in a new tab)"
          title="Opens in a new tab"
        >
          All repositories <ArrowIcon />
        </a>
      </div>
      <div className="project-grid" id="repository-list">
        {state.items.map((repository) => (
          <article
            className="project-card"
            key={repository.id}
            aria-labelledby={`repository-${repository.id}`}
          >
            <h3 className="project-title" id={`repository-${repository.id}`}>
              {repository.name}
            </h3>
            {repository.description && (
              <p className="project-description">{repository.description}</p>
            )}
            <ul className="project-stack" aria-label={`${repository.name} details`}>
              {repository.language && <li>{repository.language}</li>}
              <li>
                {repository.stars} {repository.stars === 1 ? 'star' : 'stars'}
              </li>
              {repository.fork && <li>Fork</li>}
              {repository.archived && <li>Archived</li>}
            </ul>
            {repository.pushedAt !== '1970-01-01T00:00:00Z' && (
              <p className="project-kicker">
                Last push{' '}
                <time dateTime={repository.pushedAt}>{formatDate(repository.pushedAt)}</time>
              </p>
            )}
            <a
              className="text-link"
              href={repository.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${repository.name} on GitHub (opens in a new tab)`}
              title="Opens in a new tab"
            >
              View on GitHub <ArrowIcon />
            </a>
          </article>
        ))}
      </div>
      <div className="feed-feedback">
        <p className="feed-notice feed-status" role="status" aria-atomic="true">
          {message}
        </p>
        {state.status === 'error' && (
          <button className="text-link feed-retry-button" type="button" onClick={state.retry}>
            Retry repositories
          </button>
        )}
        <noscript>
          <p>Enable JavaScript to load repositories, or use the GitHub link above.</p>
        </noscript>
      </div>
    </section>
  );
}
