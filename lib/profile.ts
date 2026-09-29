const details = {
  name: 'Beka Sokurashvili',
  role: '.NET Developer',
  siteUrl: 'https://bsokur.dev',
  headline: '.NET Developer · Backend & Distributed Systems',
  location: 'Tbilisi, Georgia',
  bio: 'Software Developer with hands-on experience building modular monolith and microservices-based backend systems for healthcare, banking and casino platforms. Comfortable across the full request lifecycle, including API design, messaging, data persistence, and cloud deployment, with working knowledge of both Azure and AWS. Detail - oriented, quick to ramp up on new codebases, and focused on writing clean, testable, production- ready code.',
  email: 'beka.sokurashvili@gmail.com',
  phone: '+995 555 579 970',
  githubUsername: 'bsokur',
  devUsername: 'bsokur',
  linkedin: 'https://www.linkedin.com/in/beka-sokurashvili/',
  technologies: ['C#', '.NET', 'PostgreSQL', 'Azure', 'AWS', 'React'],
  capabilities: ['API design', 'Microservices', 'Modular monoliths', 'Asynchronous messaging'],
};

export const profile = {
  ...details,
  initials: details.name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .toLowerCase(),
  phoneHref: `tel:${details.phone.replace(/[^+\d]/g, '')}`,
  github: `https://github.com/${encodeURIComponent(details.githubUsername)}`,
  dev: `https://dev.to/${encodeURIComponent(details.devUsername)}`,
};
