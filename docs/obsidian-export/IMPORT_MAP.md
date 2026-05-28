# Import Map — Obsidian Vault

Target vault root: `~/obsidian/` (adjust as needed)


| #   | Source File                         | Target Obsidian Path                                     | Reason                                   | Review?                               |
| --- | ----------------------------------- | -------------------------------------------------------- | ---------------------------------------- | ------------------------------------- |
| 1   | `Project Overview.md`               | `10-Projects/Soullink/Project Overview - Soullink.md`    | Core project documentation               | No                                    |
| 2   | `Architecture.md`                   | `10-Projects/Soullink/Architecture - Soullink.md`        | Technical architecture reference         | No                                    |
| 3   | `Features.md`                       | `10-Projects/Soullink/Features - Soullink.md`            | Feature specification                    | No                                    |
| 4   | `Tech Stack.md`                     | `10-Projects/Soullink/Tech Stack - Soullink.md`          | Technology decisions reference           | No                                    |
| 5   | `Final State.md`                    | `10-Projects/Soullink/Final State - Soullink.md`         | Current implementation status            | No                                    |
| 6   | `Lessons Learned.md`                | `10-Projects/Soullink/Lessons Learned - Soullink.md`     | Retrospective / project-specific lessons | No                                    |
| 7   | `Session - OpenCode Final Build.md` | `20-Sessions/opencode/Session - OpenCode Final Build.md` | Coding session log (OpenCode)            | No                                    |
| 8   | `ADR Candidates.md`                 | `30-Decisions/ADR Candidates - Soullink.md`              | Architecture Decision Record candidates  | **Yes** — promote to final ADRs       |
| 9   | `Bug Pattern Candidates.md`         | `40-Bug-Patterns/Bug Pattern Candidates - Soullink.md`   | Documented bug patterns                  | **Yes** — verify before archiving     |
| 10  | `Reusable Prompts.md`               | `50-Prompts/Reusable Prompts - Soullink.md`              | Reusable agent prompts                   | **Yes** — merge with existing prompts |
| 11  | `Rules Candidates.md`               | `70-Rules/project-rules/Rules Candidates - Soullink.md`  | Proposed coding rules                    | **Yes** — decide which to adopt       |
| 12  | `Agent Context.md`                  | `90-Runtime/Agent Context - Soullink.md`                 | Compact context for agent sessions       | No                                    |


## Post-import todos

1. **Fix wiki links in `Final State - Soullink.md`** — the related-notes section still references `[[Project Overview]]`, `[[Architecture]]`, `[[Features]]`, `[[Lessons Learned]]` without the `- Soullink` suffix. Update to: `[[Project Overview - Soullink]]`, `[[Architecture - Soullink]]`, `[[Features - Soullink]]`, `[[Lessons Learned - Soullink]]`.
2. **Promote ADRs** — review `ADR Candidates - Soullink.md` and move finalized decisions into dated ADR files under `30-Decisions/`.
3. **Adopt rules** — review `Rules Candidates - Soullink.md` and move chosen rules into `70-Rules/project-rules/` or `70-Rules/coding-rules/`.
4. **Update Agent Context** — if runtime context changes, update `90-Runtime/Agent Context - Soullink.md`.

