export type Severity = 'critical' | 'warning' | 'info';

export interface Issue {
  severity: Severity;
  area: string;
  message: string;
}

export interface IndexabilityResult {
  robotsTxtFound: boolean;
  robotsTxtDisallowsPath: boolean;
  metaRobots: string | null;
  isNoindex: boolean;
  canonicalUrl: string | null;
  canonicalMatchesUrl: boolean;
}

export interface MetadataResult {
  title: string | null;
  titleLength: number;
  metaDescription: string | null;
  metaDescriptionLength: number;
  h1Count: number;
  h1Texts: string[];
}

export interface StructuredDataResult {
  jsonLdBlocks: number;
  invalidJsonLdBlocks: number;
  types: string[];
  hasFaqSchema: boolean;
}

export interface ContentResult {
  wordCount: number;
  isThin: boolean;
}

export interface AiReadinessResult {
  hasClearHeadingHierarchy: boolean;
  hasFaqOrQaPattern: boolean;
  hasDirectAnswerParagraph: boolean;
  score: number;
}

export interface PageAuditPartial {
  url: string;
  fetchMs: number;
  httpStatus: number;
  indexability: IndexabilityResult;
  metadata: MetadataResult;
  structuredData: StructuredDataResult;
  content: ContentResult;
  aiReadiness: AiReadinessResult;
}

export interface PageAuditResult extends PageAuditPartial {
  issues: Issue[];
}
