---
name: accessibility-check
description: Perform comprehensive accessibility audit on codebase covering HTML semantics, color contrast, keyboard nav, and forms. Use when user asks for a11y audit, accessibility check, or WCAG compliance.
---

1. DETECT FILES TO CHECK
   - Find HTML, JSX, TSX, Vue, Svelte files
   - Focus on components with user interaction

2. RUN CHECKS (all categories):

   a) SEMANTIC HTML / ARIA:
      - Missing alt on images
      - Button/links without accessible names
      - Missing form labels
      - Invalid ARIA attributes
      - Non-semantic elements (divs as buttons)
   
   b) COLOR CONTRAST:
      - Check inline styles, CSS variables
      - Flag low contrast combinations (< 4.5:1 normal, < 3:1 large)
      - Note: may need runtime tools for computed styles

   c) KEYBOARD NAVIGATION:
      - Missing focus styles
      - Non-interactive elements with onclick
      - Missing skip links
   
   d) FORMS:
      - Missing labels or aria-label
      - Error messages not associated with inputs
      - Placeholder-only labels

3. OUTPUT

   QUICK SUMMARY (top 5 critical issues):
   1. [FILE] Issue - WCAG criterion - Quick fix
   
   FULL DETAILS:
   ### Semantic HTML (X issues)
   | File | Line | Issue | WCAG | Fix |
   
   ### Color Contrast (X issues)
   | File | Element | Ratio | Needed |
   
   ### Keyboard Nav (X issues)
   | File | Line | Issue |
   
   ### Forms (X issues)
   | File | Line | Issue | Fix |

4. SUGGEST FIXES
   - Provide corrected code snippet for each issue
   - Group similar issues for batch fixes
