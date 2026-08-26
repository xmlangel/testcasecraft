# Release Note - v1.0.125

## [1.0.125] - 2026-08-26

When searching for cases or execution results through the AI chat, the search term was looked up only in tags, so projects without tags answered "nothing found." The search now looks across title, description, and tags, and result searches also read the notes.

### Highlights

#### The search term is no longer looked up in tags only

Asking something like "find cases about '수정' (modification)" made the AI chat build a query that searched only the tags. In projects that do not use tags, that returned nothing even though the word was clearly present in case titles, descriptions, and result notes.

In a measured case, one project had no tags at all, yet the word appeared in 9 case titles and 50 execution result notes. A tags-only query missed all of them.

Case search now looks across **title, description, and tags** together, and "search in execution results" now reads the **result notes**. When it is unclear whether a term is a tag or body text, the search is not narrowed to tags alone.

**Impact:** Cases and execution results are found even in projects that do not use tags. The search stays scoped to the requested project.

### Scope verified

- Confirmed that in a project with no tags, 9 cases whose title/description contained the term and 50 result notes are actually returned.
- Whether the AI chat answer includes these results is confirmed after redeploy.
