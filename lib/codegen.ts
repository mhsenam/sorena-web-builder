import { SitePlan, GeneratedFiles, BuildRequest } from './validation'

function renderHtml(plan: SitePlan): string {
  const isRTL = plan.meta.language === 'fa'
  const sections = plan.sections.map(section => {
    switch(section.type) {
      case 'hero':
        return `
    <section id="${section.id}" class="hero">
      <h1>${section.props.title || 'Welcome'}</h1>
      <p>${section.props.subtitle || ''}</p>
      ${section.props.cta ? `<button class="cta-button">${section.props.cta}</button>` : ''}
    </section>`
      case 'features':
        return `
    <section id="${section.id}" class="features">
      <h2>${section.props.title || 'Features'}</h2>
      <div class="features-grid">
        ${(section.props.items || []).map((item: any) => `
        <div class="feature-item">
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </div>`).join('')}
      </div>
    </section>`
      case 'contact':
        return `
    <section id="${section.id}" class="contact">
      <h2>${section.props.title || 'Contact'}</h2>
      <p>${section.props.email || ''}</p>
      <p>${section.props.phone || ''}</p>
      <p>${section.props.address || ''}</p>
    </section>`
      default:
        return `
    <section id="${section.id}" class="${section.type}">
      <pre>${JSON.stringify(section.props, null, 2)}</pre>
    </section>`
    }
  }).join('\n')

  return `<!DOCTYPE html>
<html lang="${plan.meta.language}" ${isRTL ? 'dir="rtl"' : ''}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${plan.meta.title}</title>
  <meta name="description" content="${plan.meta.description}">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main>
${sections}
  </main>
  <script src="main.js"></script>
</body>
</html>`
}

function renderCss(plan: SitePlan): string {
  const colors = plan.style.colors
  const font = plan.style.font || 'system-ui, -apple-system, sans-serif'
  
  return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: ${font};
  color: ${colors.text || '#333'};
  background: ${colors.background || '#fff'};
  line-height: 1.6;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

section {
  margin: 40px 0;
  padding: 20px;
}

.hero {
  text-align: center;
  padding: 60px 20px;
  background: ${colors.primary || '#007bff'};
  color: white;
  border-radius: 8px;
}

.hero h1 {
  font-size: 2.5em;
  margin-bottom: 20px;
}

.cta-button {
  background: white;
  color: ${colors.primary || '#007bff'};
  padding: 12px 30px;
  border: none;
  border-radius: 5px;
  font-size: 1.1em;
  cursor: pointer;
  margin-top: 20px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 30px;
}

.feature-item {
  padding: 20px;
  background: ${colors.secondary || '#f8f9fa'};
  border-radius: 8px;
}

.contact {
  background: ${colors.secondary || '#f8f9fa'};
  padding: 40px;
  border-radius: 8px;
}`
}

function renderJs(plan: SitePlan): string {
  return `// Site initialization
document.addEventListener('DOMContentLoaded', function() {
  console.log('Site loaded: ${plan.meta.title}');
  
  // Add smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});`
}

function renderReactApp(plan: SitePlan): string {
  const sections = plan.sections.map(section => {
    switch(section.type) {
      case 'hero':
        return `
  const Hero = () => (
    <section className="hero">
      <h1>${section.props.title || 'Welcome'}</h1>
      <p>${section.props.subtitle || ''}</p>
      ${section.props.cta ? `<button className="cta-button">${section.props.cta}</button>` : ''}
    </section>
  );`
      case 'features':
        return `
  const Features = () => (
    <section className="features">
      <h2>${section.props.title || 'Features'}</h2>
      <div className="features-grid">
        ${JSON.stringify(section.props.items || [])}
      </div>
    </section>
  );`
      default:
        return ''
    }
  }).filter(Boolean).join('\n')

  return `import React from 'react';
import './App.css';

function App() {
  ${sections}

  return (
    <div className="App">
      <Hero />
      <Features />
    </div>
  );
}

export default App;`
}

function renderNextPage(plan: SitePlan): string {
  return `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">${plan.meta.title}</h1>
        <p className="text-xl mb-8">${plan.meta.description}</p>
        ${plan.sections.map(section => `
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">${section.props.title || section.type}</h2>
          <pre className="bg-gray-100 p-4 rounded">${JSON.stringify(section.props, null, 2)}</pre>
        </section>`).join('')}
      </div>
    </main>
  );
}`
}

function baseLayout(plan: SitePlan): string {
  return `import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '${plan.meta.title}',
  description: '${plan.meta.description}',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="${plan.meta.language}" ${plan.meta.language === 'fa' ? 'dir="rtl"' : ''}>
      <body>{children}</body>
    </html>
  )
}`
}

function tailwindBase(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;`
}

function tailwindConfig(plan: SitePlan): string {
  return `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: ${JSON.stringify(plan.style.colors, null, 2)}
    },
  },
  plugins: [],
}
export default config`
}

function basicPkgJson(framework: string): string {
  const deps = framework === 'react' 
    ? {
        "react": "^18.0.0",
        "react-dom": "^18.0.0",
        "react-scripts": "5.0.1"
      }
    : {
        "next": "^14.0.0",
        "react": "^18.0.0",
        "react-dom": "^18.0.0"
      }
  
  return JSON.stringify({
    name: "generated-site",
    version: "1.0.0",
    private: true,
    scripts: framework === 'react' 
      ? {
          "start": "react-scripts start",
          "build": "react-scripts build",
          "test": "react-scripts test",
          "eject": "react-scripts eject"
        }
      : {
          "dev": "next dev",
          "build": "next build",
          "start": "next start",
          "lint": "next lint"
        },
    dependencies: deps
  }, null, 2)
}

export function buildFilesFromPlan(plan: SitePlan, framework: BuildRequest['framework']): GeneratedFiles {
  if (framework === 'vanilla') {
    const html = renderHtml(plan)
    const css = renderCss(plan)
    const js = renderJs(plan)
    return { 
      files: [
        { path: 'index.html', content: html },
        { path: 'styles.css', content: css },
        { path: 'main.js', content: js },
      ]
    }
  }
  
  if (framework === 'react') {
    const pkg = basicPkgJson('react')
    return { 
      files: [
        { path: 'package.json', content: pkg },
        { path: 'src/App.jsx', content: renderReactApp(plan) },
        { path: 'src/main.jsx', content: `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
createRoot(document.getElementById('root')).render(<App/>);` },
        { path: 'public/index.html', content: `<!DOCTYPE html>
<html lang="${plan.meta.language}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${plan.meta.title}</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>` },
        { path: 'src/App.css', content: renderCss(plan) }
      ]
    }
  }
  
  // Next.js
  const pkg = basicPkgJson('next')
  return { 
    files: [
      { path: 'package.json', content: pkg },
      { path: 'app/page.tsx', content: renderNextPage(plan) },
      { path: 'app/layout.tsx', content: baseLayout(plan) },
      { path: 'app/globals.css', content: tailwindBase() },
      { path: 'tailwind.config.ts', content: tailwindConfig(plan) },
    ]
  }
}