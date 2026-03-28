---
name: suggest-commit
description: Suggest a concise commit message based on staged changes or provided files. Use when user says "suggest commit" or "commit message", or when another skill requests a commit message for specific files.
---

When asked to suggest a commit message:

1. If the user provides a list of files (via `files` parameter), use those files directly. Otherwise:
    - Run `git diff --cached --name-only` to see which files are staged
    - Run `git diff --cached` to see the actual changes
2. Run `git log --oneline -5` to understand the commit style used in this project
3. Analyze the changes and write ONE line that:
    - Be concise (under 72 characters) and remove any redundant text
    - Uses imperative mood ("Add", "Fix", "Update", not "Added", "Fixed")
    - Focuses on the *what* and *why*, NOT the *how* (describe the purpose/result, not the file contents or
      implementation details)
4. If Conventional Commits are used in this project, prefix appropriately (feat:, fix:, docs:, etc.)
5. Present only the commit message without explanation
6. Iteratively improve the message yourself until it is concise, clear, and removes all redundant text. If reaching
   iteration 6, stop and present the result.
