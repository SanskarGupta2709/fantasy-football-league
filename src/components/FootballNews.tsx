import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TeamLogo } from '@/components/ui/team-logo';
import { REAL_FOOTBALL_CLUBS, getClubLogo } from '@/utils/footballClubs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  RefreshCw, Newspaper, ArrowRightLeft, Mic, HeartPulse, CalendarDays,
  Search, Flame, Trophy, ExternalLink, Sparkles, Star, Timer, Zap
} from 'lucide-react';

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

const CATEGORIES = [
  { id: 'all', label: 'All News' },
  { id: 'transfers', label: 'Transfers' },
  { id: 'premier_league', label: 'Premier League' },
  { id: 'champions_league', label: 'Champions League' },
  { id: 'la_liga', label: 'La Liga' },
  { id: 'bundesliga', label: 'Bundesliga' },
  { id: 'serie_a', label: 'Serie A' },
  { id: 'international', label: 'International' },
];

const TIER_1_SOURCES = ['BBC Sport', 'BBC News', 'Sky Sports', 'The Athletic', 'The Guardian'];
const TIER_2_SOURCES = ['ESPN', 'Goal.com', 'Eurosport', 'The Independent', 'Evening Standard'];

const HERE_WE_GO_KEYWORDS = ['here we go', 'confirmed', 'done deal', 'official', 'signs for', 'completes move'];
const TRANSFER_KEYWORDS = ['transfer', 'signing', 'signs', 'joins', 'loan', 'contract', 'deal', 'agree', 'bid'];
const INJURY_KEYWORDS = ['injury', 'injured', 'sidelined', 'ruled out', 'out for', 'fitness', 'suspended', 'ban'];

function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function getReliabilityTier(sourceName: string): 1 | 2 | 3 {
  if (TIER_1_SOURCES.some(s => sourceName.includes(s))) return 1;
  if (TIER_2_SOURCES.some(s => sourceName.includes(s))) return 2;
  return 3;
}

function matchesAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

function extractClubs(text: string): { name: string; logo: string }[] {
  const found: { name: string; logo: string }[] = [];
  const seen = new Set<string>();
  for (const club of REAL_FOOTBALL_CLUBS) {
    const names = [club.name, ...(club.aliases || [])];
    if (names.some(n => new RegExp(`\\b${n}\\b`, 'i').test(text))) {
      if (!seen.has(club.name)) {
        seen.add(club.name);
        found.push({ name: club.name, logo: club.logo });
      }
    }
  }
  return found.slice(0, 3);
}

const PLAYERS_TO_WATCH = [
  { name: 'Cole Palmer', team: 'Chelsea', reason: 'Premier League form is electric' },
  { name: 'Lamine Yamal', team: 'Barcelona', reason: 'Teen sensation lighting up La Liga' },
  { name: 'Florian Wirtz', team: 'Liverpool', reason: 'Creative spark in midfield' },
  { name: 'Erling Haaland', team: 'Manchester City', reason: 'Goal machine, again' },
  { name: 'Jude Bellingham', team: 'Real Madrid', reason: 'Big-game player' },
  { name: 'Bukayo Saka', team: 'Arsenal', reason: 'Premier League title race' },
];

interface FootballNewsProps {
  teams?: any[];
}

export const FootballNews: React.FC<FootballNewsProps> = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [tick, setTick] = useState(0);

  const fetchNewsDirect = useCallback(async (cat: string, q: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams({ category: cat, pageSize: '40' });
      if (q) params.set('search', q);
      const url = `https://sselpjbwuykyfjitahmi.supabase.co/functions/v1/football-news?${params.toString()}`;
      const resp = await fetch(url, {
        headers: {
          apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWxwamJ3dXlreWZqaXRhaG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMTQwNjIsImV4cCI6MjA2NTg5MDA2Mn0.vSi2IkDRgl2OduPw-aaKowU1YKMvrZLHi2i8N0ME6bw',
        },
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result?.error || 'Failed to fetch news');
      setArticles(result.articles || []);
      setLastUpdated(new Date());
      if (!silent) {
        toast({ title: '⚽ News updated', description: `${result.articles?.length || 0} articles loaded` });
      }
    } catch (e: any) {
      toast({
        title: 'Could not load news',
        description: e.message || 'Check your NewsAPI key',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchNewsDirect(category, search, false);
  }, [category, search, fetchNewsDirect]);

  // Auto-refresh every 60 minutes
  useEffect(() => {
    const id = setInterval(() => {
      fetchNewsDirect(category, search, true);
    }, 60 * 60 * 1000);
    return () => clearInterval(id);
  }, [category, search, fetchNewsDirect]);

  // Tick every minute so "X minutes ago" stays fresh
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const trending = useMemo(() => articles.slice(0, 12), [articles]);

  const confirmedTransfers = useMemo(
    () =>
      articles.filter(a => {
        const t = `${a.title} ${a.description ?? ''}`;
        return (
          matchesAny(t, HERE_WE_GO_KEYWORDS) &&
          matchesAny(t, TRANSFER_KEYWORDS)
        );
      }).slice(0, 10),
    [articles]
  );

  const transferRumours = useMemo(
    () =>
      articles.filter(a => {
        const t = `${a.title} ${a.description ?? ''}`;
        return (
          matchesAny(t, TRANSFER_KEYWORDS) &&
          !matchesAny(t, HERE_WE_GO_KEYWORDS)
        );
      }).slice(0, 12),
    [articles]
  );

  const romanoFeed = useMemo(
    () =>
      articles.filter(a => {
        const t = `${a.title} ${a.description ?? ''} ${a.author ?? ''}`.toLowerCase();
        return (
          t.includes('fabrizio romano') ||
          t.includes('here we go') ||
          t.includes('ornstein') ||
          a.source.name.includes('Athletic')
        );
      }).slice(0, 10),
    [articles]
  );

  const injuries = useMemo(
    () =>
      articles.filter(a => {
        const t = `${a.title} ${a.description ?? ''}`;
        return matchesAny(t, INJURY_KEYWORDS);
      }).slice(0, 10),
    [articles]
  );

  const lastUpdatedLabel = lastUpdated ? timeAgo(lastUpdated.toISOString()) : '—';
  // reference tick so React re-renders for time labels
  void tick;

  return (
    <div className="space-y-6">
      {/* Breaking ticker */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white shadow-lg">
        <div className="flex items-center gap-3 px-4 py-2">
          <Badge className="bg-white text-red-600 hover:bg-white font-bold shrink-0">
            <Zap className="h-3 w-3 mr-1" /> BREAKING
          </Badge>
          <div className="flex-1 overflow-hidden">
            <div className="whitespace-nowrap animate-[ticker_60s_linear_infinite] text-sm font-medium">
              {trending.slice(0, 6).map((a, i) => (
                <span key={i} className="mx-8">
                  ⚽ {a.title}
                </span>
              ))}
            </div>
          </div>
        </div>
        <style>{`@keyframes ticker { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }`}</style>
      </div>

      {/* Header with title + refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            ⚽ Football News Hub
          </h2>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdatedLabel} · Auto-refresh every hour
          </p>
        </div>
        <Button
          onClick={() => fetchNewsDirect(category, search, false)}
          disabled={loading}
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:opacity-90"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh News
        </Button>
      </div>

      {/* Filters + search */}
      <Card className="border-2 border-green-200/60 shadow-md">
        <CardContent className="p-4 space-y-3">
          <form
            onSubmit={(e) => { e.preventDefault(); setSearch(searchInput.trim()); }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search players, clubs, managers, leagues..."
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="outline">Search</Button>
            {search && (
              <Button type="button" variant="ghost" onClick={() => { setSearch(''); setSearchInput(''); }}>
                Clear
              </Button>
            )}
          </form>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <Button
                key={c.id}
                size="sm"
                variant={category === c.id ? 'default' : 'outline'}
                onClick={() => setCategory(c.id)}
                className={category === c.id ? 'bg-gradient-to-r from-green-600 to-blue-600' : ''}
              >
                {c.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="trending" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto">
          <TabsTrigger value="trending"><Flame className="h-4 w-4 mr-1" />Trending</TabsTrigger>
          <TabsTrigger value="transfers"><ArrowRightLeft className="h-4 w-4 mr-1" />Transfers</TabsTrigger>
          <TabsTrigger value="romano"><Mic className="h-4 w-4 mr-1" />Here We Go</TabsTrigger>
          <TabsTrigger value="injuries"><HeartPulse className="h-4 w-4 mr-1" />Injuries</TabsTrigger>
          <TabsTrigger value="bonus"><Sparkles className="h-4 w-4 mr-1" />Extras</TabsTrigger>
        </TabsList>

        {/* TRENDING */}
        <TabsContent value="trending" className="mt-4">
          {loading && articles.length === 0 ? (
            <LoadingGrid />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trending.map((a, i) => (
                <ArticleCard key={i} article={a} />
              ))}
              {trending.length === 0 && <EmptyMessage label="No trending news right now." />}
            </div>
          )}
        </TabsContent>

        {/* TRANSFERS */}
        <TabsContent value="transfers" className="mt-4 space-y-6">
          <section>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              ✅ Confirmed Transfers
              <Badge className="bg-green-600">{confirmedTransfers.length}</Badge>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {confirmedTransfers.map((a, i) => (
                <TransferCard key={i} article={a} confirmed />
              ))}
              {confirmedTransfers.length === 0 && <EmptyMessage label="No confirmed transfers in the latest feed." />}
            </div>
          </section>
          <section>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              🟡 Transfer Rumours
              <Badge className="bg-yellow-500">{transferRumours.length}</Badge>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transferRumours.map((a, i) => (
                <TransferCard key={i} article={a} />
              ))}
              {transferRumours.length === 0 && <EmptyMessage label="No rumours found." />}
            </div>
          </section>
        </TabsContent>

        {/* ROMANO */}
        <TabsContent value="romano" className="mt-4">
          <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎙 Here We Go! Feed
                <Badge className="bg-purple-600">Fabrizio Romano · Ornstein · The Athletic</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-3">
                <div className="space-y-3">
                  {romanoFeed.map((a, i) => (
                    <RomanoCard key={i} article={a} />
                  ))}
                  {romanoFeed.length === 0 && <EmptyMessage label="No Romano-style updates right now. Try the Transfers filter above." />}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* INJURIES */}
        <TabsContent value="injuries" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-red-500" /> Injury & Suspension Tracker
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {injuries.map((a, i) => (
                <InjuryCard key={i} article={a} />
              ))}
              {injuries.length === 0 && <EmptyMessage label="No injury news in the current feed." />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* BONUS */}
        <TabsContent value="bonus" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PlayersToWatchCard />
            <UpcomingFixturesCard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ============ Sub-components ============

const ArticleCard: React.FC<{ article: Article }> = ({ article }) => {
  const clubs = extractClubs(`${article.title} ${article.description ?? ''}`);
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <Card className="h-full overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 border-2 hover:border-green-400">
        {article.urlToImage ? (
          <div className="relative h-40 overflow-hidden bg-gradient-to-br from-green-100 to-blue-100">
            <img
              src={article.urlToImage}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        ) : (
          <div className="h-40 bg-gradient-to-br from-green-200 to-blue-200 flex items-center justify-center text-5xl">⚽</div>
        )}
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold">{article.source.name}</span>
            <span>{timeAgo(article.publishedAt)}</span>
          </div>
          <h4 className="font-bold leading-snug line-clamp-2 group-hover:text-green-700">
            {article.title}
          </h4>
          {article.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{article.description}</p>
          )}
          {clubs.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              {clubs.map(c => (
                <div key={c.name} className="flex items-center gap-1" title={c.name}>
                  <TeamLogo logo={c.logo} teamName={c.name} size="sm" showTooltip />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </a>
  );
};

const TransferCard: React.FC<{ article: Article; confirmed?: boolean }> = ({ article, confirmed }) => {
  const text = `${article.title} ${article.description ?? ''}`;
  const clubs = extractClubs(text);
  const tier = getReliabilityTier(article.source.name);
  return (
    <a href={article.url} target="_blank" rel="noopener noreferrer" className="block group">
      <Card className={`h-full overflow-hidden hover:shadow-xl transition-all border-2 ${
        confirmed ? 'border-green-400 bg-gradient-to-br from-green-50 to-white' : 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-white'
      }`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {confirmed ? (
                <Badge className="bg-green-600">✅ Confirmed</Badge>
              ) : (
                <Badge className={
                  tier === 1 ? 'bg-blue-600' : tier === 2 ? 'bg-yellow-500' : 'bg-gray-500'
                }>
                  {tier === 1 ? 'Tier 1 · Very Reliable' : tier === 2 ? 'Tier 2 · Reliable' : 'Tier 3 · Rumour'}
                </Badge>
              )}
              <Badge variant="outline">{article.source.name}</Badge>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">{timeAgo(article.publishedAt)}</span>
          </div>
          <h4 className="font-bold leading-snug group-hover:text-green-700">{article.title}</h4>
          {clubs.length >= 2 && (
            <div className="flex items-center justify-center gap-3 py-2 bg-white/60 rounded-lg">
              <div className="flex flex-col items-center gap-1">
                <TeamLogo logo={clubs[0].logo} teamName={clubs[0].name} size="lg" />
                <span className="text-xs font-medium">{clubs[0].name}</span>
              </div>
              <ArrowRightLeft className="h-5 w-5 text-green-600 animate-pulse" />
              <div className="flex flex-col items-center gap-1">
                <TeamLogo logo={clubs[1].logo} teamName={clubs[1].name} size="lg" />
                <span className="text-xs font-medium">{clubs[1].name}</span>
              </div>
            </div>
          )}
          {article.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{article.description}</p>
          )}
          <div className="flex items-center text-xs text-green-700 font-medium">
            Read full story <ExternalLink className="h-3 w-3 ml-1" />
          </div>
        </CardContent>
      </Card>
    </a>
  );
};

const RomanoCard: React.FC<{ article: Article }> = ({ article }) => {
  const text = `${article.title} ${article.description ?? ''}`;
  const hereWeGo = /here we go/i.test(text);
  return (
    <a href={article.url} target="_blank" rel="noopener noreferrer" className="block group">
      <Card className="hover:shadow-lg transition-all border-l-4 border-l-purple-500">
        <CardContent className="p-3 flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shrink-0">
            🎙
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-sm">{article.source.name}</span>
              {hereWeGo && <Badge className="bg-purple-600 animate-pulse">🔥 Here We Go!</Badge>}
              <span className="text-xs text-muted-foreground ml-auto">{timeAgo(article.publishedAt)}</span>
            </div>
            <p className="font-medium text-sm group-hover:text-purple-700">{article.title}</p>
          </div>
        </CardContent>
      </Card>
    </a>
  );
};

const InjuryCard: React.FC<{ article: Article }> = ({ article }) => {
  const clubs = extractClubs(`${article.title} ${article.description ?? ''}`);
  return (
    <a href={article.url} target="_blank" rel="noopener noreferrer" className="block group">
      <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-red-100 bg-red-50/30 hover:bg-red-50 hover:border-red-300 transition-all">
        <HeartPulse className="h-5 w-5 text-red-500 shrink-0" />
        {clubs[0] && <TeamLogo logo={clubs[0].logo} teamName={clubs[0].name} size="md" />}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight group-hover:text-red-700">{article.title}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span>{article.source.name}</span>
            <span>·</span>
            <span>{timeAgo(article.publishedAt)}</span>
          </div>
        </div>
      </div>
    </a>
  );
};

const PlayersToWatchCard: React.FC = () => (
  <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Star className="h-5 w-5 text-orange-500" /> Players To Watch
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {PLAYERS_TO_WATCH.map(p => {
        const logo = getClubLogo(p.team);
        return (
          <div key={p.name} className="flex items-center gap-3 p-2 rounded-lg bg-white/70 hover:bg-white transition">
            <span className="text-xl">🔥</span>
            {logo && <TeamLogo logo={logo} teamName={p.team} size="md" />}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.team} · {p.reason}</p>
            </div>
          </div>
        );
      })}
    </CardContent>
  </Card>
);

const UpcomingFixturesCard: React.FC = () => {
  // Placeholder upcoming fixtures (real fixtures API would require additional integration)
  const FIXTURES = [
    { home: 'Arsenal', away: 'Chelsea', comp: 'Premier League', when: 'Sat 15:00' },
    { home: 'Real Madrid', away: 'Barcelona', comp: 'La Liga', when: 'Sun 20:00' },
    { home: 'Bayern Munich', away: 'Borussia Dortmund', comp: 'Bundesliga', when: 'Sat 17:30' },
    { home: 'Liverpool', away: 'Manchester City', comp: 'Premier League', when: 'Sun 16:30' },
    { home: 'Inter Milan', away: 'Juventus', comp: 'Serie A', when: 'Sun 19:45' },
    { home: 'Paris Saint-Germain', away: 'Manchester United', comp: 'Champions League', when: 'Tue 20:00' },
  ];
  return (
    <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-blue-500" /> Upcoming Fixtures
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {FIXTURES.map((f, i) => {
          const homeLogo = getClubLogo(f.home);
          const awayLogo = getClubLogo(f.away);
          return (
            <div key={i} className="p-2 rounded-lg bg-white/70 hover:bg-white transition">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {homeLogo && <TeamLogo logo={homeLogo} teamName={f.home} size="sm" />}
                  <span className="text-sm font-medium truncate">{f.home}</span>
                </div>
                <span className="text-xs font-bold text-muted-foreground px-2">vs</span>
                <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                  <span className="text-sm font-medium truncate text-right">{f.away}</span>
                  {awayLogo && <TeamLogo logo={awayLogo} teamName={f.away} size="sm" />}
                </div>
              </div>
              <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                <span>{f.comp}</span>
                <span className="flex items-center gap-1"><Timer className="h-3 w-3" /> {f.when}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

const EmptyMessage: React.FC<{ label: string }> = ({ label }) => (
  <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
    {label}
  </div>
);

const LoadingGrid: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <Card key={i} className="h-72 animate-pulse">
        <div className="h-40 bg-gradient-to-br from-green-100 to-blue-100" />
        <CardContent className="p-3 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export default FootballNews;
