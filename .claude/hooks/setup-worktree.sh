#!/bin/bash
# Copy gitignored files into new worktrees so integration tests work.

NAME=$(python -c "import sys,json; print(json.load(sys.stdin)['name'])")
WORKTREE_PATH="${CLAUDE_PROJECT_DIR}/.claude/worktrees/$NAME"

# Create the worktree (EnterWorktree delegates creation when this hook exists)
git -C "$CLAUDE_PROJECT_DIR" worktree add "$WORKTREE_PATH" -b "$NAME" HEAD >&2

# .env files
for f in "${CLAUDE_PROJECT_DIR}"/.env*; do
  [ -f "$f" ] && cp "$f" "$WORKTREE_PATH/" >&2
done

# Extra project files needed in worktrees
for f in wf-audit.md wf.config.js; do
  [ -f "${CLAUDE_PROJECT_DIR}/$f" ] && cp "${CLAUDE_PROJECT_DIR}/$f" "$WORKTREE_PATH/" >&2
done

# Claude Code project config (glossary write-hook) — preserve nested paths
for f in .claude/settings.json .claude/hooks/setup-worktree.sh; do
  if [ -f "${CLAUDE_PROJECT_DIR}/$f" ]; then
    mkdir -p "$WORKTREE_PATH/$(dirname "$f")" >&2
    cp "${CLAUDE_PROJECT_DIR}/$f" "$WORKTREE_PATH/$f" >&2
  fi
done

# Install dependencies
cd "$WORKTREE_PATH" && pnpm install >&2

cygpath -w "$WORKTREE_PATH" 2>/dev/null || echo "$WORKTREE_PATH"
