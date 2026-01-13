'use client';

import { useState } from 'react';

export default function HomePage() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [history] = useState([
    {
      id: 1,
      name: 'Residency Application Form',
      date: '2025-01-10',
      status: 'completed',
      simplificationScore: 92,
      size: '2.5 MB'
    },
    {
      id: 2,
      name: 'Health Insurance Policy',
      date: '2025-01-08',
      status: 'completed',
      simplificationScore: 87,
      size: '1.8 MB'
    },
    {
      id: 3,
      name: 'Tax Declaration Document',
      date: '2025-01-05',
      status: 'completed',
      simplificationScore: 94,
      size: '0.9 MB'
    },
  ]);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    const html = document.documentElement;
    
    if (newTheme === 'system') {
      html.removeAttribute('data-theme');
    } else {
      html.setAttribute('data-theme', newTheme);
    }
  };

  return (
    <div className="sds-home">
      <header className="sds-header">
        <div className="sds-header__container">
          <h1 className="sds-heading sds-heading--h1">simplify</h1>
          <div className="sds-header__actions">
            <div className="sds-theme-switcher">
              <label className="sds-text sds-text--label">Theme</label>
              <div className="sds-theme-buttons">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    className={`sds-btn sds-btn--sm ${theme === t ? '' : 'sds-btn--secondary'}`}
                    onClick={() => handleThemeChange(t)}
                    aria-pressed={theme === t}
                  >
                    {t === 'light' && '☀️'}
                    {t === 'dark' && '🌙'}
                    {t === 'system' && '⚙️'}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="sds-main">
        <section className="sds-section">
          <div className="sds-hero">
            <h2 className="sds-heading sds-heading--h2">Welcome Back</h2>
            <p className="sds-text sds-text--primary">
              Continue simplifying government documents in your language
            </p>
          </div>

          <button className="sds-btn sds-btn--lg" style={{ width: '100%', justifyContent: 'center' }}>
            + New Document
          </button>
        </section>

        <section className="sds-section">
          <h3 className="sds-heading sds-heading--h3">Recent Documents</h3>
          <div className="sds-history">
            {history.map((doc) => (
              <div key={doc.id} className="sds-card sds-card--interactive">
                <div className="sds-document-header">
                  <div>
                    <h4 className="sds-heading sds-heading--h4">{doc.name}</h4>
                    <p className="sds-text sds-text--secondary">{doc.date} · {doc.size}</p>
                  </div>
                  <div className="sds-badge sds-badge--success">
                    ✓ {doc.simplificationScore}% Clear
                  </div>
                </div>
                <div className="sds-document-progress">
                  <div className="sds-progress-bar">
                    <div
                      className="sds-progress-fill"
                      style={{ width: `${doc.simplificationScore}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="sds-section">
          <h3 className="sds-heading sds-heading--h3">Supported Languages</h3>
          <div className="sds-language-grid">
            {['Deutsch', 'English', 'العربية', 'Español', 'Português', 'Türkçe'].map((lang) => (
              <div key={lang} className="sds-card">
                <p className="sds-text sds-text--label">{lang}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <style jsx>{`
        .sds-home {
          min-height: 100vh;
          background-color: var(--sds-bg);
          color: var(--sds-text);
        }

        .sds-header {
          background-color: var(--sds-surface);
          border-bottom: 1px solid var(--sds-divider);
          padding: var(--sds-space-lg);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .sds-header__container {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sds-header__actions {
          display: flex;
          gap: var(--sds-space-md);
          align-items: center;
        }

        .sds-theme-switcher {
          display: flex;
          flex-direction: column;
          gap: var(--sds-space-sm);
        }

        .sds-theme-buttons {
          display: flex;
          gap: var(--sds-space-sm);
        }

        .sds-main {
          max-width: 1280px;
          margin: 0 auto;
          padding: var(--sds-space-2xl);
        }

        .sds-section {
          margin-bottom: var(--sds-space-2xl);
        }

        .sds-hero {
          margin-bottom: var(--sds-space-xl);
        }

        .sds-hero h2 {
          margin-bottom: var(--sds-space-md);
        }

        .sds-history {
          display: flex;
          flex-direction: column;
          gap: var(--sds-space-md);
          margin-top: var(--sds-space-lg);
        }

        .sds-document-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--sds-space-md);
          margin-bottom: var(--sds-space-md);
        }

        .sds-document-header h4 {
          margin-bottom: var(--sds-space-sm);
        }

        .sds-document-progress {
          margin-top: var(--sds-space-md);
        }

        .sds-progress-bar {
          width: 100%;
          height: 8px;
          background-color: var(--sds-divider);
          border-radius: var(--sds-radius-full);
          overflow: hidden;
        }

        .sds-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--sds-accent-clay), var(--sds-accent-rose));
          border-radius: var(--sds-radius-full);
          transition: width var(--sds-duration-productive) var(--sds-ease-productive);
        }

        .sds-language-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: var(--sds-space-md);
          margin-top: var(--sds-space-lg);
        }

        .sds-btn--sm {
          padding: var(--sds-space-sm) var(--sds-space-md);
          font-size: 13px;
        }

        .sds-btn--lg {
          padding: var(--sds-space-lg) var(--sds-space-xl);
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .sds-header__container {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--sds-space-lg);
          }

          .sds-main {
            padding: var(--sds-space-md);
          }

          .sds-language-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          }

          .sds-document-header {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
