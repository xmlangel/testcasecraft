# Release Note - v1.0.115

## [1.0.115] - 2026-08-21

Page loads are fixed. Static asset transfer dropped from 2,449 KB to 505 KB, and the number of requests that actually go over the network dropped from 22 to 2. From the second visit onward, almost no assets are fetched.

### Highlights

#### 🐢 Why it was slow

In the production network log, a single 0.8 KB chunk took 4.06 seconds. The server returns the same file in 4 milliseconds, so this was not a processing-speed problem. The response headers held the cause:

```
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Cf-Cache-Status: BYPASS
```

These files carry a content hash in their name and never change, yet `no-store` made the CDN skip caching entirely. With dozens of assets per screen, those round trips added up. The header came from two layers: the Vite output path had no resource handler registered at all, so its cache directive was empty, and the security configuration's default headers filled that gap.

#### 🗄️ Cache directives matched to each path

| Path | Directive | Why |
|---|---|---|
| Build output assets | 1 year, marked immutable | The name carries a content hash, so a change in content changes the name |
| Favicon, manifest, logos | 1 day | The names are fixed, so a long cache would prevent replacements from showing up |
| `index.html` and screen routes | No caching | If this document is cached, the document pointing at the new asset names never updates |
| API responses | No caching | Unchanged |

The security configuration now has a separate chain for static assets that omits only the cache-prevention header and keeps every other security header.

#### 📦 Response compression in every environment

Compression was enabled only in the production configuration. In production the CDN compresses at the edge, but the leg from the server to the CDN went out uncompressed, and the development environment and any CDN-less deployment had no compression at all. It is now part of the shared configuration. The main bundle went from 964 KB to 259 KB.

#### 🧩 Chunk count

The build produced 127 chunks, 56 of them under 2 KB. **All 56 together come to just 17 KB.** At that size the round trip costs more than the content.

Small fragments are now absorbed into their parent, and since every remaining sub-2 KB chunk was an icon shared across screens, the icons are grouped into a single chunk.

| Item | Before | After |
|---|---|---|
| Chunks | 127 | 67 |
| Chunks under 2 KB | 56 | 3 |
| First-screen bundle (compressed) | 231 KB | 189 KB |
| Icons | Spread across 45 chunks | One chunk (50 KB compressed) |

Grouping large libraries by hand was deliberately avoided: doing that in this repository once pushed the first request to 3 MB. Icons pull in no other code, so they carry no such risk, and the first-screen bundle actually got smaller.

### Upgrade notes

* No DB migration scripts. No schema changes.
* **The first visit after deployment fetches the assets once.** The filenames changed, so this is expected. Caching applies from then on.
* Browsers that visited a previous version have an empty cache and will fetch everything once.
* On a CDN-backed deployment, watching the cache-status header flip from bypass to hit confirms the change took effect.
* Favicon, manifest, and logos are cached for one day. If one of those files is replaced and must appear immediately, force-reload (⌘⇧R / Ctrl+F5).
* API responses and screen documents are still not cached, and authorization behavior is unchanged.
* For 1.0.114 changes, see [RELEASE_NOTE_1.0.114_EN.md](RELEASE_NOTE_1.0.114_EN.md).

### Verification

| Target | Method | Result |
|---|---|---|
| Transfer and request count | Measured before and after under identical conditions (project screen after login, browser resource timing) | Transfer 2,449 KB → 505 KB, network requests 22 → 2 |
| Repeat visit | New tab sharing the same cache | 12 assets served from cache; previously everything was re-downloaded every time |
| Asset response headers | Direct request | No-store → 1 year with immutable, compression applied |
| Compression effect | Main bundle request | 964 KB → 259 KB |
| Document and API headers | Checked index.html and an API response | Still not cached |
| Authorization | Requested static assets and an API without a token | Assets 200, API 401 unchanged |
| Backend suite | 85 files, 539 tests | Pass |
| Frontend suite | 79 files, 624 tests | Pass |
| Screen sweep | Dashboard, projects, users, organizations | 0 page errors |
