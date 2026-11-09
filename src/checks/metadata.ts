import type { CheerioAPI } from 'cheerio';
import { MetadataResult } from '../types';

export function checkMetadata($: CheerioAPI): MetadataResult {
  const title = $('title').first().text().trim() || null;
  const metaDescription = $('meta[name="description"]').attr('content')?.trim() || null;
  const h1s = $('h1');
  const h1Texts = h1s
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean);

  return {
    title,
    titleLength: title?.length ?? 0,
    metaDescription,
    metaDescriptionLength: metaDescription?.length ?? 0,
    h1Count: h1s.length,
    h1Texts,
  };
}
