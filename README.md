# SEO & AI Visibility Audit

Most SEO tools tell you what's wrong after Google already buried you. This one checks the thing most of them skip entirely: whether an AI system would ever quote your page back to the person who asked.

One CLI call. Indexability, metadata, structured data, thin content, and an AI-answer readiness score — classic search and AI search, audited in the same pass instead of two separate problems nobody connects.

## Why

Ranking in Google and getting cited inside an AI answer (ChatGPT, Google AI Overviews, Perplexity) run on overlapping but not identical signals. A page can rank fine and still never get cited — or the reverse. Most audit tools only ever checked the first half. This one checks both, and tells you exactly which one a given problem is going to cost you.

## Install

```
git clone <this-repo-url>
cd seo-ai-visibility-audit
npm install
npm run build
```

## Usage

```
node dist/cli.js https://example.com
node dist/cli.js https://example.com --json > report.json
```

Exit code is `1` if any critical issue was found, `0` otherwise — safe to drop into CI.

## Example run

```
$ node dist/cli.js https://example.com

SEO & AI-search audit — https://example.com
────────────────────────────────────────────────────────────
HTTP 200 · fetched in 80ms
AI-answer readiness score: 20/100
Issues: 0 critical, 5 warning, 0 info

▲ WARNING  [metadata] Missing meta description — search engines will auto-generate a snippet instead.
▲ WARNING  [metadata] No <h1> found — weak page-topic signal.
▲ WARNING  [structured-data] No JSON-LD structured data found — AI systems have less to cite confidently.
▲ WARNING  [content] Only 25 words of body text — thin content is a common reason pages lose both rankings and AI citations.
▲ WARNING  [ai-readiness] AI-answer readiness score is 20/100 — the page isn't structured the way AI systems tend to quote from.
```

That's a real, unedited run against `example.com` — a page with no metadata, no structured data and 25 words of copy. The score is blunt on purpose: a page this thin has nothing for an AI system to quote, and no audit tool should pretend otherwise.

```
$ node dist/cli.js https://example.com --json > report.json
```

Pipes the full structured result — every field above, plus the raw indexability/metadata/structured-data objects — for wiring into CI, a dashboard, or a client report.

## What it checks

- **Indexability** — `robots.txt` rules, meta-robots `noindex`, canonical tag correctness.
- **Metadata** — title and description presence/length, `<h1>` count.
- **Structured data** — JSON-LD blocks found, `schema.org` types present, `FAQPage` detection.
- **Content** — word count, thin-content flag.
- **AI-answer readiness** — heading hierarchy, question-style headings, a scannable first paragraph, presence of structured data. Scored 0–100.

## What it does not do

This reads the HTML as served over the wire — it does not execute client-side JavaScript, so a page that renders its content purely client-side will look emptier than it is. It also does not simulate how any specific AI system actually selects citations; the readiness score is a structural proxy, not a guarantee of ranking or citation.

## License

MIT — Uliana Sierik
