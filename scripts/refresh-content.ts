import { refreshContent } from '../lib/refresh-content';

async function main() {
  try {
    const snapshot = await refreshContent({ file: new URL('../data/public-content.json', import.meta.url) });
    console.log(`Saved ${snapshot.repositories.length} repositories and ${snapshot.articles.length} articles.`);
  } catch (error) {
    console.error(`Refresh failed; the existing snapshot was preserved. ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

void main();
