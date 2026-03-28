---
name: performance-profile
description: Analyze code for bundle and runtime performance issues including framework-specific patterns. Use when user asks to check performance, profile, or optimize speed.
---

1. DETECT PROJECT TYPE & TOOLS
   - Check for webpack/vite/esbuild configs
   - Check for React/Vue/Svelte/Angular usage
   - Detect Next.js, Nuxt, SvelteKit patterns
   - Look for existing perf tools (bundle-analyzer, lighthouse)

2. BUNDLE ANALYSIS (if tools found)
   - Run webpack-bundle-analyzer / vite-bundle-analyzer
   - Identify:
     * Large dependencies
     * Duplicate code
     * Unused exports
     * Missing code splitting

3. FRAMEWORK-SPECIFIC PATTERNS
   a) Next.js / Nuxt / SvelteKit:
      - Client-side data fetching in SSR pages
      - Missing getStaticProps/getServerSideProps optimization
      - Large bundle in _app/_document
      - Image optimization missing
   
   b) React:
      - getServerSideProps equivalent issues
      - Missing dynamic imports for routes
   
   c) Vue/Svelte:
      - SSR data fetching anti-patterns
   
4. RUNTIME ANALYSIS (static + tool-based)

   a) EXPENSIVE COMPUTATIONS:
      - Nested loops, O(n²) patterns
      - Unoptimized algorithms
      - Missing memoization
   
   b) N+1 QUERIES:
      - Loop-based database calls
      - Missing eager loading
      - ORM N+1 patterns
   
   c) UNNECESSARY RE-RENDERS (React/Vue):
      - Missing dependency arrays
      - Object/array creation in render
      - Missing React.memo/vue.memo
   
   d) MEMORY LEAKS:
      - Unclosed event listeners
      - setInterval without clear
      - Detached DOM references
   
   e) SYNC OPERATIONS:
      - Large synchronous loops
      - Blocking main thread

5. OUTPUT

   QUICK SUMMARY (top 5 by impact):
   1. [FILE] Issue - Est. impact - Fix
   
   FULL ANALYSIS:
   ### Bundle Issues (X found)
   | File/Package | Size | Issue | Recommendation |
   
   ### Framework Issues (X found)
   | File | Pattern | Issue | Recommendation |
   
   ### Runtime Issues (X found)
   | File | Line | Pattern | Impact |
   
   ### Suggested Optimizations
   - [ ] Fix 1
   - [ ] Fix 2

6. APPLY FIXES (if requested)
   - Show before/after code
   - Prioritize by impact
