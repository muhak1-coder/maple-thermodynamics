# Regional website release 1.0 — implementation report

Prepared October 18, 2026.

The working static website is in this `maple-thermodynamics` folder. It is populated with the original Astra curriculum and prepared for GitHub Pages. **It has not been published.** Assessment correctness grading and model-answer feedback remain unavailable because the supplied public package contains no approved answer data.

## Delivered features

| Area | Delivered and verified |
| --- | --- |
| Dashboard | Five-unit learning path, chapter completion statistics, recently visited lessons, continue-learning action, worksheet/test shortcuts |
| Textbook | All 33 chapters across Units 1–5 (6 / 7 / 7 / 8 / 5), full original text, diagrams, worked examples, reviews, full-text search, unit filter, bookmarks, mastery checks, previous/next links, print layout |
| Worksheets | WS01–WS33, eight questions each, all 264 questions; original prompts and legacy question types retained; choice controls where supplied and written response areas for other types |
| Practice tests | T01–T04, 24 questions and 60 possible points each, all 96 questions; question navigation, numeric fields with units, reasoning, reference diagrams and tables, optional timer with pause/reset, review flags and separate submitted attempts |
| Diagnostic | Supplied D01 prerequisite diagnostic, eight questions |
| Review and retry | Draft autosave, input-format/completion checking, general self-check prompts, related lesson links, attempt review, fresh drafts, response exports, separately labeled self-reported scores |
| Formula library | All 42 original records, searchable equations, supplied variable/unit mappings, use cases and mini-examples |
| Physics tools | Temperature conversion, specific heat, heat capacity, latent heat, ideal gas pressure, thermal efficiency, heating curve, temperature gain, illustrative competition scoring |
| Study resources | Original reference and formula packets, 21 original public PDFs, individual assessment Markdown downloads |
| Progress | Browser-local chapters, mastery checks, bookmarks, recent lessons, drafts, attempts and self-reported scores; manual export/import, reset confirmation, import validation and future-ID preservation |
| Interface | Navy/blue design, light/dark theme, responsive sidebar, mobile menu, semantic headings, visible control labels, focus styles, keyboard navigation and print styles |
| Hosting | Static HTML/CSS/JavaScript, relative assets and hash routes, no runtime CDN or paid dependencies, GitHub Actions workflow deploying only the allowlisted `dist/` output |

## Curriculum preservation and public boundary

The initial implementation preserved all 336 supplied public files. Following the publication audit, only the blueprint PDF and public manifest were revised; 334 original public files remain unchanged. A corrected blueprint Markdown source was added. See `reports/security-remediation.md` for the security and copyright remediation record. The build processes Markdown into HTML without replacing substantive lesson content. Compiled download copies do not create duplicate curriculum entities.

The public manifest is the build allowlist. Build checks reject unexpected files, private-key field names, missing local links, incorrect assessment totals, duplicate question IDs and unrecognized output artifacts. The published artifact contains only website assets and approved public curriculum. It excludes the supplied ZIP, parent editorial workspace, root admin manifests, instructor files, student records, credentials and copyrighted official rules PDF. Synthetic browser-test exports are Git-ignored and never enter `dist/`.

Stable chapter, worksheet, test and question IDs are retained. Test response exports follow the supplied learner-response structure: `assessment_id`, `attempt_id`, canonical `question_id`, `selected_choice_id`, `numeric_values` keyed by original field IDs, and reasoning. Invalid numeric text remains saved in the draft and must be corrected before a schema-compatible test response export. General progress export can still preserve that draft.

## Verification evidence

- **Build audit passed:** 33 chapters, 33 worksheets, four tests, one diagnostic, 368 unique canonical questions, 42 formulas and 21 PDFs. All local content links and assessment figure paths resolve. Checksums are in `reports/content-audit.json`.
- **Core tests passed (expanded during security remediation):** inventory; unchanged chapter text; calculator reference cases; heating transitions; finite-number and physical-domain validation; numeric/reasoning completion; progress import/export and unsafe input rejection; PDF signatures; canonical test-export mappings.
- **Browser regression passed in desktop Chrome:** all 33 chapters and their images; every one of the 368 question prompts and expected input controls; all assessment figures; drafts across refresh; lesson completion, bookmarks and mastery persistence; full-text search; review flags; submission, retry and self-reported score storage; timer start/pause/reset; formulas and nine calculators; file-based progress export/reset/import.
- **All 21 PDF links returned HTTP 200 and PDF bytes** under the actual project-style `/maple-thermodynamics/` preview path.
- **Mobile checks at 390 px:** dashboard, lesson, practice, formula, lab, resource and progress pages had no horizontal viewport overflow. Menu and theme controls worked. Closed navigation is hidden from interaction.
- **Print CSS checked:** sidebar navigation is removed in print mode. Original PDFs remain the preferred fixed-layout printable resources.
- **No uncaught browser JavaScript errors or failed HTTP responses** in the regression run. Details are in `reports/browser-tests.json`.
- Desktop dashboard, heating laboratory and mobile screenshots were reviewed. Evidence is under `reports/screenshots/`.

The local preview used the same repository subpath as GitHub Pages. Refreshing hash routes and resolving images/PDFs therefore did not rely on a development-server fallback. Browser testing was performed with Chrome, not a full Safari/Firefox/device matrix. Twenty original PDF files remain unchanged. The revised blueprint PDF was regenerated from its public Markdown source and all four revised pages were visually inspected. All PDF download links were tested.

## Outstanding limitations

1. **Correctness grading and model-answer self-assessment:** unavailable. No answer/key mapping can be verified without approved answer data. The handoff explicitly prohibits publishing private instructor keys. The site does not mistake completion for correctness or award an invented score. Add an explicitly approved public feedback dataset in a future change, or separately authorize a private grading service.
2. **Competition scoring:** the working calculator is an illustrative weighted-normalization sandbox, prominently labeled as such. It is not an official tournament scoring implementation.
3. **Deployment:** no repository creation or publication has been performed. The cleaned initial commit will use the owner-confirmed GitHub noreply identity. Publication requires the owner's separate final approval. Follow `reports/security-remediation.md` and the final readiness report.
4. **Deferred curriculum:** Units 6–7, WS34–WS47 and all six quizzes remain deferred. No content was fabricated for them.

These are explicit release boundaries, not hidden placeholder pages. Every required navigation section has working content or tools.

## Run and publish

From this folder, run `npm run build`, `npm test`, then `npm start`. Node.js 24+ is required only to build/preview; the hosted student website needs only a browser. No package installation is needed.

For publication, create the `maple-thermodynamics` repository in GitHub Desktop using this folder, publish it as public, select **GitHub Actions** in repository **Settings → Pages**, and run the included workflow. It follows the official [GitHub Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). Full click-by-click directions and post-deployment checks are in `README.md`.

The expected URL is `https://YOUR-USERNAME.github.io/maple-thermodynamics/`; this is a template, not a verified deployment URL. Confirm the actual URL from the successful GitHub Pages deployment and verify a chapter, worksheet, test and PDF on that live site.
