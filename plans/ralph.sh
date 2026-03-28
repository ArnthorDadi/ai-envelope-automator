#!/bin/bash
set -e

prompt=$(cat plans/prompt.md)

opencode run  \
  "$prompt" \
  -f "plans/prd.json" \
  -f "progress.txt" \
  -m opencode/big-pickle
