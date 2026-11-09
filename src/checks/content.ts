import type { CheerioAPI } from 'cheerio';
import { ContentResult } from '../types';

const THIN_CONTENT_WORD_THRESHOLD = 300;

export function checkContent($: CheerioAPI): ContentResult {
  const body = $('body').clone();
  body.find('script, style, noscript, template').remove();

  const text = body.text().replace(/\s+/g, ' ').trim();
  const wordCount = text ? text.split(' ').length : 0;

  return {
    wordCount,
    isThin: wordCount < THIN_CONTENT_WORD_THRESHOLD,
  };
}
