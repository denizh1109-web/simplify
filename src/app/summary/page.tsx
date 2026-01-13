'use client';

import { useState } from 'react';

interface SummaryContent {
  original: string;
  simplified: string;
  language: string;
  confidence: number;
}

const SAMPLE_CONTENT: SummaryContent = {
  original: `"The applicant must furnish evidence of continuous residence within the jurisdictional boundaries for a period not less than twenty-four (24) consecutive months immediately preceding the date of submission of the application, demonstrating domicile establishment through documentation such as utility bills, rental agreements, or municipal tax records."`,
  simplified: `"You need to show you have lived in this area for at least 2 years before applying. You can use water/electric bills, lease papers, or tax forms as proof."`,
  language: 'English',
  confidence: 94
};

export default function SummaryPage() {
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const languages = [
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'de', name: 'Deutsch', dir: 'ltr' },
    { code: 'ar', name: 'العربية', dir: 'rtl' },
    { code: 'es', name: 'Español', dir: 'ltr' },
  ];

  const handleLanguageChange = (lang: typeof languages[0]) => {
    setSelectedLanguage(lang.name);
    setDirection(lang.dir as 'ltr' | 'rtl');
  };

  return (
    <div className="sds-summary" dir={direction}>
      <header className="sds-summary__header">
        <div className="sds-summary__header-content">
          <h1 className="sds-heading sds-heading--h2">Document Summary</h1>
          <p className="sds-text sds-text--secondary">
            Compare original government language with simplified version
          </p>
        </div>
        <div className="sds-summary__language-selector">
          <label className="sds-text sds-text--label">Language</label>
          <div className="sds-language-buttons">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`sds-btn sds-btn--sm ${selectedLanguage === lang.name ? '' : 'sds-btn--secondary'}`}
                onClick={() => handleLanguageChange(lang)}
                aria-pressed={selectedLanguage === lang.name}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="sds-summary__main">
        <div className="sds-summary__columns">
          {/* Original / Government Speak */}
          <section className="sds-summary__column">
            <div className="sds-summary__column-header">
              <h2 className="sds-heading sds-heading--h3">Government Speak</h2>
              <span className="sds-badge">Official</span>
            </div>
            <div className="sds-card sds-summary__content-card">
              <p className="sds-text sds-text--primary sds-summary__text">
                {SAMPLE_CONTENT.original}
              </p>
              <div className="sds-summary__footer">
                <p className="sds-text sds-text--metadata">
                  Original government document language
                </p>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="sds-summary__divider" />

          {/* Simplified */}
          <section className="sds-summary__column">
            <div className="sds-summary__column-header">
              <h2 className="sds-heading sds-heading--h3">Simplified English</h2>
              <span className="sds-badge sds-badge--success">✓ {SAMPLE_CONTENT.confidence}% Clear</span>
            </div>
            <div className="sds-card sds-summary__content-card sds-summary__content-card--simplified">
              <p className="sds-text sds-text--primary sds-summary__text sds-summary__text--simplified">
                {SAMPLE_CONTENT.simplified}
              </p>
              <div className="sds-summary__footer">
                <p className="sds-text sds-text--metadata">
                  Easy-to-understand version for everyone
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Key Differences */}
        <section className="sds-summary__section">
          <h2 className="sds-heading sds-heading--h3">Key Differences</h2>
          <div className="sds-differences">
            <div className="sds-card sds-difference-item">
              <div className="sds-difference-item__label">Removed Jargon</div>
              <div className="sds-difference-item__example">
                <p className="sds-text sds-text--secondary">
                  <strong>"jurisdictional boundaries"</strong> → <strong>"this area"</strong>
                </p>
              </div>
            </div>
            <div className="sds-card sds-difference-item">
              <div className="sds-difference-item__label">Shortened Duration</div>
              <div className="sds-difference-item__example">
                <p className="sds-text sds-text--secondary">
                  <strong>"24 consecutive months"</strong> → <strong>"2 years"</strong>
                </p>
              </div>
            </div>
            <div className="sds-card sds-difference-item">
              <div className="sds-difference-item__label">Concrete Examples</div>
              <div className="sds-difference-item__example">
                <p className="sds-text sds-text--secondary">
                  Lists specific documents: utility bills, lease papers, tax forms
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Accessibility Info */}
        <section className="sds-summary__section">
          <h2 className="sds-heading sds-heading--h3">Accessibility Info</h2>
          <div className="sds-accessibility-info">
            <div className="sds-card">
              <h3 className="sds-heading sds-heading--h4">Contrast Ratio</h3>
              <p className="sds-text sds-text--primary">
                ✓ 11.3:1 on text (WCAG 2.2 AAA compliant)
              </p>
            </div>
            <div className="sds-card">
              <h3 className="sds-heading sds-heading--h4">Reading Level</h3>
              <p className="sds-text sds-text--primary">
                Grade 6 (simplified from Grade 16+)
              </p>
            </div>
            <div className="sds-card">
              <h3 className="sds-heading sds-heading--h4">RTL Support</h3>
              <p className="sds-text sds-text--primary">
                Full support for Arabic, Hebrew, Farsi
              </p>
            </div>
          </div>
        </section>
      </main>

      <div className="sds-summary__actions">
        <button className="sds-btn sds-btn--secondary">← Back</button>
        <button className="sds-btn">Download PDF</button>
        <button className="sds-btn">Share</button>
      </div>

      <style jsx>{`
        .sds-summary {
          min-height: 100vh;
          background-color: var(--sds-bg);
          color: var(--sds-text);
          padding: var(--sds-space-lg);
        }

        .sds-summary__header {
          max-width: 1400px;
          margin: 0 auto var(--sds-space-2xl);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--sds-space-lg);
        }

        .sds-summary__header-content h1 {
          margin-bottom: var(--sds-space-sm);
        }

        .sds-summary__language-selector {
          display: flex;
          flex-direction: column;
          gap: var(--sds-space-sm);
        }

        .sds-language-buttons {
          display: flex;
          gap: var(--sds-space-sm);
        }

        .sds-summary__main {
          max-width: 1400px;
          margin: 0 auto;
        }

        .sds-summary__columns {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: var(--sds-space-lg);
          margin-bottom: var(--sds-space-2xl);
        }

        .sds-summary__column {
          display: flex;
          flex-direction: column;
          gap: var(--sds-space-md);
        }

        .sds-summary__column-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--sds-space-md);
        }

        .sds-summary__column-header h2 {
          margin: 0;
        }

        .sds-summary__content-card {
          min-height: 300px;
          display: flex;
          flex-direction: column;
        }

        .sds-summary__content-card--simplified {
          background-color: rgba(199, 161, 138, 0.05);
        }

        .sds-summary__text {
          flex: 1;
          margin: 0;
          line-height: 1.8;
          word-spacing: 0.1em;
        }

        .sds-summary__text--simplified {
          font-size: 16px;
          color: var(--sds-text);
        }

        .sds-summary__footer {
          margin-top: var(--sds-space-md);
          padding-top: var(--sds-space-md);
          border-top: 1px solid var(--sds-divider);
        }

        .sds-summary__divider {
          width: 1px;
          background-color: var(--sds-divider);
          margin: var(--sds-space-md) 0;
        }

        .sds-summary__section {
          margin-bottom: var(--sds-space-2xl);
        }

        .sds-summary__section h2 {
          margin-bottom: var(--sds-space-lg);
        }

        .sds-differences {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--sds-space-md);
        }

        .sds-difference-item {
          padding: var(--sds-space-md);
        }

        .sds-difference-item__label {
          font-weight: 600;
          color: var(--sds-accent-clay);
          margin-bottom: var(--sds-space-sm);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .sds-difference-item__example {
          margin: 0;
        }

        .sds-accessibility-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--sds-space-md);
        }

        .sds-summary__actions {
          max-width: 1400px;
          margin: var(--sds-space-2xl) auto 0;
          display: flex;
          gap: var(--sds-space-md);
          justify-content: center;
          padding-top: var(--sds-space-lg);
          border-top: 1px solid var(--sds-divider);
        }

        @media (max-width: 1024px) {
          .sds-summary__columns {
            grid-template-columns: 1fr;
          }

          .sds-summary__divider {
            display: none;
          }

          .sds-summary__header {
            flex-direction: column;
          }
        }

        @media (max-width: 768px) {
          .sds-summary {
            padding: var(--sds-space-md);
          }

          .sds-language-buttons {
            flex-wrap: wrap;
          }

          .sds-differences {
            grid-template-columns: 1fr;
          }

          .sds-summary__actions {
            flex-direction: column;
          }

          .sds-btn {
            width: 100%;
          }
        }

        /* RTL Adjustments */
        [dir="rtl"] .sds-summary__header {
          flex-direction: row-reverse;
        }

        [dir="rtl"] .sds-summary__column-header {
          flex-direction: row-reverse;
        }

        [dir="rtl"] .sds-summary__divider {
          margin: var(--sds-space-md) auto;
        }
      `}</style>
    </div>
  );
}
