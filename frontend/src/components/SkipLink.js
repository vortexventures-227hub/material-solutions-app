import React from 'react';

/**
 * SkipLink — Accessibility: Skip to main content for keyboard users
 * WCAG 2.1 Success Criterion 2.4.1 (Bypass Blocks)
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link"
      onClick={(e) => {
        e.preventDefault();
        const main = document.getElementById('main-content');
        if (main) {
          main.focus();
          main.scrollIntoView({ behavior: 'smooth' });
        }
      }}
    >
      Skip to main content
    </a>
  );
}

export default SkipLink;
