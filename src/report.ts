import { Issue, PageAuditPartial, PageAuditResult } from './types';

export function buildIssues(result: PageAuditPartial): Issue[] {
  const issues: Issue[] = [];
  const { indexability, metadata, structuredData, content, aiReadiness } = result;

  if (indexability.isNoindex) {
    issues.push({
      severity: 'critical',
      area: 'indexability',
      message: 'Page has a noindex meta-robots tag — it will not appear in search at all.',
    });
  }
  if (indexability.robotsTxtDisallowsPath) {
    issues.push({
      severity: 'critical',
      area: 'indexability',
      message: 'robots.txt disallows this path — crawlers may skip it entirely.',
    });
  }
  if (!indexability.canonicalMatchesUrl) {
    issues.push({
      severity: 'warning',
      area: 'indexability',
      message: `Canonical tag points elsewhere (${indexability.canonicalUrl}) — confirm this is intentional.`,
    });
  }

  if (!metadata.title) {
    issues.push({ severity: 'critical', area: 'metadata', message: 'Missing <title> tag.' });
  } else if (metadata.titleLength > 60) {
    issues.push({
      severity: 'info',
      area: 'metadata',
      message: `Title is ${metadata.titleLength} characters — likely truncated in search results.`,
    });
  }
  if (!metadata.metaDescription) {
    issues.push({
      severity: 'warning',
      area: 'metadata',
      message: 'Missing meta description — search engines will auto-generate a snippet instead.',
    });
  }
  if (metadata.h1Count === 0) {
    issues.push({ severity: 'warning', area: 'metadata', message: 'No <h1> found — weak page-topic signal.' });
  } else if (metadata.h1Count > 1) {
    issues.push({
      severity: 'info',
      area: 'metadata',
      message: `${metadata.h1Count} <h1> tags found — keep one per page.`,
    });
  }

  if (structuredData.jsonLdBlocks === 0) {
    issues.push({
      severity: 'warning',
      area: 'structured-data',
      message: 'No JSON-LD structured data found — AI systems have less to cite confidently.',
    });
  }
  if (structuredData.invalidJsonLdBlocks > 0) {
    issues.push({
      severity: 'critical',
      area: 'structured-data',
      message: `${structuredData.invalidJsonLdBlocks} JSON-LD block(s) failed to parse — invalid structured data is often ignored entirely.`,
    });
  }

  if (content.isThin) {
    issues.push({
      severity: 'warning',
      area: 'content',
      message: `Only ${content.wordCount} words of body text — thin content is a common reason pages lose both rankings and AI citations.`,
    });
  }

  if (aiReadiness.score < 50) {
    issues.push({
      severity: 'warning',
      area: 'ai-readiness',
      message: `AI-answer readiness score is ${aiReadiness.score}/100 — the page isn't structured the way AI systems tend to quote from.`,
    });
  }

  return issues;
}

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 } as const;
const SEVERITY_LABEL = { critical: '✖ CRITICAL', warning: '▲ WARNING ', info: 'ℹ INFO    ' } as const;

export function printReport(result: PageAuditResult): void {
  const counts = { critical: 0, warning: 0, info: 0 };
  for (const issue of result.issues) counts[issue.severity]++;

  console.log(`\nSEO & AI-search audit — ${result.url}`);
  console.log('─'.repeat(60));
  console.log(`HTTP ${result.httpStatus} · fetched in ${result.fetchMs}ms`);
  console.log(`AI-answer readiness score: ${result.aiReadiness.score}/100`);
  console.log(`Issues: ${counts.critical} critical, ${counts.warning} warning, ${counts.info} info\n`);

  const sorted = [...result.issues].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  for (const issue of sorted) {
    console.log(`${SEVERITY_LABEL[issue.severity]} [${issue.area}] ${issue.message}`);
  }
  if (result.issues.length === 0) {
    console.log('No issues found by this checklist.');
  }
  console.log('');
}
