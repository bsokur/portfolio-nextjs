'use client';

import { useEffect, useReducer } from 'react';
import { ArrowIcon } from './icons';
import { profile } from '@/lib/profile';
import { formatDate, normalizeRepositories, repositoryEndpoint, type Repository } from '@/lib/feeds';
import { createRepositoryFeedState, repositoryFeedReducer } from '@/lib/repository-feed-state';

export function RepositoryFeed({ initial, savedAt }: { initial: Repository[]; savedAt: string }) {
  const [state, dispatch] = useReducer(repositoryFeedReducer, initial, createRepositoryFeedState);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timer = window.setTimeout(() => controller.abort(), 10000);
    fetch(repositoryEndpoint, { signal: controller.signal, credentials: 'omit', headers: { Accept: 'application/vnd.github+json' } })
      .then(async (response) => {
        if (!response.ok) throw new Error('Repositories unavailable');
        return normalizeRepositories(await response.json());
      })
      .then((items) => { if (active) dispatch({ type: 'loaded', items }); })
      .catch(() => { if (active) dispatch({ type: 'failed' }); })
      .finally(() => window.clearTimeout(timer));
    return () => { active = false; window.clearTimeout(timer); controller.abort(); };
  }, []);

  const message = state.status === 'error'
    ? `Latest repositories couldn’t be loaded. ${state.items.length ? 'Showing repositories' : 'The empty repository list was'} saved ${formatDate(savedAt)}.`
    : state.pending !== null ? 'Updated repositories are available.'
    : state.status === 'refreshing' ? (state.items.length ? '' : 'Loading repositories…')
    : !state.items.length ? 'No public repositories to display.'
    : state.appliedUpdate ? 'Repositories updated.' : '';

  return <section className="feed-section" id="projects" aria-labelledby="projects-heading">
    <div className="section-heading">
      <div><p className="eyebrow">GitHub</p><h2 id="projects-heading">Projects<span className="heading-period">.</span></h2></div>
      <a className="text-link" href={`${profile.github}?tab=repositories`} aria-label="View all repositories on GitHub">All repositories <ArrowIcon /></a>
    </div>
    <div className="project-grid" id="repository-list">
      {state.items.map((repository) => <article className="project-card" key={repository.id} aria-labelledby={`repository-${repository.id}`}>
        <h3 className="project-title" id={`repository-${repository.id}`}>{repository.name}</h3>
        {repository.description && <p className="project-description">{repository.description}</p>}
        <ul className="project-stack" aria-label={`${repository.name} details`}>
          {repository.language && <li>{repository.language}</li>}
          <li>{repository.stars} {repository.stars === 1 ? 'star' : 'stars'}</li>
          {repository.fork && <li>Fork</li>}
          {repository.archived && <li>Archived</li>}
        </ul>
        {repository.pushedAt !== '1970-01-01T00:00:00Z' && <p className="project-kicker">Last push <time dateTime={repository.pushedAt}>{formatDate(repository.pushedAt)}</time></p>}
        <a className="text-link" href={repository.url} aria-label={`View ${repository.name} on GitHub`}>View on GitHub <ArrowIcon /></a>
      </article>)}
    </div>
    <div className="feed-feedback">
      <p className="feed-notice feed-status" role="status" aria-atomic="true">{message}</p>
      {(state.pending !== null || state.appliedUpdate) && <button className="text-link feed-update-button" type="button" aria-controls="repository-list" aria-disabled={state.pending === null} onClick={() => dispatch({ type: 'apply' })}>
        {state.pending !== null ? 'Show updated repositories' : 'Repositories updated'} <span aria-hidden="true">{state.pending !== null ? '↓' : '✓'}</span>
      </button>}
    </div>
  </section>;
}
