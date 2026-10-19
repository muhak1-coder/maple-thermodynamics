# Publication security remediation

Regional Release 1.0. Publication and live-site verification are pending the owner's separate approval.

## Security corrections

- Progress import now requires UUID v4 attempt IDs (the format produced by `crypto.randomUUID()`), canonical assessment IDs, matching question IDs, valid timestamps, bounded plain-object structures, finite in-range self-reported scores, and known response fields for existing assessments. Duplicate attempts, prototype keys, unexpected fields and excessive nesting are rejected.
- Future-content records receive the same structural and identifier validation and remain separate from active progress. Legitimate version 1 exports retain completed lessons, bookmarks, drafts, mastery checks and submitted attempts.
- Links use DOM `textContent` and `setAttribute`, with encoded route components. Imported response text is escaped in text areas, review pages and printable responses. No imported identifier is interpreted as HTML.
- The page has a restrictive Content Security Policy: only local scripts are permitted; inline script handlers, objects, network API connections and base-URL changes are disallowed. This is an additional safeguard, not a substitute for input validation.
- Browser tests import malicious files, reject them without replacing storage, display markup-like response text literally, check printing, reload saved responses, and reject tampered local storage.

## Privacy and assessment disclosure

The README uses a generic project path. Software tests use fictional assessment records and explicitly artificial browser inputs instead of live assessment solutions. The previous answer-bearing test strings are absent from the corrected files. The ignored browser-test export is regenerated with artificial responses and is not published.

The intended local author and committer identity is `muhak1-coder <343269258+muhak1-coder@users.noreply.github.com>`, supplied and confirmed by the owner. The unpublished initial commit is amended after testing; the final readiness response records its verified hash and identity. Do not push the original commit or a backup ref.

A verified Git bundle of the original local repository was created outside this repository before history changes. That backup intentionally contains the old private metadata and must remain private. It is not staged or included in the Pages output. Local reflogs may retain the former commit for recovery; ordinary publication of the cleaned `main` branch does not transfer unreachable reflog-only history.

## Copyright handling and exact curriculum changes

Only these existing curriculum files changed:

1. `content/downloads/MAPLE_Phase_A_Blueprint.pdf`: regenerated after removing detailed rules-derived device requirements, event parameter tables, procedural descriptions, scoring expressions, penalties and tie-breaking instructions. Scientific teaching guidance and the historical instructional plan remain. The revised public edition explicitly distinguishes the completed Regional curriculum from deferred plans.
2. `content/content_manifest.json`: updated blueprint sizes and added the corrected Markdown source to the public allowlist.

Added `content/downloads/MAPLE_Phase_A_Blueprint.md` as the reproducible public source. No corresponding blueprint JSON existed in the supplied public package. The original editorial Markdown and ZIP outside the repository remain archival inputs, not publication sources. The application build packages the corrected public Markdown/PDF and manifest only. `scripts/render-blueprint.py` reproduces the PDF editorially; normal builds need no Python dependencies.

All other **334 original public files** remain byte-identical to the supplied package. In particular, no instructional chapter, worksheet, Regional test, formula, diagram, or unit workbook/practice PDF was rewritten. The original student-facing worked examples remain available. The site still provides five units, 33 chapters, 33 worksheets, four tests, 42 formulas, nine physics tools and 21 PDFs, plus the prerequisite diagnostic.

The [official copyright policy](https://www.soinc.org/copyrights-media-and-use) was reviewed. A reliable local comparison with the authorized 2027 rules manual was unavailable, so the detailed flagged passages were excluded conservatively rather than declared legally cleared. The revised blueprint links to official event resources and corrections. The blueprint and website identify the academy as an independent educational project, not an official publication or endorsement. The official manual is not distributed.

## Verification

- Production build: all canonical counts, point totals, IDs, asset links and public output allowlists pass.
- Core suite: 13 passing tests, including malicious IDs, malformed shapes, future records, duplicate attempts, timestamp/score bounds, literal response text, URL encoding and existing numerical/content tests.
- Desktop Chrome suite: all 33 lessons, all 368 question prompts, all worksheet/test controls and diagrams, navigation, search, completion, bookmarks, mastery, timers, draft persistence, submission/retry, formulas, nine tools, all 21 PDF URLs and progress export/import.
- Security browser checks: malicious imports do not execute JavaScript or inject elements; rejected files leave existing storage unchanged; HTML-like free text stays inert in review/print views and after reload; tampered saved storage is rejected.
- Mobile browser simulation: 390 px viewport, seven page types, menu, theme and no horizontal page overflow. This is simulated browser testing, not physical phone testing.
- Revised PDF: all four pages rendered and visually checked. Other PDFs remain unchanged; download accessibility and signatures checked.
- Evidence: `reports/browser-tests.json`, `reports/content-audit.json`, and the updated screenshots. Temporary PDF renders and synthetic exports are ignored.

## Hosting and remaining limitations

The existing Pages workflow builds with Node 24 and the vendored Markdown renderer, runs the core tests, and deploys only `dist/`. No dependency installation, API credentials, database or backend is required for existing production functionality. Once GitHub Pages deployment is actually completed and verified, the site will run independently of the owner's PC, local preview server, Codex session or AI credits. Deployment has not occurred at this stage.

Progress stays in each browser and requires manual export/import between devices. Public assessment correctness grading remains unavailable because no approved public answer dataset was supplied; completion checking and explicitly self-reported scores are retained. Competition scoring remains an illustrative sandbox, not an official scoring implementation. Units 6–7 and planned quizzes remain deferred.

The audit is a technical publication review, not a legal warranty or a claim that unknown third-party sources have been exhaustively compared. No instructor keys, credentials, real student records or private archives are part of the intended public repository or deployment.
