---
name: optimize-dependencies
description: Analyze project dependencies for outdated, unused, duplicate, circular, or security-vulnerable packages. Use when user asks to optimize, audit, or check dependencies.
---

1. DETECT PROJECT TYPE
   - Check for package.json, requirements.txt, Cargo.toml, go.mod, etc.
   - Use appropriate package manager (npm/yarn/pnpm, pip, cargo, go)

2. AUDIT DEPENDENCIES
   a) Outdated packages:
      - List current vs latest version
      - Flag major version bumps (breaking changes)
   b) Unused dependencies:
      - Scan import/require statements across codebase
      - Flag packages in package.json but not referenced
   c) Duplicate packages:
      - Check for multiple versions of same package
   d) Circular dependencies:
      - Detect circular import chains
   e) Security vulnerabilities:
      - Run `npm audit` / `pip audit` / cargo audit
      - Flag known CVEs, typosquatting risks

3. OUTPUT
   Present two sections:
   
   QUICK SUMMARY (top 5 actions by priority):
   - [ ] Action 1
   - [ ] Action 2
   
   FULL ANALYSIS:
   ### Outdated (X packages)
   | Package | Current | Latest | Breaking |
   
   ### Unused (X packages)  
   | Package | Reason |
   
   ### Duplicates (X packages)
   | Package | Versions found |
   
   ### Circular (X chains)
   | Chain | Impact |
   
   ### Security (X issues)
   | Package | CVE/Issue | Severity |

4. APPLY FIXES (if requested)
   - Remove unused deps (with confirmation)
   - Update versions in config
   - Run install to verify
