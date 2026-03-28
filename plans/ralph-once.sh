#!/bin/bash
# ralph-once.sh

opencode run "Read the docs first in the docs folder in the root of the repo.
 1. Find the highest-priority feature in @plans/prd.json and work only on that. The id of the feature is not an indicator of its importance. Use the description field to determine the priority.
 2. Write tests (unit/e2e whatever is required) for the feature. So in future iterations, we can run the tests to see if the feature is working.
 3. Check that the types check via 'pnpm tsc' and tests pass via 'pnpm test'.
 4. Update the prd with the work done.
 5. Append a progress note to @progress.txt for the next run.
 6. When feature is dont add all changed files to git (git add <changed file names>) and suggest an descriptive commit message. A human wil take over and commit it to github.
 ONLY WORK ON A SINGLE FEATURE.
 If, while implementing the feature, your notice the feature is completed, output <promise>COMPLETE</promise>." \
  -f "plans/prd.json" \
  -f "progress.txt" \
  -m opencode/big-pickle
