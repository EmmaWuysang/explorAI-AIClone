# LLM Notetaking Framework Guide

This guide explains how LLMs should use the notetaking framework when working on this project. The framework operates as a **dynamic context window** for LLMs to understand project state and continue development seamlessly while **minimizing token usage**.

## 📁 File Structure

### Directory Organization

```
LLM-Notes/
├── tasks/              # Task-related files (create multiple files as needed)
├── goals/              # Goal-related files (create multiple files as needed)
├── considerations/     # Consideration files (create multiple files as needed)
├── notes/              # General note files (create multiple files as needed)
├── archive/            # Entire files moved here when outdated/irrelevant
├── prompt-log.md       # All user prompts (APPEND only)
└── FRAMEWORK-GUIDE.md  # This file
```

## 🔄 Core Protocol: CREATE-NEW, ARCHIVE-OLD Strategy

### Primary Workflow: Create New Files, Archive Old Ones

**CRITICAL:** To minimize token usage, LLMs should:

1. **CREATE NEW FILES** in appropriate directories (tasks/, goals/, etc.) when adding new information

   - It's OK to create multiple independent files in a directory
   - Use descriptive filenames (e.g., `api-integration-tasks.md`, `ui-considerations.md`)
   - Don't feel constrained to edit existing files

2. **MOVE ENTIRE FILES** to `archive/` when they become outdated or irrelevant

   - Don't edit files in archive/ - they're historical records
   - This avoids unnecessary token usage from reading/editing large files

3. **SMALL EDITS OK** for status updates or corrections in current files
   - But prefer creating new files over constant edits to the same file

### Why This Approach?

- **Minimizes token waste:** Avoids reading/editing large files repeatedly
- **Preserves history:** Archived files serve as complete historical records
- **Enables focus:** LLMs only need to read current, relevant files
- **Dynamic context:** Archive folder grows organically with project history
- **Flexible organization:** Multiple files allow better organization by topic/context

## 📋 Workflow Guidelines

### When Adding New Information:

1. **Create a new file** in the appropriate directory (tasks/, goals/, considerations/, notes/)
2. **Use descriptive filenames** that indicate content (e.g., `google-calendar-integration.md`)
3. **Include timestamps** in the file content
4. **Don't worry about file count** - multiple files are fine

### When Files Become Outdated:

1. **Move entire file** to `archive/` directory
2. **Don't edit archived files** - they're historical records
3. **Include context** in filename or file content about why it was archived (optional but helpful)

### When Updating Current Information:

1. **Small edits** (status updates, corrections): Edit in-place if file is small
2. **Significant changes**: Consider creating a new file instead of editing large files
3. **Always timestamp** when making updates

## 🎯 LLM Agency & Proactive Management

### LLMs MUST:

- **Take initiative** to move outdated files to `archive/`
- **Clean up** irrelevant files regularly
- **Create new files** rather than constantly editing the same files
- **Organize content** logically across multiple files
- **Review directories** periodically and archive outdated content

### When to Archive Files:

- Files that are no longer relevant to current work
- Files that have been superseded by newer versions
- Files containing outdated information
- Files that are no longer needed for active development

### File Naming Best Practices:

- Use descriptive names: `api-authentication-notes.md` not `notes-1.md`
- Include dates if helpful: `2025-11-17-meeting-notes.md`
- Group related content: `google-services-integration.md`
- Keep names concise but informative

## 📊 Reading Strategy for New LLMs

When picking up the project, LLMs should:

1. **Read `prompt-log.md`** to understand recent user requests
2. **Scan current directories** (tasks/, goals/, considerations/, notes/) to see what files exist
3. **Read relevant current files** based on the task at hand
4. **Optionally check `archive/`** for historical context if needed
5. **Focus on current files** - don't read entire archive unless necessary

## ⚠️ Important Rules

1. **CREATE-NEW over EDIT-OLD**: Prefer creating new files over constantly editing existing ones
2. **ARCHIVE proactively**: Move outdated files to `archive/` regularly
3. **Don't edit archived files**: They're historical records
4. **Multiple files OK**: It's fine to have many files in directories
5. **Descriptive filenames**: Use clear, informative file names
6. **Timestamp content**: Include timestamps in file content when relevant
7. **Clean up regularly**: Archive outdated files to keep directories focused

## 🔍 Quick Reference

- **New task/goal/note?** → Create new file in appropriate directory
- **File outdated?** → Move entire file to `archive/`
- **Update needed?** → Small edit OK, or create new file if significant
- **Starting work?** → Scan current directories, read relevant files
- **Need history?** → Check `archive/` if needed

## 💡 Token Efficiency Benefits

This approach minimizes token usage by:

- **Avoiding large file reads**: Only read files you need
- **Avoiding constant edits**: Create new files instead of editing large ones
- **Clear separation**: Current vs archived content is obvious
- **Focused context**: LLMs only read what's currently relevant
- **No unnecessary merges**: Don't need to read/edit files to add content

## 🗂️ Archive Directory

The `archive/` directory:

- Contains entire files that are no longer actively needed
- Serves as a historical record
- Should not be edited once files are moved there
- Can be organized by date/category if helpful (optional)
- Provides context for understanding project evolution
