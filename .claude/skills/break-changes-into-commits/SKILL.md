---
name: break-changes-into-commits
description: Analyze git changes and group them into logical commits. Use when user wants to split changes into multiple commits or understand how to best organize their changes.
---

When asked to break changes into commits or organize git changes, follow this three-phase workflow.

## Phase 1: Create & Present Plan

### 1.1 Gather all changes

Run these commands in parallel:

- `git status --porcelain` - all changed files (staged + unstaged)
- `git diff --name-only` - unstaged changes
- `git diff --cached --name-only` - staged changes
- `git diff` - unstaged change content
- `git diff --cached` - staged change content
- `git log --oneline -10` - recent commits for style reference

**If no changes found:** Tell the user "No changes to commit." and stop.

### 1.2 Analyze and group files

Apply these heuristics to group files into commits:

**Grouping rules (apply in priority order):**

1. **Test files** always group with their source (e.g., `foo.test.ts` with `foo.ts`)
2. **Configuration files** related to a feature group together (e.g., `package.json` changes with new dependencies)
3. **Directory-based grouping** - files in the same directory with related purpose
4. **Change type grouping** - group by what the change does:
    - New feature (feat) → group related implementation
    - Bug fix (fix) → group the fix with its tests
    - Refactor → group all refactored files
    - Documentation → group all doc changes
    - Dependencies → group all dependency changes
5. **Atomic commits** - if changes are independent and affect different concerns, keep them separate

**Be decisive:** If a file could reasonably belong to multiple commits, pick the most logical one based on primary
purpose.

### 1.3 Present the plan

Display the grouping with reasoning for each group:

```
Found X files changed. Proposed grouping:

Group 1: "commit message" [REASON]
  Files: [file1.ts, file2.ts]

Group 2: "commit message" [REASON]
  Files: [file3.css, file4.scss]

... (remaining groups)
```

### 1.4 Get plan approval

Ask: "Does this plan make sense?"

**Valid approvals:** Direct "yes", "y", "go ahead", "do it", "sure", "sounds good", "looks good", or any clear
affirmative.

**Not approvals:** "no", "n", any request for changes, any question (answer the question, then re-ask "Does this plan
make sense?"), or any ambiguous response.

**If user approves:** Proceed to Phase 2.

**If user requests changes:** Accept these modifications:

- Merge groups: "merge group 2 and 3"
- Move files: "move file X to group 1"
- Split group: "split group 2 into two"
- Remove group
- Add new group
- Reorder groups

Re-display the updated plan, then ask again: "Does this plan make sense?" Repeat until approved.

---

## Phase 2: Commit Each Group

Process groups one at a time, in order. Do not batch multiple groups into a single commit. Do not proceed to the next
group until the current one is fully committed or explicitly skipped.

### 2.1 Get approval for this group (GATE)

**This is a mandatory gate. Do not stage files, run git commands, or create commits without approval.**

Call the `suggest-commit` skill with the list of files in this group.

Present to the user:

- Files to be committed
- Proposed commit message
- Brief explanation of why these files are grouped together

Ask: "Should I commit this?"

**Wait for explicit approval before continuing.**

**Approvals are ONLY:**

- "Yes", "y", "go ahead", "do it", "commit it", "yes, commit", "sure", "sounds good"

**NOT approvals:**

- "No", "n", "not yet", "maybe", "I guess", "if you think so", or any ambiguous/conditional response
- Any request to change the message, move files, or modify the group
- Any question about the group (answer the question, then re-ask "Should I commit this?")

**If user does NOT approve (any non-affirmative response):**

- To discard the group: Say "Okay, I'll skip this group." Move to next group.
- To modify the message: Use `suggest-commit` again with hints from user's feedback, present alternatives, ask again.
- To change the group: Update the files, present the new grouping, ask again.
- To hold for later: Say "Okay, I'll skip this group for now." Mark as pending for Phase 3.

### 2.2 Stage the files

Run `git add <files>` for all files in this group.

**If git add fails:** Tell the user the error. Ask how to proceed. Do not commit.

### 2.3 Commit

Run `git commit -m "<approved message>"`.

**If git commit fails:** Tell the user the error. Unstage the files. Ask how to proceed.

### 2.4 Move to next group

Repeat from step 2.1. If no more groups remain, proceed to Phase 3.

---

## Phase 3: Handle Remaining Files

After all groups are processed, check for any files that weren't committed.

### 3.1 Check for remaining files

Run `git status --porcelain`.

**If no remaining files:** Display the summary (see below).

**If files remain:** List them and ask: "What should I do with these remaining files?"

- If user sees no connection: Offer to create a catch-all group, then repeat Phase 2 for that group.
- If user says not ready: Acknowledge and exit. Files remain unstaged.

### 3.2 Display summary

```
Created X commits:

[short-hash] "commit message"
[short-hash] "commit message"
...

Y file(s) remaining (if any)
```
