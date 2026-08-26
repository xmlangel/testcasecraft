# Release Note - v1.0.124

## [1.0.124] - 2026-08-26

The version shown at the bottom of the screen was stuck at 1.0.122. The previous 1.0.123 deployment bumped only the backend version and not the frontend, so even though 1.0.123 was actually running, the screen still read 1.0.122. Backend and frontend now match at 1.0.124.

### Highlights

#### The on-screen version now matches what is deployed

The version in the bottom-left corner and in the profile dialog's "Version" section is read straight from the frontend's version value. That value must be bumped with every release, and it was missed in 1.0.123. The deployment went out, but the number on screen did not move, so it looked like nothing had updated.

Backend and frontend versions were bumped together to 1.0.124. From now on both are raised together at release time so they cannot drift apart.

**Impact:** The version shown on screen matches the deployed version. The changes introduced in 1.0.123 (project access checks for the AI chat, whole-database search) were already in effect; this release only corrects the version display.

### Scope verified

- Confirmed that both the backend `build.gradle` and the frontend `package.json` read 1.0.124.
- Whether the on-screen version updates to 1.0.124 is confirmed after redeploy.
