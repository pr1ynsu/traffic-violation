#!/bin/bash

# Fetch all remotes
echo "Fetching all remotes..."
git fetch --all

# Create and push a timestamped backup branch of current ml
TIMESTAMP=$(date +%Y%m%d%H%M%S)
echo "Creating backup branch backup-ml-$TIMESTAMP..."
git checkout ml
git checkout -b backup-ml-$TIMESTAMP
git push origin backup-ml-$TIMESTAMP

# Commit any uncommitted changes on ml
echo "Committing uncommitted changes on ml..."
git checkout ml
if [ -n "$(git status --porcelain)" ]; then
  git add .
  git commit -m "Auto-commit uncommitted changes before merge"
else
  echo "No uncommitted changes."
fi

# Merge origin/frontend and origin/backend into ml, preferring ml on conflicts
echo "Merging origin/frontend into ml..."
git merge origin/frontend --strategy-option ours
if [ $? -ne 0 ]; then
  echo "Merge failed. Git status:"
  git status
  echo "Conflicted files:"
  git diff --name-only --diff-filter=U
  echo "Recovery: To restore backup, run: git checkout backup-ml-$TIMESTAMP && git branch -D ml && git checkout -b ml"
  exit 1
fi

echo "Merging origin/backend into ml..."
git merge origin/backend --strategy-option ours
if [ $? -ne 0 ]; then
  echo "Merge failed. Git status:"
  git status
  echo "Conflicted files:"
  git diff --name-only --diff-filter=U
  echo "Recovery: To restore backup, run: git checkout backup-ml-$TIMESTAMP && git branch -D ml && git checkout -b ml"
  exit 1
fi

# Push updated ml to origin
echo "Pushing ml to origin..."
git push origin ml
if [ $? -ne 0 ]; then
  echo "Push failed. Git status:"
  git status
  echo "Recovery: To restore backup, run: git checkout backup-ml-$TIMESTAMP && git branch -D ml && git checkout -b ml"
  exit 1
fi

echo "Script completed successfully."
