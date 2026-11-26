# Arc Runtime

A compact, bilingual portfolio. Updated October 9, 2026 at https://arcruntime.com (Japanese: /ja/). Both apex and www domains are connected to Vercel and verified over HTTPS. The fallback https://arcruntime.vercel.app remains available. The current release is silent.

## Brand share-preview release — October 9, 2026

Current production deployment: `dpl_5n8ygeMLbSQGmakNCUeZ4tiZKuoU` (READY). Explicit EN/JA Open Graph and Twitter large-image metadata now identifies the Arc Runtime brand instead of leaving crawlers to choose a project screenshot. The PNG uses the original seal from `src/assets/seal.svg` with the existing wordmark treatment on the dark brand background. No AI image generation or logo redesign was used. It is 1200×630, 19,181 bytes, and shared by both languages/hostnames at https://arcruntime.com/assets/arc-runtime-social-2026-10-09-v1.png . Titles/descriptions use the existing localized page copy; alt text is localized. Canonical/OG URLs remain apex `/` and `/ja/`, with en_US/ja_JP locales. Twitter account handles were not invented.

Only head metadata and one public PNG were added. All body markup, visible copy, privacy/access settings, CSS/theme inline bytes and exact CSP authorizations are unchanged. The runtime allowlist is now eleven public files; the sanitized upload has twelve files including `vercel.json`. The candidate's EN/JA HTML, image MIME/bytes and exact CSP were checked before promotion with explicit staged configuration. Fourteen anonymous HTTP checks passed across apex/www, both languages and ordinary/LinkedIn/Twitter user agents; image responses on both domains match the PNG hash and dimensions. All eleven public files matched the release manifest and eight normal EN/JA mobile/desktop browser checks passed.

Evidence: `review/social-preview-release-2026-10-09.json`, `review/social-preview-candidate-checks.json`, `review/social-preview-live-checks.json`, `review/production-checks.json`. Baseline: `review/pre-social-preview-2026-10-09/`. Run `node scripts/check-social-preview.mjs` after build and `node scripts/verify-social-preview.mjs` after publishing. Regenerate artwork with `PLAYWRIGHT_MODULE=/absolute/path/to/playwright node scripts/render-social-preview.cjs`; use a new versioned filename for future artwork changes and update the allowlists. Existing sent LinkedIn previews may remain cached; these checks verify what the site serves, not LinkedIn's stored message preview. No social posting, account setting or domain change was performed.

LinkedIn follow-up, reported by the coordinator on October 9: Post Inspector inspected `https://www.arcruntime.com/`, showed “Last scraped a few seconds ago”, canonical `https://arcruntime.com/`, and the new Arc Runtime title/description and orange seal/cream wordmark thumbnail. This is reported actual LinkedIn fresh-preview verification, distinct from this thread’s anonymous HTTP checks. A separate apex Inspector refresh was not completed. No LinkedIn messages were posted, sent or edited. The existing sent message may retain its earlier preview. Recorded in `review/social-preview-release-2026-10-09.json`; no further deployment occurred.

## Initial-render correction — October 9, 2026

Initial-render deployment: `dpl_FZnb1y8WeW1AkDi7oV1dmaeKJa9q` (READY). Kelly clarified the symptom as Firefox briefly showing ordinary links/text before styles, especially on www. Apex/www both returned matching HTML with correct MIME types; CSS and scripts also had correct MIME types. No DNS, routing or raw-source response problem was found. Clean Firefox, Chromium and WebKit with a 2.5-second stylesheet delay waited until CSS was ready; the exact transient flash in Kelly's Firefox profile was not independently reproduced. Treat the browser/profile-specific trigger as unconfirmed, not a proven raw-code leak.

The corrective change removes the external stylesheet timing dependency: the build embeds the existing complete CSS in the HTML head. A small initial theme script applies the saved theme before the body is parsed. The deferred interaction script, public body markup, EN/JA copy (including Cratewise), images, silence, closed signup and project links are byte-for-byte unchanged. The body is never hidden pending JavaScript and remains styled/usable with scripts disabled. `site.css` remains an allowed public file for compatibility but neither page requests it.

`scripts/initial-render.mjs` supplies the exact inline bytes and SHA256 CSP authorizations. `scripts/stage.mjs` derives the deployed CSP from those bytes, verifies the built HTML matches, and writes identical root/staged hosting configurations. Deploy with the explicit staged `--local-config` path; the CLI can resolve the root config before applying `--cwd`. Local preview uses the same policy. No unsafe-inline or wildcard policy was introduced. Rebuild/restart preview after changing CSS so its CSP matches the current HTML.

Local evidence: 36 first-render checks across Firefox/Chromium/WebKit × EN/JA × saved dark/light or no-JS × cold/reload, plus the existing 40 layout/interaction variants. The first-render test aborts any external stylesheet request and withholds site.js while checking rendering frames, theme/background/font sizes, visible content, and CSP hashes; it then verifies load and no-JS disclosures. Firefox screenshots capture this pre-interaction-script state. Run with `PW_TEST_SCREENSHOT_NO_FONTS_READY=1 PLAYWRIGHT_MODULE=/absolute/path/to/playwright node scripts/check-first-paint.cjs`; the screenshot flag bypasses Playwright's font-ready wait for the intentionally held deferred script, without changing page behavior. Pass one or more HTTPS bases to test production.

Deployment recovery: the first attempt served the new HTML with the old root CSP, blocking the inline CSS. Live verification caught it and both public hostnames were rolled back to the preceding verified release (`dpl_Cw7vdGfBFPoCPxVwhsHfgUdZZcuv`). The fix synchronizes root/staged CSP and explicitly selects the staged configuration. Replacement candidate `dpl_FZnb1y8WeW1AkDi7oV1dmaeKJa9q` was deployed with `--skip-domain`; its protected HTTP response was checked through Vercel's authenticated CLI for exact HTML hash and CSP before promotion. Existing domain assignments were preserved; no DNS changes. Candidate proof: `review/first-paint-candidate-header-check.json`.

Final public verification: all 72 initial-render checks passed on apex/www in Firefox, Chromium and WebKit (EN/JA, cold/reload, saved dark/light, no-JS). Actual response headers authorize the exact CSS/theme bytes. All ten public files match the manifest and eight normal live page checks pass. Evidence: `review/first-paint-release-2026-10-09.json`, `review/first-paint-live-checks.json`, `review/production-checks.json`. No extra www DNS record is needed.

Historical diagnosis: `review/first-paint-firefox-diagnosis.json` and `review/first-paint-diagnosis.json`. Before-change source/release evidence: `review/pre-first-paint-2026-10-09/`. Local result: `review/first-paint-local-checks.json`.

## Cratewise wording release — October 9, 2026

Published the owner-requested positive description of Cratewise in EN/JA, grounded in its metadata checks and collection builder. Only those two sentences changed in public output; all other project copy and public asset bytes were compared with the preceding release and remain identical. That wording release was `dpl_Cw7vdGfBFPoCPxVwhsHfgUdZZcuv` (subsequently superseded by the releases above).

English: “A music-library organizer that checks exported track metadata and helps build collections.”

Japanese: “書き出した楽曲のメタデータを確認し、コレクションづくりを助ける音楽ライブラリ整理ツールです。”

Build/content checks passed. All ten live public files matched the staged hashes; live EN/JA exact-copy checks passed at 390px without overflow or browser errors. Evidence: `review/cratewise-copy-release-2026-10-09.json`. Prior release inputs/evidence are preserved in `review/pre-cratewise-copy-2026-10-09/`. No domain/alias, signup, other-project copy, or source-publication change.

## Recruiter-readiness release — October 9, 2026

This local revision preserves the October 5 case notes and all approved bio/privacy, silent behavior, theme, routes and closed signup settings. It removes internal release labels from Lodestone status/captions and replaces Plink's build-oriented caption with a description of the interaction. Lodestone's case note now describes sound-before-key revelation and exploration of introduced keys, grounded in `../Lodestone/site/START-HERE.md` and the current lesson behavior. No employer, career, historical-date, efficacy or personal-role claims were added. Plink’s approach note was subsequently refined in EN/JA: object positions provide pitch/rhythm input; local rules generate the Jam layer in the browser without cloud AI or learning from audio recordings. Evidence: `../sonholm/README.md` (Demo note / Paper island controls), `src/harmonize.js` placement mapping, `src/streams.js` rhythm lanes, and `src/respond.js` seeded arrangement. `MotifBrain.record` in `src/jam.js` stores generated note events for rule-based phrase responses; it is not audio recording or model training. Section authorship remains as recorded below; these incremental copy edits and checks are by Codex.

Plink's URL is independently verified over HTTPS: https://plink-arcruntime.netlify.app/ . The local release now presents it as “Public experimental demo” / “実験的な公開デモ”, links through “Try Plink” / “Plinkを試す”, and tells visitors the demo opens in English with gesture-started sound. Its EN/JA case-note limits identify the procedural prototype, lack of save/export, and pending real-iPhone/musical evaluation. This changes the access state only; it does not claim those evaluations passed. Local and post-deployment checks now require the exact link and status. The coordinator supplied final Plink owner release confirmation after fresh Chromium/WebKit technical checks. The portfolio update was then deployed to the existing Arc Runtime project.

Existing Narelog EN/JA and Lodestone URLs returned HTTP 200 on October 9. Prior local edits and verification evidence are preserved under `review/pre-recruiter-2026-10-09/`; the incremental diff is `review/recruiter-2026-10-09.patch`. The build/source allowlist and case-note checks pass. All 40 Chromium/WebKit EN/JA width/theme variants passed, including keyboard, no-JavaScript, theme persistence and expanded-note overflow checks. Desktop expanded notes and the mobile Japanese page were visually inspected. Current evidence is in `review/checks.json` and the review screenshots; these checks do not establish physical-device audio behavior. The ten-file public output plus Vercel configuration is staged in `review/deploy` for the existing `arcruntime` project. Previous production evidence is saved under `review/production-before-2026-10-09/`. Production deployment `dpl_25bvJqgC2jxs5XJVGRs7AuRmn7LV` is READY. Only the staged portfolio files were uploaded; no DNS/alias changes or browser account login were performed.

Live release verification: all ten public files match the staged SHA256 manifest. Eight Chromium/WebKit × EN/JA × phone/desktop checks passed over HTTPS, including Plink status/link, closed case notes, no audio UI, images, theme and silent seal. Both existing www language routes serve the update, and all four project destinations (Narelog EN/JA, Lodestone, Plink) returned HTTP 200. Source/config/audio paths remain excluded. Evidence: `review/release-2026-10-09.json`, `review/production-checks.json`, `review/public-links-2026-10-09.json`, `review/release-manifest.json`, and `review/deploy-inventory.json`. One initial verifier assertion was corrected to compare source text rather than CSS-uppercase display text; the corrected full live suite passed without a further deployment.

## Case-note integration history — October 5, 2026 (local at that time; shipped October 9)

Added closed-by-default, native case-note disclosures to the three existing project cards in English and Japanese. The four fields are Problem, What I built, Approach and tradeoff, and Current limits. Implementation uses a build-time `src/case-notes.mjs` module and CSS; it adds no client script or runtime dependency. Approved bio, content/configuration, routes, theme persistence, silent seal, disabled signup and lack of a Plink public link are unchanged. This local build is newer than the September 30 production release; no deployment or deployment staging was performed for it.

Authorship: Claude Opus 5.5 authored the candidate section/copy and integration/test proposals. The Codex coordinator replaced three inferred author-intent statements with descriptions of behavior. This Arc Runtime Codex pass independently reviewed and integrated only the new module/check plus narrow build, CSS and browser-check changes. It also changed Narelog's unsupported first-person problem history into a conditional workflow description in both languages. Codex performed the local verification; these checks are not model-authorship or native-speaker approval claims.

Source: `../_portfolio/claude-final-day-2026-10-05/candidates/15-arc-case-notes-55/VERIFICATION.md` and completed candidate files, not the original raw patch. Editorial guidance remains the existing `../_portfolio/narelog-site-editorial-2026-09-30/output/VOICE.md`, Section 9. Historical build labels in the existing card copy were outside this case-note slice and were not changed.

Verification: `node scripts/check-case-notes.mjs` and the existing browser suite both passed (40 Chromium/WebKit × EN/JA × width/theme combinations). Coverage includes closed initial state, all-open overflow, keyboard opening, no-JavaScript disclosure behavior, privacy/output allowlist, unchanged signup and navigation. Evidence: `review/checks.json`; the previous checks and edited-file baseline are preserved under `review/pre-case-notes-2026-10-05/`. Expanded desktop EN/dark and mobile JA/light cards were visually inspected (`review/case-notes-en-1440-dark.png`, `review/case-notes-ja-390-light.png`). An additional no-JavaScript pass confirmed mouse opening, Space closing, and closed state after language navigation in both languages. The existing equal-height desktop grid can leave whitespace beside an expanded card; no broader layout change was introduced. Physical iPhone behavior and native Japanese editorial review were not tested.

## Run

Requires Node 20 or newer. No install or runtime dependencies.

```sh
npm run build
npm run preview
```

- English: http://127.0.0.1:4328/
- Japanese: http://127.0.0.1:4328/ja/

The preview serves **only `dist/`**, never the repository root. The build copies an explicit list of public assets. Existing Git history is preserved; the previous identifying README is not included in the site or this working README. Do not publish repository history as part of a site deployment.

## Content and integration

- `src/content.mjs`: English and naturally adapted Japanese copy.
- `src/site.css`, `src/site.js`: layout, theme preference, and reduced-motion support.
- `src/assets/`: seal and current project previews. Narelog is explicitly an illustration from its approved public site, not a beta screenshot.
- `site.config.json`: `showBetaCta: false` hides the hero beta button; `betaSection: "coming-soon"` selects the compact footer row. `betaFormUrl` and `contactEmail` remain empty.
- `src/beta.mjs`: preserves the original hero CTA and complete signup section. Set `showBetaCta: true` and `betaSection: "full"` to restore them when ready.
- `scripts/build.mjs`: static bilingual HTML with escaped configuration and an output allowlist.
- `scripts/serve.mjs`: loopback-only preview with restrictive headers; source/docs/history return 404.

### MailerLite setup gate

No email fields, collection endpoint, analytics, provider embed, or fake success message are present. Once a MailerLite account and hosted signup form exist, set `betaFormUrl` to the **verified HTTPS hosted form URL**, set `betaSection` to `"full"`, optionally restore `showBetaCta`, and rebuild. Supported hosts are explicitly listed in the build script. If MailerLite supplies a different host, review it before extending that list. Do not put account secrets or API keys in this repository.

The hosted form should provide project interest (Narelog / Lodestone / Plink), email contact, explicit consent to beta-test invitations, and a privacy notice. Keep article subscriptions separate. Configure the intended audience/group, confirmation flow and unsubscribe handling in MailerLite; verify submission and delivery end to end before enabling the link. No duration or acceptance is promised by this site; individual invitations explain the task and time commitment.

Only set `contactEmail` after delivery to the chosen `@arcruntime.com` address has been tested. DNS forwarding alone does not establish a working mailbox. X and Substack links are omitted because exact public destinations have not been verified.

## Review checks

Browser checks use an existing Playwright installation (no project dependency changes):

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright npm test
```

Checks include Chromium/WebKit, EN/JA, phone/desktop, light/dark, no horizontal overflow, image loading, keyboard navigation, theme persistence, language links, reduced motion, no external requests, no form collection, closed/configured signup rendering, output privacy checks, and protected source paths. Evidence and screenshots go to ignored `review/`.

`capture.cjs` reads sibling project sources to refresh previews and writes only this repo. Refresh only after reviewing their current START-HERE/release records; source paths are local review tooling and never shipped.

## Publication

The owner authorized publication on September 30. The current production release is `dpl_5n8ygeMLbSQGmakNCUeZ4tiZKuoU` (October 9 brand share-preview update). The initial-render correction was `dpl_FZnb1y8WeW1AkDi7oV1dmaeKJa9q`. The preceding wording release was `dpl_Cw7vdGfBFPoCPxVwhsHfgUdZZcuv`. The earlier October 9 recruiter release was `dpl_25bvJqgC2jxs5XJVGRs7AuRmn7LV`. The initial September 30 release was `dpl_G8myhKEibGwDaFzy9tThsTykwY91`. Indexing is enabled, with canonical URLs and a sitemap for arcruntime.com.

Build with `npm run build`, then run `node scripts/stage.mjs`. Deploy only the sanitized `review/deploy` directory with Vercel; never deploy the repository root. The staged upload contains eleven public files plus `vercel.json`. Use explicit staged `--local-config` and `--skip-domain`, verify the candidate, then promote it. Inspect the CLI dry-run inventory before each release. Keep existing Namecheap nameservers and mail records when connecting the domain.

Vercel's verified DNS requirements for Namecheap (September 30):

| Type | Host | Value |
| --- | --- | --- |
| A | @ | 216.198.79.1 |
| A | @ | 64.29.17.1 |
| CNAME | www | 0bc1a2cbccbebb92.vercel-dns-017.com. |

The owner applied these records in Namecheap. Vercel verified both domains as configured correctly. The apex initially returned a certificate mismatch; `vercel certs issue arcruntime.com` succeeded and subsequent HTTPS/browser checks passed with normal certificate validation. Both domains serve the site, with canonical URLs pointing to the apex. No Namecheap login or browser account access was used; future registrar changes should be handled by the owner. Preserve forwarding MX records and nameservers.

Latest verification: all 40 local browser combinations passed. The deployed files matched the SHA256 release manifest, private/audio paths returned 404, and eight live Chromium/WebKit × EN/JA × phone/desktop checks passed on each custom domain. Evidence: `review/www-production-checks.json`, `review/checks.json`, `review/release-manifest.json`, `review/deploy-inventory.json`, `review/production-checks.json`.

## Audio removed from the current release

At the owner's request, the public site has no sound/music controls or playback. The seal remains keyboard-operable and animates silently. Theme and language controls remain in the header.

Reusable synthesis and playback code is retained in `src/audio.js`, `src/ambient.js`, and `src/sound.js`. Previous header markup/styles are archived in `src/experiments/audio-controls.mjs` and `src/experiments/audio-controls.css`. These files are excluded from the build and deployment. A future version should use one unified music/sound control. `backgroundMusic: false` remains recorded in configuration, but flipping it alone does not restore audio; explicitly reintegrate the archived implementation and update the build allowlist when revisiting it.

The sections below are historical review notes and do not override this release status.

## Verified review milestone — September 30, 2026

- 24 Chromium/WebKit × English/Japanese × 320/390/1440 px × dark/light combinations passed, with no horizontal overflow or failed images.
- Keyboard skip link and theme activation, persistent theme choice, language links preserving the section, reduced motion, and no-JavaScript content/navigation passed. On macOS WebKit, the link-navigation test uses Option-Tab.
- No external network requests or page exceptions from the portfolio. Compiled output contains only the nine allowed web files; identifier/claim scanning passed. Source/config/history paths return 404.
- Core text/background and button color pairs exceed 4.5:1 in both themes (lowest checked ratio 5.04:1). This is a targeted check, not a full accessibility certification or physical-device test.
- Both linked public destinations returned HTTP 200. The Lodestone live HTML matched the local L21 source byte for byte. Plink’s 28 current release files match the Paper island c880bddd9295 manifest. Narelog’s image comes from its approved public website illustration and is labeled accordingly.
- EN/JA desktop and phone screenshots were visually inspected. Evidence: `review/checks.json`, `review/preview-provenance.json`, and `review/{en,ja}-{390,1440}.png`.
- No app source changes, publishing, purchases, DNS changes or outreach. No contact delivery or MailerLite submission was performed. Signup remains explicitly closed.

## Review revision — September 30

The hero beta button is disabled by configuration. The full beta section and its EN/JA copy remain in source; the current site shows only the beta label and Coming soon / 準備中です。 Plink’s unavailable public preview is a plain status rather than a link to an inactive signup section.

The builder bio follows the original design more closely, with “over a decade” replacing the arrival year. Tokyo / SF is restored at the owner’s explicit request as a personal/aspirational reference, without claiming offices or a second operating base. Both languages reflect the same biography and intent.

Revision checks: all 24 browser combinations passed again, including hidden hero CTA, compact signup copy, keyboard/reduced-motion behavior and output scanning. The restored full signup branch still renders in EN/JA with a configured form URL. Desktop EN and phone JA screenshots were visually inspected after the change.

Launch readiness (read-only check): Namecheap nameservers and forwarding MX remain in place; no apex A record or www CNAME was returned. Existing Vercel and Cloudflare account access works; neither project list contains an Arc Runtime site. Recommended release path: use the existing Vercel account, upload only dist as a separate Arc Runtime project, connect apex/www through the exact records Vercel supplies at Namecheap, and verify HTTPS/redirects. Keep existing nameservers and mail records. No MailerLite or mailbox setup is needed for this coming-soon version. Public deployment and DNS changes remain pending the owner's go-ahead; no changes were made to either service.

## Seal and optional music audition — September 30

Hero copy now ends “Useful things with a playful streak,” with matching Japanese wording.

The seal is a keyboard-operable button: press to redraw the mark. With sound enabled it plays an original E–B–A bell phrase. Reduced motion leaves the finished mark visible. Sound starts off on every page load. The audio controls provide a sound switch, music play/pause and volume. Music pauses at its current position; returning from a backgrounded page stays silent and requires a new gesture. Failed or timed-out audio startup reports an error and can be retried.

`src/ambient.js` contains the optional, original 72 BPM ambient sketch: soft sine-based pads, rounded bass, and sparse bell phrases over Amaj9 / F#m9 / Dmaj9 / E6/9. It uses no downloaded samples or external service. The music is an audition draft awaiting the owner's taste judgment, not an accepted soundtrack.

The earlier audition used a `backgroundMusic` configuration switch. That integration has now been archived; see the current audio removal notes above. Its runtime files shared synthesis and handled gesture/start/pause/error/background behavior. Current public output contains eleven files and excludes all audio modules.

Historical audio checks (only applicable after restoring the audio integration):

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright node scripts/check-audio.cjs
```

`review/audio-checks.json` records browser and offline signal checks; `review/ambient-sketch.wav` is a review-only 42-second render at the default volume, with a closing fade. It is not part of the website. These checks do not establish subjective musical quality or physical iPhone playback.

## Accepted music and header controls — September 30

The owner elected to keep the music and approved the new hero copy. Audio controls now live in the top-right header alongside language/theme controls. Sound remains a direct toggle; the musical-note menu contains music play/pause and volume, with Escape and outside-click dismissal. Mobile keeps these controls in the header.

Music now enters through a smooth four-beat gain ramp (3.33 seconds at 72 BPM), beginning with the first scheduled note. This fade has its own gain stage so changing volume cannot accidentally remove it. Pause/resume retains its position, including an entrance still in progress; a fresh start after muting/backgrounding receives the full entrance again. The music-off configuration switch is retained.
