#!/usr/bin/env node
import * as cheerio from 'cheerio';
import { fetchPage, fetchRobotsTxt } from './fetchPage';
import { checkIndexability } from './checks/indexability';
import { checkMetadata } from './checks/metadata';
import { checkStructuredData } from './checks/structuredData';
import { checkContent } from './checks/content';
import { checkAiReadiness } from './checks/aiReadiness';
import { buildIssues, printReport } from './report';
import { PageAuditResult } from './types';

async function auditUrl(url: string): Promise<PageAuditResult> {
  const { html, status, fetchMs } = await fetchPage(url);
  const $ = cheerio.load(html);
  const origin = new URL(url).origin;
  const robotsTxt = await fetchRobotsTxt(origin);

  const indexability = checkIndexability($, url, robotsTxt);
  const metadata = checkMetadata($);
  const structuredData = checkStructuredData($);
  const content = checkContent($);
  const aiReadiness = checkAiReadiness($, structuredData);

  const partial = {
    url,
    fetchMs,
    httpStatus: status,
    indexability,
    metadata,
    structuredData,
    content,
    aiReadiness,
  };

  return { ...partial, issues: buildIssues(partial) };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const jsonFlagIndex = args.indexOf('--json');
  const asJson = jsonFlagIndex !== -1;
  if (asJson) args.splice(jsonFlagIndex, 1);

  const url = args[0];
  if (!url) {
    console.error('Usage: seo-ai-audit <url> [--json]');
    process.exitCode = 1;
    return;
  }

  const result = await auditUrl(url);

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printReport(result);
  }

  // Set exitCode rather than calling process.exit(): forcing an immediate
  // exit while undici's fetch keep-alive sockets are still open crashes
  // Node on Windows (libuv assertion in src/win/async.c). exitCode lets the
  // event loop drain and close those handles normally.
  process.exitCode = result.issues.some((i) => i.severity === 'critical') ? 1 : 0;
}

main().catch((err) => {
  console.error('Audit failed:', err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
