# Reusable Prompts - Soullink

---

## Prompt: Analyze project before coding

A prompt that tells the agent to inspect the project thoroughly before making changes. Use this at the start of any new task to ensure the agent understands the codebase.

```
You are about to modify the Pokémon Soul Link Nuzlocke companion project at D:\Projects\pokemon-weakness-app.

Before writing any code, first:

1. Read AGENTS.md to understand the project specification and constraints.
2. Read docs/obsidian-export/Agent Context.md to get a quick overview of the project structure.
3. Read src/types.ts to understand the data model.
4. Read the relevant source files for the feature you are about to change.
5. Run npm run build to confirm the current state compiles without errors.

After this analysis, summarize:
- What the project does (one sentence)
- The relevant files for the task
- Any constraints or rules that apply
- Your planned approach

Only start writing code after I confirm the plan.
```

---

## Prompt: Plan-first feature implementation

A prompt that forces the agent to propose a plan before writing any code. Use this for non-trivial feature additions.

```
I need to add the following feature to the Pokémon Soul Link app: {describe feature}.

Do NOT write code yet.

First, research the existing codebase:
1. Find a similar existing feature that I can use as a reference pattern.
2. Read the relevant source files and types.
3. Identify every file that would need to change.

Then, produce a plan with:
- **Files to create** (with paths)
- **Files to modify** (with paths and a brief description of each change)
- **Data model changes** (new types, modified interfaces)
- **State management changes** (new fields in usePersistentRunState, new handlers)
- **UI structure** (component hierarchy, props)
- **CSS considerations** (new styles needed)
- **Risks** (what could break, edge cases)
- **Verification** (how to confirm it works)

Present the plan as a checklist. I will review and approve it before you write any code.
```

---

## Prompt: Add a feature safely

A prompt for adding a new feature while minimizing risk of breaking existing behavior. Use after a plan has been approved.

```
Implement the feature described in the approved plan.

Follow these rules:
1. Do NOT modify any file that is not listed in the plan. If you discover a file needs changes that were not planned, stop and tell me.
2. Follow existing code conventions:
   - Named exports only (no default exports)
   - Types in src/types.ts (or local to the component if not shared)
   - CSS classes in src/style.css (single stylesheet)
   - State in usePersistentRunState.ts (or local useState if not shared)
   - Props interfaces defined inline in the component file
3. Handle all UI states: loading, empty, error, and loaded/success.
4. Use Set<string> for availability blocking (deadNames, activeNames, boxedNames, unavailableNames).
5. Normalize Pokémon names with .toLowerCase().trim() before comparison.
6. After implementation, run npm run build and fix any errors.

Start with the data model changes (types.ts), then state management, then the component, then CSS.
```

---

## Prompt: Refactor with tests

A prompt for refactoring existing code while preserving behavior. Since this project has no test suite, the refactor should be structured to make testing easier afterward.

```
Refactor {file path} with the goal of {describe goal, e.g., "extracting the graveyard logic from usePersistentRunState into a separate hook"}.

Requirements:
1. Do NOT change the external behavior of any function or component.
2. The refactored code must produce the same outputs for the same inputs.
3. After refactoring, run npm run build and fix any type errors.
4. The existing hooks, components, and API calls must continue to work without modification.

Structure the refactored code so that the pure logic functions are separated from React hooks:
- Pure functions (no hooks, no side effects) in src/utils/{name}.ts
- React hook wrappers in src/hooks/{name}.ts
- Each pure function should:
  - Accept plain inputs, return plain outputs
  - Have no dependencies on React, localStorage, or PokéAPI
  - Be testable by calling it directly with sample data

Verify the refactor by:
- Comparing the output of the refactored function against the original for 3–5 sample inputs
- Running npm run build
- Manually testing the affected UI once in the browser

Do not add a test framework or write test files unless I ask for that separately.
```

---

## Prompt: Extract Obsidian notes from project

A prompt for creating Obsidian-ready documentation from a finished project. This is what was used to generate the current docs.

```
Analyze the completed Pokémon Soul Link project at D:\Projects\pokemon-weakness-app and create Obsidian-ready markdown documentation in docs/obsidian-export/.

Rules:
- Do NOT modify any application code (src/, scripts/, index.html, package.json, tsconfig.json).
- Do NOT copy large source code blocks into the docs — reference file paths instead.
- Use clear Markdown headings (## for sections, ### for subsections).
- Use Obsidian wikilinks in the format [[Note Name]] throughout.
- Mark assumptions explicitly as "Assumption:".
- Mark uncertain information explicitly as "Unclear:".
- The notes should help a future AI coding agent (OpenCode, Claude Code, etc.) understand the project quickly.

Create these files (each with the specified structure):

1. docs/obsidian-export/Project Overview.md
   - One-sentence summary
   - Purpose
   - Current status
   - Core features (bullet list)
   - Main user flow (numbered steps)
   - Important project files (table with paths and explanations)
   - Technical summary (framework, storage, styling, data sources)
   - Known limitations
   - Future improvement ideas
   - Related notes with wikilinks

2. docs/obsidian-export/Architecture.md
   - Overview
   - Repository structure
   - Frontend architecture (components, state, styling)
   - Data model (all entity types with fields)
   - Persistence (what, how, what is NOT persisted)
   - Data flow (describe 2–3 key flows step by step)
   - Important files table
   - Architectural strengths (3–5 points)
   - Architectural weaknesses (3–5 points)
   - Related notes with wikilinks

3. docs/obsidian-export/Features.md
   - For each feature: Description, Relevant files, Important behavior, Possible improvements
   - Cover: Pokémon selection, Soul Link pairing, player management, encounter tracking, team management, status handling (death + evolution lock), data persistence, UI layout, filtering/searching, import/export, type effectiveness, battle helper/lookup

4. docs/obsidian-export/Final State.md
   - Implemented checklist
   - Deferred checklist
   - Known limitations (5+ items with file refs)
   - Build status

5. docs/obsidian-export/Lessons Learned.md
   - 5+ concrete lessons from building the project
   - Each with relevance to future work and file references

6. docs/obsidian-export/Agent Context.md
   - "Read this first" entry point for future agents
   - Quick start commands, key files by category, data flow diagram
   - Cross-links to all other notes

7. docs/obsidian-export/ADR Candidates.md
   - 8+ architecture decisions with: Status, Context, Decision, Reasons, Alternatives, Consequences, Related files

8. docs/obsidian-export/Bug Pattern Candidates.md
   - 10+ bug patterns with: Symptom, Likely cause, Prevention, Regression test idea, Related files

9. docs/obsidian-export/Reusable Prompts.md
   - 6+ reusable prompt templates for common tasks

10. docs/obsidian-export/Rules Candidates.md
    - 10+ project-specific coding rules

Read ALL source files first. Then write all files. Cross-link them with wikilinks.
```

---

## Prompt: Generate session summary

A prompt for summarizing an AI coding session into the Obsidian memory system. Use this at the end of a session to capture what was done.

```
Summarize the current coding session into an Obsidian markdown note for my memory system.

Repository: D:\Projects\pokemon-weakness-app

Create a file at docs/obsidian-export/Session - {Session Name}.md with this structure:

---
type: coding-session
project: Soullink
tool: {tool name, e.g., OpenCode}
model: {model name, e.g., Big Pickle}
status: completed
date: {date range}
---

# Session - {Session Name}

## Goal
One paragraph: what was the goal of this session?

## Starting point
What existed before this session? Reference git commits, file state, or previous session notes.

## What was built
Bullet list of features, components, or changes implemented.

## Important implementation steps
Numbered list of the main steps taken during the session. Reference file paths.

## Important files changed or created
Table with paths and one-line purpose for each file.

## Problems encountered
List 3–7 problems with:
- What went wrong
- Root cause (from code analysis)
- How it was solved

## Solutions
For each problem, the solution.

## Good prompts or instructions
List 3–5 specific prompt phrasings that worked well during this session.

## Final result
One paragraph describing the working state of the project after the session.

## Learnings
5–10 concrete lessons that would help future sessions.

## Follow-up tasks
5–10 realistic next steps (from code TODOs, known bugs, obvious improvements).

## Related notes
- [[Project Overview - Soullink]]
- [[Architecture - Soullink]]
- [[Features - Soullink]]
- [[Lessons Learned - Soullink]]

Do NOT modify application code. Use git log to reconstruct the session history. Mark inferred information as "Assumption:".
```

---

## Related notes

- [[Project Overview - Soullink]]
- [[Architecture - Soullink]]
- [[Agent Context - Soullink]]
- [[Lessons Learned - Soullink]]
