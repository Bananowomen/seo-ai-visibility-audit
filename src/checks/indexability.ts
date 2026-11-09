import type { CheerioAPI } from 'cheerio';
import { IndexabilityResult } from '../types';

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname.replace(/\/$/, '')}`;
  } catch {
    return url;
  }
}

function robotsDisallowsPath(robotsTxt: string, path: string): boolean {
  const lines = robotsTxt.split('\n').map((l) => l.trim());
  let appliesToAll = false;

  for (const line of lines) {
    if (/^user-agent:\s*\*/i.test(line)) {
      appliesToAll = true;
      continue;
    }
    if (/^user-agent:/i.test(line)) {
      appliesToAll = false;
      continue;
    }
    if (appliesToAll && /^disallow:/i.test(line)) {
      const rule = line.split(':').slice(1).join(':').trim();
      if (rule && path.startsWith(rule)) return true;
    }
  }
  return false;
}

export function checkIndexability(
  $: CheerioAPI,
  pageUrl: string,
  robotsTxt: string | null
): IndexabilityResult {
  const metaRobots = $('meta[name="robots"]').attr('content') ?? null;
  const isNoindex = !!metaRobots && /noindex/i.test(metaRobots);
  const canonicalUrl = $('link[rel="canonical"]').attr('href') ?? null;
  const path = new URL(pageUrl).pathname;

  return {
    robotsTxtFound: robotsTxt !== null,
    robotsTxtDisallowsPath: robotsTxt ? robotsDisallowsPath(robotsTxt, path) : false,
    metaRobots,
    isNoindex,
    canonicalUrl,
    canonicalMatchesUrl: canonicalUrl
      ? normalizeUrl(canonicalUrl) === normalizeUrl(pageUrl)
      : true,
  };
}
