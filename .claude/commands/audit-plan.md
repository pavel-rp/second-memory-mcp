---
description: Creates a tracked implementation checklist for one audit finding
---

Read the skill file at .claude/skills/audit-plan/SKILL.md, then execute it with these arguments: $ARGUMENTS

```

Then invoke it as:
```

/audit-plan C1 --docs-root "/path/to/docs" --report "audit/REPORT.md"

```

`$ARGUMENTS` passes everything after `/audit-plan` directly into the skill.

**Option 2: Inline the skill into the command**

If you don't want a separate skill file, just put the full SKILL.md content directly into `.claude/commands/audit-plan.md`. Simpler file structure, same result.

**Final folder layout:**
```

.claude/
├── commands/
│ └── audit-plan.md ← what you type
├── skills/
│ └── audit-plan/
│ └── SKILL.md ← the logic
└── settings.json
