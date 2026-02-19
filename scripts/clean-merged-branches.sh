#!/usr/bin/env bash
# clean-merged-branches.sh
# Deletes local (and optionally remote) branches already merged into the base branch.

set -euo pipefail

BASE_BRANCH="${1:-main}"
REMOTE="${2:-origin}"

# Branches that should never be deleted
PROTECTED="^(main|master|develop|dev|staging|$BASE_BRANCH)$"

echo "Base branch : $BASE_BRANCH"
echo "Remote      : $REMOTE"
echo ""

# ── Local merged branches ────────────────────────────────────────────────────
echo "=== Local merged branches ==="
MERGED_LOCAL=$(git branch --merged "$BASE_BRANCH" \
  | sed 's/^[* ]*//' \
  | grep -Ev "$PROTECTED" || true)

if [[ -z "$MERGED_LOCAL" ]]; then
  echo "  Nothing to delete locally."
else
  echo "$MERGED_LOCAL"
  echo ""
  read -rp "Delete these local branches? [y/N] " confirm
  if [[ "$confirm" =~ ^[Yy]$ ]]; then
    echo "$MERGED_LOCAL" | xargs git branch -d
    echo "  Done."
  else
    echo "  Skipped."
  fi
fi

echo ""

# ── Remote merged branches ───────────────────────────────────────────────────
echo "=== Remote merged branches ($REMOTE) ==="
git fetch --prune "$REMOTE" 2>/dev/null

MERGED_REMOTE=$(git branch -r --merged "$REMOTE/$BASE_BRANCH" \
  | sed "s|^[[:space:]]*$REMOTE/||" \
  | grep -Ev "$PROTECTED" \
  | grep -Ev "^HEAD" || true)

if [[ -z "$MERGED_REMOTE" ]]; then
  echo "  Nothing to delete on remote."
else
  echo "$MERGED_REMOTE"
  echo ""
  read -rp "Delete these remote branches on '$REMOTE'? [y/N] " confirm_remote
  if [[ "$confirm_remote" =~ ^[Yy]$ ]]; then
    echo "$MERGED_REMOTE" | xargs -I{} git push "$REMOTE" --delete {}
    echo "  Done."
  else
    echo "  Skipped."
  fi
fi

echo ""
echo "All done."
