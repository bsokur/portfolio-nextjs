const details = {
  name: 'Beka Sokurashvili',
  role: '.NET Developer',
  siteUrl: 'https://bsokur.dev',
  headline: '.NET Developer · Backend & Distributed Systems',
  location: 'Tbilisi, Georgia',
  bio: 'I build reliable services with C# and .NET, and explore game engines, probability, and the systems behind them.',
  email: 'beka.sokurashvili@gmail.com',
  phone: '+995 555 579 970',
  githubUsername: 'bsokur',
  devUsername: 'bsokur',
  linkedin: 'https://www.linkedin.com/in/beka-sokurashvili/',
  technologies: ['C#', '.NET', 'PostgreSQL', 'React'],
};

export const profile = {
  ...details,
  initials: details.name.split(/\s+/).map((part) => part[0]).join('').toLowerCase(),
  phoneHref: `tel:${details.phone.replace(/[^+\d]/g, '')}`,
  github: `https://github.com/${encodeURIComponent(details.githubUsername)}`,
  dev: `https://dev.to/${encodeURIComponent(details.devUsername)}`,
};

export const articleDescriptions: Record<number, string> = {
  4696556: 'Exploring return to player, finite bankrolls, and why even a fair game can end in ruin — with an interactive simulation.',
};
