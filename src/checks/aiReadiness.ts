import type { CheerioAPI } from 'cheerio';
import { AiReadinessResult, StructuredDataResult } from '../types';

const QA_HEADING_PATTERN = /^(what|how|why|when|where|who|which|can|does|do|is|are)\b.+\?$/i;

export function checkAiReadiness(
  $: CheerioAPI,
  structuredData: StructuredDataResult
): AiReadinessResult {
  const hasClearHeadingHierarchy = $('h1').length === 1 && $('h2').length >= 1;

  let hasFaqOrQaPattern = structuredData.hasFaqSchema;
  $('h2, h3').each((_, el) => {
    if (QA_HEADING_PATTERN.test($(el).text().trim())) hasFaqOrQaPattern = true;
  });

  const firstParagraph = $('p').first().text().trim();
  const hasDirectAnswerParagraph = firstParagraph.length > 40 && firstParagraph.length < 320;

  let score = 0;
  if (hasClearHeadingHierarchy) score += 30;
  if (hasFaqOrQaPattern) score += 35;
  if (hasDirectAnswerParagraph) score += 20;
  if (structuredData.jsonLdBlocks > structuredData.invalidJsonLdBlocks) score += 15;

  return {
    hasClearHeadingHierarchy,
    hasFaqOrQaPattern,
    hasDirectAnswerParagraph,
    score: Math.min(100, score),
  };
}
