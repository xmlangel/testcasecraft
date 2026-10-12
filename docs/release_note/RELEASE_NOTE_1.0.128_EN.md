# Release Note - v1.0.128

## [1.0.128] - 2026-10-13

Written: 2026-10-13 07:40 KST

Requirements management is new. Organize requirements into documents, link them to test cases, and see how well each requirement is verified through coverage and reports. Server error messages are now consistently in English, and the user manual has been rearranged into 21 chapters that follow the order of the work.

### Highlights

#### Register requirements and link them to test cases

Projects gain a **Requirements** tab. Create a requirement document and register requirements under it. Scope and description are written in the same Markdown editor used for test cases.

Link each requirement to the test cases that verify it. Linked cases open directly from the requirement screen, and linked requirements open directly from the test case screen. Requirements with many links keep the list collapsed and let you find a case by search.

Requirements management is optional. Projects that do not use it keep starting from test cases as before, and existing screens and behavior are unchanged.

**Impact:** read-only roles can view requirements but not change them, and users who are not project members cannot access them.

#### See verification status through coverage and reports

The Coverage tab classifies every requirement as covered, partial, not linked, or excluded. The overall ratio is shown as a donut chart and the breakdown per document as stacked bars.

The report collects execution results per requirement for a chosen test plan. Results of linked cases are grouped into passed, failed, not run, and not in plan, shown per requirement.

#### Relate requirements to each other and view the relationship graph

Requirements can be related as parent/child, depends-on, or related. Links to another project's requirement, to itself, duplicates, and parent/child cycles are rejected when you add them. Deleting a requirement also deletes its relations.

The **Relationship graph** tab draws requirements and test cases as a network. Nodes with more links, or that bridge many requirements, are drawn larger, and selecting a node highlights its neighborhood. A view grouping requirements that share test cases and a list of requirements with no links at all are included.

**Impact:** the graph library (`cytoscape`, MIT) is downloaded only when this tab is opened (about 177 KB gzipped). Initial loading of other screens is unchanged.

#### Server error messages are now in English

The server does not pick error messages by UI language, so until now Korean error messages appeared even on the English UI. Exception messages, error response bodies, and input validation messages were changed to English in 1,144 places.

Success messages, logs, API documentation text, translation data, and LLM prompts were left as they were.

**Impact:** errors returned by the server appear in English even on the Korean UI. Places that inspect the wording of an error to decide what happened, such as JIRA connection errors, recognize both the Korean and the English wording, so behavior is unchanged.

#### The user manual follows the order of the work

The user manual, previously a single file, is now split into 21 chapters that a first-time user can read top to bottom in the order they work. Overall structure and key terms (chapter 1), a start-to-finish walkthrough (chapter 2), and requirements and coverage (chapter 5) are newly written. The requirements chapter sits before test case authoring but is marked optional, so teams that do not use requirements can skip to chapter 6.

Existing text was moved to its new place without rewording. The left-hand table of contents in the in-app `/manual` screen shows the new chapter structure.

A seed script adds requirements data to the ShopFlow sample project (3 documents, 11 requirements, 14 case links, 6 relations), and the figures in chapter 5 were captured from that data.

**Impact:** the English manual still uses the previous structure, and the English ShopFlow project does not receive the requirements sample.

### Upgrading

- Tables used by requirements management are created automatically when the server starts. There is no script to run.
- No environment variables or configuration files need to change.

### What was verified

- On the requirements branch, all 787 backend tests (including the requirements API integration tests) and all 731 frontend tests passed, and the coverage charts, adding relations with cycle rejection, and the relationship graph were checked in a browser.
- On the error message branch, all 766 backend tests and all 724 frontend tests passed. The 21 tests that expected Korean wording were updated to the English wording.
- For the manual, the combined file has 0 broken links and 0 missing figures, and the requirements figures were captured from a server running the ShopFlow sample data.
- The full test suite on dev with all three changes combined was not run at the time of writing. Run it once before release.
