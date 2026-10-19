# Maple Thermodynamics Academy

Science Olympiad Division B | 2026–2027 · Regional website release 1.0

A static educational website built from the supplied Astra public curriculum. It needs no student accounts, database, paid service, API key, or personal server after publication. The GitHub Pages site runs entirely in the student's browser.

## Run locally

Install Node.js 24 or later, then open a terminal in this folder:

```sh
npm run build
npm test
npm start
```

Open `http://127.0.0.1:4173/maple-thermodynamics/`. Stop the preview with Ctrl+C. No `npm install` is required: the build uses Node built-ins and a vendored MIT-licensed Markdown renderer (Marked 17.0.5). Browser modules must be served over HTTP; double-clicking index.html is not a supported preview method.

## Publication using GitHub Desktop

Publish **this `maple-thermodynamics` folder only**, not its parent folder, the supplied ZIP, or the editorial source workspace.

1. In GitHub Desktop, sign in to your GitHub account. Choose **File → New repository**.
2. Set **Name** to `maple-thermodynamics`. Set **Local path** to the parent folder `C:\Projects`. GitHub Desktop will use this existing `maple-thermodynamics` subfolder. Do not create a second nested folder. Leave README/license initialization off; this project already has a README. Create the repository.
3. Ensure the branch is named **main** (Branch → Rename if needed). Review Changes and commit the website files with a message such as `Build Regional academy release 1.0`. If Desktop's initial commit already included them, no second commit is necessary.
4. Click **Publish repository**. Keep the name `maple-thermodynamics`, uncheck **Keep this code private**, and publish. Free GitHub Pages requires a public repository on GitHub Free. Check that no private instructor materials are listed before publication.
5. On GitHub, open the repository's **Settings → Pages**. Under **Build and deployment**, set **Source** to **GitHub Actions**.
6. Open **Actions → Verify and deploy GitHub Pages → Run workflow**, selecting `main`. The first push may run before Pages is enabled; rerun after step 5 if needed.
7. Wait for both **build** and **deploy** jobs to succeed. The `github-pages` deployment shows the actual published URL, normally `https://YOUR-USERNAME.github.io/maple-thermodynamics/`.
8. At the published URL, open a chapter, worksheet, test, formula, and PDF. Refresh a chapter URL such as `…/maple-thermodynamics/#lesson/U1-C01`. Enter a response, refresh, and confirm it persists. Check the site from a phone.

The workflow builds and tests from source and uploads **only `dist/`**. The output folder is intentionally Git-ignored. No deployment has been claimed or confirmed by this local delivery.

Official instructions checked during implementation: [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [publishing source settings](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## What is included

- Five units and all 33 complete chapters; full-text search, unit filtering, related worksheets, previous/next navigation, printing, bookmarks, completion, and interactive mastery checklists.
- WS01–WS33 with all 264 questions; T01–T04 with all 96 questions; the supplied eight-question prerequisite diagnostic.
- Preserved test choice IDs and numeric response-field IDs, reference diagrams and accessible data tables, saved response drafts, completion/input-format checks, review before submission, separate saved attempts, retry, optional timers, response export, and self-reported scores.
- 42 searchable original formula records and all supplied reference Markdown resources.
- Nine interactive physics tools with explicit assumptions, including a heating curve with accessible transition table.
- All 21 supplied original public PDFs. Worksheets download their original **unit practice PDF** because individual worksheet PDFs were not supplied; original individual Markdown files and browser printing are also available.
- Browser-local progress, validated manual JSON export/import, future-ID preservation, light/dark themes, and responsive navigation.

## Grading and public/private boundary

The supplied public package contains **no authorized assessment answers, model solutions, numerical targets, or tolerances**. Its handoff explicitly forbids publishing instructor keys. Therefore this site does not claim correctness grading or model-answer self-assessment. It checks response completeness and finite numeric input, supplies general self-check prompts and lesson links, and exports student work for review. A manually entered score is visibly **self-reported**, not verified.

To add real grading later, first supply an explicitly approved **public student feedback** dataset with question IDs, objective targets/tolerances and model responses. Anything shipped to this static site is publicly accessible. Do not upload private instructor keys or pretend that answers bundled in JavaScript are secret. A private grading service is a different, separately authorized architecture.

The competition score tool is an **illustrative weighted score sandbox**, not the official event scoring formula. No copyrighted rules PDF is included, and the deferred device/competition curriculum has not been generated.

## Structure and future content

```text
content/                  Original allowlisted public-student files, unchanged
web/                      UI, styles, progress validation, calculator logic
scripts/build.mjs         Public allowlist, validation, Markdown conversion, static output
scripts/vendor/           Marked 17.0.5 and its MIT license
scripts/serve.mjs          Local-only preview server
tests/                    Core checks and optional browser regression suite
reports/                  Content checksums and browser/visual verification evidence
.github/workflows/        GitHub Pages build/test/deploy workflow
dist/                     Generated static site, not committed
```

Hash routes work at arbitrary GitHub project subpaths without rewrite rules. Asset links resolve relative to the canonical source file before output. Curriculum IDs, original Markdown, JSON, PDF, and graphics are retained. Compiled download copies are never counted as new questions.

For a future release, add approved public files under `content/`, update the public manifest and release index, and adjust the explicit release-count assertions in the build and tests. The UI reads those catalogs; it does not need new pages for every lesson or assessment. Update any release-specific dashboard copy and statistics. Preserve stable IDs and use a new content revision if existing questions change. The progress schema is version 1; introduce a migration before changing its shape. Import preserves unknown future IDs separately. Units 6–7, WS34–WS47, and QZ01–QZ06 are deferred.

## Testing

`npm run build` audits public file allowlisting, forbidden key fields, IDs, counts, point totals, local Markdown links, assessment figures, and output boundaries. `npm test` checks core numerical cases, physical-domain errors, canonical content preservation, progress validation, and PDF signatures.

The optional browser suite requires Playwright and Chrome, separate from production. Set `PLAYWRIGHT_MODULE` to an installed Playwright module and `CHROME_PATH` to Chrome's executable, then run `node tests/browser.mjs`. It starts and stops its own localhost server. Results and screenshots are saved under `reports/`. The browser test export is synthetic test data and is not part of the deployment.

Browser progress can be edited or deleted by the device user. Storage failures are surfaced; in that case export before closing the tab. Imports are bounded to 5 MB, reject unsafe keys and invalid known question/field mappings, and require confirmation before replacing local state. No student information or responses are transmitted to a server by this application.

## Rights

Original curriculum remains the supplied author's material; no new license is asserted over it. Marked is MIT licensed; see `scripts/vendor/MARKED-LICENSE.md`. No external fonts, analytics, runtime CDNs, or API services are required.

## Publication security remediation

See `reports/security-remediation.md` for the final security/privacy changes and verification. The public blueprint now has a corrected Markdown source next to its PDF. Only that planning document and the public manifest were changed; chapters, assessments, formulas, and their original PDFs remain intact. To regenerate the blueprint editorially, install Python `reportlab` and run `python scripts/render-blueprint.py` using Arial or DejaVu Sans. This is not required to build or host the website.

The application accepts UUID v4 attempt IDs generated by the academy. Malformed identifiers, duplicate attempts, mismatched question IDs, unsafe object keys, oversized inputs, and invalid record structures are rejected. Unknown but well-formed future curriculum records are validated and kept separately. Links use DOM text/attribute setters and encoded route components. Written responses remain plain text, even if they contain HTML-like characters.

The project is an independent educational resource, not an official Science Olympiad publication or endorsement. Detailed competition procedures and scoring rules were removed from the public blueprint; consult official event resources. No legal clearance of the unavailable original manual is claimed.
