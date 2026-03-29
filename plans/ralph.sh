#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

prompt=$(cat ./plans/prompt.md)
for ((i=1; i<=$1; i++)); do
  result=$(opencode run  \
    "$prompt" \
    -f "plans/prd.json" \
    -f "progress.txt" \
    -m opencode/big-pickle)

    echo "$result"

    if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
      echo "PRD complete after $i iterations."
      exit 0
    fi
