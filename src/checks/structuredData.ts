import type { CheerioAPI } from 'cheerio';
import { StructuredDataResult } from '../types';

function collectTypes(node: unknown, out: string[]): void {
  if (!node || typeof node !== 'object') return;
  const record = node as Record<string, unknown>;
  const type = record['@type'];

  if (typeof type === 'string') out.push(type);
  else if (Array.isArray(type)) out.push(...type.filter((t): t is string => typeof t === 'string'));

  const graph = record['@graph'];
  if (Array.isArray(graph)) {
    for (const entry of graph) collectTypes(entry, out);
  }
}

export function checkStructuredData($: CheerioAPI): StructuredDataResult {
  const scripts = $('script[type="application/ld+json"]');
  const types: string[] = [];
  let invalidJsonLdBlocks = 0;

  scripts.each((_, el) => {
    const raw = $(el).contents().text();
    try {
      const json = JSON.parse(raw);
      const entries = Array.isArray(json) ? json : [json];
      for (const entry of entries) collectTypes(entry, types);
    } catch {
      invalidJsonLdBlocks++;
    }
  });

  return {
    jsonLdBlocks: scripts.length,
    invalidJsonLdBlocks,
    types: [...new Set(types)],
    hasFaqSchema: types.includes('FAQPage'),
  };
}
