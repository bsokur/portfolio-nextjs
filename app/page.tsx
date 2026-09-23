import type { Metadata } from 'next';
import { ArticleFeed } from '@/components/content-feeds';
import { ArrowIcon, MailIcon } from '@/components/icons';
import { Portrait } from '@/components/portrait';
import { RepositoryFeed } from '@/components/repository-feed';
import { normalizeArticles, normalizeRepositories } from '@/lib/feeds';
import { profile } from '@/lib/profile';
import snapshot from '@/data/public-content.json';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function Home() {
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <div className="site-shell">
      <header className="site-header">
        <a className="wordmark" href="#main" aria-label={`bsokur.dev — ${profile.name}, home`}>bsokur<span>.</span>dev</a>
        <nav aria-label="Main navigation">
          <a href="#projects">Projects</a>
          <a href="#writing">Writing</a>
          <a href={`mailto:${profile.email}`}>Email me</a>
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        <section className="intro" aria-labelledby="name">
          <div className="intro-heading">
            <p className="intro-location">{profile.location}</p>
            <h1 id="name">{profile.name}<span className="name-period">.</span></h1>
            <p className="headline">{profile.headline}</p>
          </div>
          <Portrait alt={`Portrait of ${profile.name}`} />
          <p className="bio">{profile.bio}</p>
          <ul className="technologies" aria-label="Main technologies">
            {profile.technologies.map((technology) => <li key={technology}>{technology}</li>)}
          </ul>
          <div className="intro-actions">
            <a className="primary-link" href="#projects">View projects <span aria-hidden="true">↓</span></a>
            <a className="text-link" href={`mailto:${profile.email}`}><MailIcon /> Email me</a>
          </div>
          <div className="social-links">
            <a className="text-link" href={profile.github}>GitHub <ArrowIcon /></a>
            <a className="text-link" href={profile.linkedin}>LinkedIn <ArrowIcon /></a>
          </div>
        </section>
        <RepositoryFeed initial={normalizeRepositories(snapshot.repositories)} savedAt={snapshot.updatedAt} />
        <ArticleFeed initial={normalizeArticles(snapshot.articles)} savedAt={snapshot.updatedAt} />
      </main>
      <footer className="site-footer">
        <span>© {new Date().getUTCFullYear()} {profile.name}</span>
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
        <a href={profile.phoneHref}>{profile.phone}</a>
        <a href="#main" className="back-to-top">Back to top <span aria-hidden="true">↑</span></a>
      </footer>
    </div>
  </>;
}
