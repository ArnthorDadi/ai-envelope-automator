# TASK SELECTION

Before picking a task to work on read all the ./docs/\*.md files. Especially docs/project-blueprint.md.

Pick the next task. Prioritize tasks in this order:

1. Critical bugfixes
2. Development infrastructure

Getting development infrastructure like tests and types and dev scripts ready is an important precursor to building
features.

3. Tracer bullets for new features

Tracer bullets are small slices of functionality that go through all layers of the system, allowing you to test and
validate your approach early. This helps in identifying potential issues and ensures that the overall architecture is
sound before investing significant time in development.

TL;DR - build a tiny, end-to-end slice of the feature first, then expand it out.

4. Polish and quick wins
5. Refactors

Important: When a feature has been picked tell the user what feature it is and why.

# EXPLORATION

Explore the repo.

# IMPLEMENTATION

**IMPORTANT**: Where possible, use a red-green refactor loop:

## RED: Write a single failing test

## GREEN: Write the minimal implementation

## RED: Write another failing test

Repeat until implementation is complete.

# FEEDBACK LOOPS

Before committing, run the feedback loops:

- `pnpm run test` to run the tests
- `pnpm run typecheck` to run the type checker

# COMMIT

Make a git commit. The commit message must:

1. Include key decisions made
2. Include files changed
3. Blockers or notes for next iteration
4. IMPORTANT: NOT UNDER ANY circumstances COMMIT ANY .ENV VARIABLE VALUES

# THE ISSUE

If the task is not complete, leave a summary of what was done in progress.txt.

# FINAL RULES

ONLY WORK ON A SINGLE TASK.

# WHEN DONE

When the selected prd feature is implemented then mark the prd feature as done. "passes": true.

**IMPORTANT** If the selected PRD feature is complete, output <promise>COMPLETE</promise>.
