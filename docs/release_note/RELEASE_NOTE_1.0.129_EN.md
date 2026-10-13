# Release Note - v1.0.129

## [1.0.129] - 2026-10-13

Written: 2026-10-13 12:50 KST

The server now assigns IDs to requirement documents and requirements automatically. Until now users had to type each ID by hand. Test case numbering was also reworked so that IDs no longer collide when several people save in the same project at the same time.

### Highlights

#### Requirement documents and requirements are numbered automatically

| Item | Example ID | Numbered within |
|---|---|---|
| Requirement document | `R-ONTS-001` | the project |
| Requirement | `R-ONTS-001-001` | its parent document |

The add dialog opens with the next number already filled in, and you can change it before saving. In the requirement dialog, switching the parent document refills the ID with that document's next number. A value you edited yourself is never overwritten.

Saving with the ID field empty also works: the server assigns the number. When editing an existing item, an empty ID keeps the current one.

The next number is the highest existing number in the same format plus one. IDs you entered in a different format, such as `REQ-CART-001`, are ignored when computing it.

**Impact:** existing IDs in projects that used a different format stay as they are. Only new items are offered an `R-` style number.

#### Concurrent saves no longer produce duplicate numbers

When several save requests for the same project arrive at once, the server processes them one at a time and hands out the next number in order. This applies to requirement documents, requirements, and test cases (single create, bulk save, and move or copy between projects).

Previously nothing prevented duplicate test case IDs, so creating cases concurrently could produce two cases with the same ID. For requirements, the save that received a duplicate number failed.

**Impact:** when saves to the same project pile up, later requests wait until the earlier one finishes. Saves to different projects do not wait on each other.

### Upgrading

- No database changes or scripts to run.
- No changes to environment variables or configuration files.

### Verification

- All 794 backend tests and 735 frontend tests passed. A new integration test on a real PostgreSQL confirms that a second save waits until the first one finishes.
- 8 requirement documents, 12 requirements, and 12 test cases were saved concurrently against the running app. All succeeded with no duplicate numbers.
- In the browser, the prefilled number in the document dialog and the refill on parent-document change in the requirement dialog were confirmed.
- Numbers of deleted items can be reused, because the next number is the highest remaining one plus one. Test cases already behave this way, so it was left unchanged.
- The startup job that corrects test case sequence numbers does not use the new ordering.
