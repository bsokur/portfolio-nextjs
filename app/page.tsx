import type { Metadata } from 'next';
import { ArticleFeed } from '@/components/content-feeds';
import { ArrowIcon, MailIcon } from '@/components/icons';
import { Portrait } from '@/components/portrait';
import { RepositoryFeed } from '@/components/repository-feed';
import { ThemeToggle } from '@/components/theme-toggle';
import { profile } from '@/lib/profile';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="site-shell">
        <header className="site-header">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- The logo intentionally reloads the page. */}
          <a className="wordmark" href="/" aria-label={`bsokur.dev — ${profile.name}, home`}>
            bsokur<span>.</span>dev
          </a>
          <nav aria-label="Main navigation">
            <a href="#projects">Projects</a>
            <a href="#writing">Writing</a>
            <a href={`mailto:${profile.email}`}>Email me</a>
          </nav>
          <ThemeToggle />
        </header>
        <main id="main" tabIndex={-1}>
          <section className="intro" aria-labelledby="name">
            <div className="intro-heading">
              <p className="intro-location">{profile.location}</p>
              <h1 id="name">
                {profile.name}
                <span className="name-period">.</span>
              </h1>
              <p className="headline">{profile.headline}</p>
            </div>
            <Portrait alt={`Portrait of ${profile.name}`} />
            <p className="bio">{profile.bio}</p>
            <div className="intro-skills">
              <ul className="technologies" aria-label="Main technologies">
                {profile.technologies.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
              <ul className="capabilities" aria-label="Backend capabilities">
                {profile.capabilities.map((capability) => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
            </div>
            <div className="intro-actions">
              <a className="primary-link" href="#projects">
                View projects <span aria-hidden="true">↓</span>
              </a>
              <a className="text-link" href={`mailto:${profile.email}`}>
                <MailIcon /> Email me
              </a>
            </div>
            <div className="social-links">
              <a
                className="text-link"
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub (opens in a new tab)"
                title="Opens in a new tab"
              >
                GitHub <ArrowIcon />
              </a>
              <a
                className="text-link"
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn (opens in a new tab)"
                title="Opens in a new tab"
              >
                LinkedIn <ArrowIcon />
              </a>
            </div>
          </section>
          <RepositoryFeed />
          <ArticleFeed />
        </main>
        <footer className="site-footer">
          <span>
            © {new Date().getUTCFullYear()} {profile.name}
          </span>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href={profile.phoneHref}>{profile.phone}</a>
          <a href="#main" className="back-to-top">
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </footer>
      </div>
    </>
  );
}
