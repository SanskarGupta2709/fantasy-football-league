import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface Article {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface Feed {
  name: string;
  url: string;
  tags: string[]; // categories this feed belongs to
}

// RSS feeds — football specific. Tags map to the `category` query param.
const FEEDS: Feed[] = [
  // General + Premier League
  { name: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/football/rss.xml', tags: ['all', 'premier_league', 'international'] },
  { name: 'Sky Sports', url: 'https://www.skysports.com/rss/12040', tags: ['all', 'premier_league', 'transfers'] },
  { name: 'Sky Sports Transfers', url: 'https://www.skysports.com/rss/12691', tags: ['all', 'transfers'] },
  { name: 'ESPN FC', url: 'https://www.espn.com/espn/rss/soccer/news', tags: ['all', 'premier_league', 'champions_league', 'la_liga', 'serie_a', 'bundesliga', 'international'] },
  { name: 'Goal.com', url: 'https://www.goal.com/feeds/en/news', tags: ['all', 'transfers', 'premier_league', 'la_liga', 'serie_a', 'bundesliga'] },
  { name: 'The Guardian Football', url: 'https://www.theguardian.com/football/rss', tags: ['all', 'premier_league', 'transfers', 'international'] },
  { name: 'Guardian Premier League', url: 'https://www.theguardian.com/football/premierleague/rss', tags: ['all', 'premier_league'] },
  { name: 'Guardian Champions League', url: 'https://www.theguardian.com/football/championsleague/rss', tags: ['all', 'champions_league'] },
  { name: 'Guardian La Liga', url: 'https://www.theguardian.com/football/laligafootball/rss', tags: ['all', 'la_liga'] },
  { name: 'Guardian Serie A', url: 'https://www.theguardian.com/football/serieafootball/rss', tags: ['all', 'serie_a'] },
  { name: 'Guardian Bundesliga', url: 'https://www.theguardian.com/football/bundesligafootball/rss', tags: ['all', 'bundesliga'] },
];

function stripHtml(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function pick(xml: string, tag: string): string | null {
  // Non-greedy, case-insensitive, supports CDATA
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = xml.match(re);
  return m ? m[1] : null;
}

function pickAttr(xml: string, tag: string, attr: string): string | null {
  const re = new RegExp(`<${tag}[^>]*\\b${attr}=\"([^\"]+)\"[^>]*\\/?>`, 'i');
  const m = xml.match(re);
  return m ? m[1] : null;
}

function extractImage(itemXml: string): string | null {
  // media:content / media:thumbnail
  const media = pickAttr(itemXml, 'media:content', 'url') || pickAttr(itemXml, 'media:thumbnail', 'url');
  if (media) return media;
  // enclosure
  const enc = pickAttr(itemXml, 'enclosure', 'url');
  if (enc) return enc;
  // <image><url>..</url></image>
  const imgBlock = pick(itemXml, 'image');
  if (imgBlock) {
    const url = pick(imgBlock, 'url');
    if (url) return stripHtml(url);
  }
  // first <img src> in description/content
  const desc = pick(itemXml, 'content:encoded') || pick(itemXml, 'description') || '';
  const imgMatch = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) return imgMatch[1];
  return null;
}

function parseRss(xml: string, sourceName: string): Article[] {
  const items: Article[] = [];
  const itemRegex = /<item[\s>][\s\S]*?<\/item>/gi;
  const entryRegex = /<entry[\s>][\s\S]*?<\/entry>/gi;
  const blocks = xml.match(itemRegex) || xml.match(entryRegex) || [];

  for (const block of blocks) {
    const title = stripHtml(pick(block, 'title') || '');
    let link = stripHtml(pick(block, 'link') || '');
    if (!link) {
      // Atom: <link href="..." />
      link = pickAttr(block, 'link', 'href') || '';
    }
    const descRaw = pick(block, 'description') || pick(block, 'summary') || pick(block, 'content:encoded') || '';
    const description = stripHtml(descRaw).slice(0, 400);
    const pubRaw = pick(block, 'pubDate') || pick(block, 'published') || pick(block, 'updated') || pick(block, 'dc:date') || '';
    let publishedAt = new Date().toISOString();
    if (pubRaw) {
      const d = new Date(stripHtml(pubRaw));
      if (!isNaN(d.getTime())) publishedAt = d.toISOString();
    }
    const author = stripHtml(pick(block, 'dc:creator') || pick(block, 'author') || '') || null;
    const image = extractImage(block);

    if (!title || !link) continue;

    items.push({
      source: { id: null, name: sourceName },
      author,
      title,
      description: description || null,
      url: link,
      urlToImage: image,
      publishedAt,
      content: null,
    });
  }
  return items;
}

async function fetchFeed(feed: Feed, timeoutMs = 8000): Promise<{ articles: Article[]; error?: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const resp = await fetch(feed.url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FootballNewsBot/1.0)',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    });
    if (!resp.ok) {
      return { articles: [], error: `HTTP ${resp.status}` };
    }
    const xml = await resp.text();
    return { articles: parseRss(xml, feed.name) };
  } catch (e) {
    return { articles: [], error: e instanceof Error ? e.message : String(e) };
  } finally {
    clearTimeout(t);
  }
}

const TRANSFER_KEYWORDS = ['transfer', 'sign', 'joins', 'loan', 'contract', 'deal', 'bid', 'here we go', 'official'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const category = (url.searchParams.get('category') || 'all').toLowerCase();
    const search = (url.searchParams.get('search') || '').toLowerCase().trim();
    const pageSize = parseInt(url.searchParams.get('pageSize') || '40', 10);

    const selected = FEEDS.filter(f => f.tags.includes(category));
    const feedsToFetch = selected.length ? selected : FEEDS;

    const results = await Promise.all(feedsToFetch.map(f => fetchFeed(f)));

    const sourceErrors: { name: string; error: string }[] = [];
    let articles: Article[] = [];
    results.forEach((r, i) => {
      if (r.error) sourceErrors.push({ name: feedsToFetch[i].name, error: r.error });
      articles.push(...r.articles);
    });

    // Dedupe by URL
    const seen = new Set<string>();
    articles = articles.filter(a => {
      if (seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    });

    // Category-specific filter (when not driven by feed selection alone)
    if (category === 'transfers') {
      articles = articles.filter(a =>
        TRANSFER_KEYWORDS.some(k => `${a.title} ${a.description ?? ''}`.toLowerCase().includes(k))
      );
    }

    // Search filter
    if (search) {
      articles = articles.filter(a =>
        `${a.title} ${a.description ?? ''}`.toLowerCase().includes(search)
      );
    }

    // Sort newest first
    articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Trim to pageSize
    articles = articles.slice(0, isNaN(pageSize) ? 40 : pageSize);

    return new Response(
      JSON.stringify({
        articles,
        totalResults: articles.length,
        sourceErrors,
        fetchedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({
        articles: [],
        totalResults: 0,
        error: e instanceof Error ? e.message : String(e),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
