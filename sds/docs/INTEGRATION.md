# Integration Guide - Simplify Design System

## 🔗 Integrating SDS into Your Next.js Project

### Step 1: Import SDS Styles in Your App

In [src/app/globals.css](../../src/app/globals.css):

```css
/* Import Simplify Design System Tokens */
@import "sds/tokens/colors.css";
@import "sds/tokens/spacing.css";
@import "sds/tokens/typography.css";
@import "sds/tokens/motion.css";

/* Import SDS Components */
@import "sds/components/button.css";
@import "sds/components/input.css";
@import "sds/components/language-selector.css";
@import "sds/components/card.css";
@import "sds/components/progress.css";
```

### Step 2: Update Your Layout

In [src/app/layout.tsx](../../src/app/layout.tsx):

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simplify",
  description: "Vereinfacht komplexe Behörden- und Rechtstexte",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        {children}
      </body>
    </html>
  );
}
```

### Step 3: Use SDS Components

#### Button Component
```tsx
export default function MyPage() {
  return (
    <button className="sds-button" onClick={() => alert('Clicked!')}>
      Upload Document
    </button>
  );
}
```

#### Language Selector
```tsx
'use client';

import { useState } from 'react';

export default function LanguageSwitcher() {
  const [selected, setSelected] = useState('de');
  
  const languages = [
    { code: 'de', label: 'Deutsch' },
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
  ];
  
  return (
    <div className="sds-language-selector" role="group">
      {languages.map(lang => (
        <button
          key={lang.code}
          className="sds-language-btn"
          aria-pressed={selected === lang.code}
          onClick={() => setSelected(lang.code)}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
```

#### Form Input
```tsx
export default function DocumentUpload() {
  return (
    <div className="sds-input-group">
      <label className="sds-input-group__label" htmlFor="doc">
        Upload Document
        <span className="sds-input-group__required" aria-label="required">*</span>
      </label>
      <input
        className="sds-input"
        id="doc"
        type="file"
        accept=".pdf,.txt,image/*"
        aria-describedby="help"
      />
      <small className="sds-input-group__hint" id="help">
        PDF, Text, or Image files up to 25MB
      </small>
    </div>
  );
}
```

#### Progress Indicator
```tsx
'use client';

import { useState, useEffect } from 'react';

export default function ProgressExample() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 10, 100));
    }, 500);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="sds-progress">
      <label className="sds-progress__label">Processing</label>
      <div 
        className="sds-progress__bar"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div 
          className="sds-progress__fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="sds-progress__text">{progress}%</span>
    </div>
  );
}
```

## 🎨 Theming & Customization

### Override CSS Variables

Create a custom theme in your CSS:

```css
:root {
  /* Brand Colors */
  --sds-color-bg-primary: #F6F4EF;
  --sds-color-text-primary: #3E3A36;
  
  /* Spacing (8px Grid) */
  --sds-space-4: 16px;
  --sds-space-6: 24px;
  
  /* Motion */
  --sds-motion-duration-productive: 200ms;
  --sds-motion-ease-productive: cubic-bezier(0.25, 0.1, 0.25, 1.0);
  
  /* Border Radius */
  --sds-radius-md: 10px;
  --sds-radius-lg: 12px;
  
  /* Shadows */
  --sds-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
}
```

## ♿ Accessibility Integration

### Screen Reader Labels
```tsx
<button 
  className="sds-button"
  aria-label="Upload and simplify document"
  aria-describedby="button-help"
>
  Upload
</button>
<small id="button-help">Drag PDF, text, or image files</small>
```

### Keyboard Navigation
```tsx
// Components handle Tab, Enter, Escape, Arrows automatically
// Just use proper semantic HTML and ARIA

<button className="sds-button">
  Click me (press Tab to focus)
</button>
```

### High Contrast Mode
```css
@media (prefers-contrast: more) {
  .sds-button {
    border: 2px solid var(--sds-color-text-primary);
  }
}
```

### Respects Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  .sds-button {
    transition: none; /* Automatically handled by SDS */
  }
}
```

## 🌐 Multi-Language Implementation

### HTML Direction
```tsx
export default function App({ params }: { params: { lang: string } }) {
  const isRTL = ['ar', 'he', 'fa'].includes(params.lang);
  
  return (
    <html lang={params.lang} dir={isRTL ? 'rtl' : 'ltr'}>
      <body>
        {/* Content */}
      </body>
    </html>
  );
}
```

### Language-Specific Fonts
```css
[lang="ar"],
[lang="he"],
[lang="fa"] {
  font-family: 'Cairo', 'Traditional Arabic', sans-serif;
  line-height: 1.7;
}

[lang="zh"],
[lang="ja"],
[lang="ko"] {
  font-family: 'Noto Sans CJK', sans-serif;
  letter-spacing: normal;
}
```

## 📊 Component API Reference

### Button
```tsx
<button className="sds-button [sds-button--secondary] [sds-button--sm] [sds-button--lg]">
  Label
</button>
```

**Props:**
- `sds-button` - Default primary style
- `sds-button--secondary` - Ghost/outline style
- `sds-button--sm` - Small padding
- `sds-button--lg` - Large padding

### Input
```tsx
<div className="sds-input-group">
  <label className="sds-input-group__label">Label</label>
  <input className="sds-input [sds-input--error]" />
  <small className="sds-input-group__hint">Help text</small>
  <small className="sds-input-group__error">Error message</small>
</div>
```

### Language Selector
```tsx
<div className="sds-language-selector" role="group">
  <button className="sds-language-btn" aria-pressed="true">Label</button>
</div>
```

### Card
```tsx
<div className="sds-card [sds-card--success] [sds-card--alert]">
  <div className="sds-card__header">
    <h3 className="sds-card__title">Title</h3>
    <span className="sds-card__meta">Meta info</span>
  </div>
  <div className="sds-card__body">
    <p className="sds-card__content">Content</p>
  </div>
</div>
```

### Progress
```tsx
<div className="sds-progress [sds-progress--sm] [sds-progress--lg]">
  <label className="sds-progress__label">Label</label>
  <div className="sds-progress__bar">
    <div className="sds-progress__fill" style={{ width: '65%' }}></div>
  </div>
  <span className="sds-progress__text">65%</span>
</div>
```

## 🧪 Testing SDS Components

### Unit Test Example (Vitest)
```tsx
import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  it('should have visible focus indicator', () => {
    render(<button className="sds-button">Click</button>);
    const btn = screen.getByRole('button');
    btn.focus();
    
    expect(btn).toHaveFocus();
    expect(window.getComputedStyle(btn).outline).toBeDefined();
  });
  
  it('should support ARIA labels', () => {
    render(
      <button className="sds-button" aria-label="Upload">
        Upload
      </button>
    );
    
    expect(screen.getByLabelText('Upload')).toBeInTheDocument();
  });
});
```

### Accessibility Testing (axe)
```tsx
import { axe, toHaveNoViolations } from 'jest-axe';

test('Button component has no accessibility violations', async () => {
  const { container } = render(
    <button className="sds-button">Click me</button>
  );
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 📦 Deployment

### Build Optimization
```json
{
  "scripts": {
    "build": "next build",
    "analyze": "ANALYZE=true next build"
  }
}
```

### CSS Purging
SDS uses native CSS variables, which are fully tree-shakeable:
- Only import used component files
- Unused tokens are automatically removed
- Final bundle: ~8-12kb gzipped

## 🔗 Resources

- [Main Documentation](../README.md)
- [Accessibility Guide](../docs/ACCESSIBILITY.md)
- [Component Examples](./index.html)
- [Manifest](../../simplify-sds-manifest.json)

## 🤝 Support

For issues or questions:
1. Check [ACCESSIBILITY.md](../docs/ACCESSIBILITY.md)
2. Review [examples/index.html](./index.html)
3. File an issue on GitHub
4. Contact: simplify@example.com
