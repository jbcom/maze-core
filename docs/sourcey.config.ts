import { defineConfig, markdown } from 'sourcey';

export default defineConfig({
  name: 'seeded-maze',
  siteUrl: 'https://jonbogaty.com',
  baseUrl: '/seeded-maze',
  theme: {
    preset: 'default',
    colors: {
      primary: '#1f4d3a',
      light: '#3f8f6b',
      dark: '#0e2a1f',
    },
    fonts: {
      sans: 'system-ui, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    },
    layout: {
      sidebar: '17rem',
      toc: '18rem',
      content: '46rem',
    },
    css: ['./brand.css'],
  },
  logo: { light: './assets/favicon.svg', href: '/seeded-maze/' },
  favicon: './assets/favicon.svg',
  repo: 'https://github.com/jbcom/seeded-maze',
  editBranch: 'main',
  editBasePath: 'docs',
  prettyUrls: 'slash',
  navbar: {
    links: [
      { type: 'github', href: 'https://github.com/jbcom/seeded-maze' },
      { type: 'npm', href: 'https://www.npmjs.com/package/seeded-maze' },
    ],
  },
  footer: {
    links: [
      {
        type: 'link',
        label: 'MIT License',
        href: 'https://github.com/jbcom/seeded-maze/blob/main/LICENSE',
      },
      {
        type: 'link',
        label: 'Security',
        href: 'https://github.com/jbcom/seeded-maze/security/policy',
      },
    ],
  },
  navigation: {
    tabs: [
      {
        tab: 'Documentation',
        slug: '',
        source: markdown({
          groups: [
            {
              group: 'Getting Started',
              pages: ['introduction', 'getting-started'],
            },
            {
              group: 'Reference',
              pages: ['API', 'ARCHITECTURE'],
            },
            {
              group: 'Project',
              pages: ['contributing', 'release-history'],
            },
          ],
        }),
      },
    ],
  },
});
