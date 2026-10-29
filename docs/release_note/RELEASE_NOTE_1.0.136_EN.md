# Release Note - v1.0.136

## [1.0.136] - 2026-10-29

Written: 2026-10-29 21:21 KST

This release bundles PR #207, merged into `dev` after 1.0.135. It removes three links from the top of the Swagger UI.

### Highlights

#### Swagger UI links cleaned up

- Removed the GitHub releases link from the contact info. The contact name is now `TestcaseCraft`; the email is kept.
- Removed the MIT License link.
- Hid the specification URL (`/api-docs`) link under the title. Opening it in a new tab did not send the login token and only showed 401. The Swagger UI still loads the specification itself.

### Upgrade notes

- No configuration or database changes.

### Verification

- All 6 `SwaggerApiDocsAuthzTest` tests passed. New checks confirm the specification has no releases link or license, the email is kept, and the UI initializer includes the link-hiding setting. The new checks failed on the code before the fix.
- The UI was rendered in a browser using the production Swagger UI assets: without the setting the specification link appeared once, with it zero times, and the contact info still showed.
- Checking the production Swagger UI after deployment is still pending.

### Known issues

- The issues listed in 1.0.134 are not fixed in this release.
