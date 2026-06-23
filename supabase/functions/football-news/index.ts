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

const NEWS_DOMAINS = [
  'bbc.co.uk',
  'skysports.com',
  'espn.com',
  'theguardian.com',
  'goal.com',
  'football-italia.net',
  'theathletic.com',
  'mirror.co.uk',
  'independent.co.uk',
  'standard.co.uk',
  'eurosport.com',
  'transfermarkt.com',
].join(',');

const QUERIES: Record<string, string> = {
  all: '(football OR soccer) AND (Premier League OR Champions League OR La Liga OR Serie A OR Bundesliga OR transfer)',
  transfers: '(football OR soccer) AND (transfer OR signing OR "here we go" OR Fabrizio Romano OR loan OR contract)',
  premier_league: '"Premier League" AND (football OR Arsenal OR Liverpool OR Chelsea OR "Manchester")',
  champions_league: '"Champions League" AND (football OR UEFA)',
  la_liga: '"La Liga" AND (football OR "Real Madrid" OR Barcelona OR Atletico)',
  bundesliga: 'Bundesliga AND (football OR Bayern OR Dortmund OR Leverkusen)',
  serie_a: '"Serie A" AND (football OR Juventus OR Milan OR Inter OR Napoli)',
  international: '(football OR soccer) AND (FIFA OR "World Cup" OR "Euro" OR international)',
  injuries: '(football OR soccer) AND (injury OR injured OR sidelined OR suspended)',
  fabrizio: '"Fabrizio Romano" OR "Here we go" OR Ornstein',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('NEWSAPI_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'NEWSAPI_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const category = url.searchParams.get('category') || 'all';
    const search = url.searchParams.get('search') || '';
    const pageSize = url.searchParams.get('pageSize') || '30';

    let q = QUERIES[category] || QUERIES.all;
    if (search) {
      q = `(${q}) AND (${search})`;
    }

    const apiUrl = new URL('https://newsapi.org/v2/everything');
    apiUrl.searchParams.set('q', q);
    apiUrl.searchParams.set('language', 'en');
    apiUrl.searchParams.set('sortBy', 'publishedAt');
    apiUrl.searchParams.set('pageSize', pageSize);
    apiUrl.searchParams.set('domains', NEWS_DOMAINS);

    const resp = await fetch(apiUrl.toString(), {
      headers: { 'X-Api-Key': apiKey },
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return new Response(
        JSON.stringify({ error: `NewsAPI error: ${resp.status}`, details: errText }),
        { status: resp.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await resp.json();
    const articles: Article[] = data.articles || [];

    return new Response(
      JSON.stringify({
        articles,
        totalResults: data.totalResults || 0,
        fetchedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
