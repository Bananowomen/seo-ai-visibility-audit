export interface FetchedPage {
  html: string;
  status: number;
  fetchMs: number;
}

const USER_AGENT = 'seo-ai-visibility-audit/0.1 (+https://github.com/; portfolio audit tool)';

export async function fetchPage(url: string): Promise<FetchedPage> {
  const start = Date.now();
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    redirect: 'follow',
  });
  const html = await res.text();
  return { html, status: res.status, fetchMs: Date.now() - start };
}

export async function fetchRobotsTxt(origin: string): Promise<string | null> {
  try {
    const res = await fetch(new URL('/robots.txt', origin).toString(), {
      headers: { 'User-Agent': USER_AGENT },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}
