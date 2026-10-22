import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, CalendarDays, ListChecks, Shield, Users,
  ArrowLeftRight, BarChart3, HeartPulse, LogOut, Trophy, RefreshCw,
} from 'lucide-react';
import { PL_TEAMS } from '@/data/premierLeagueMock';
import { supabase } from '@/integrations/supabase/client';

type Section =
  | 'overview' | 'fixtures' | 'results' | 'clubs'
  | 'players' | 'transfers' | 'statistics' | 'injuries';

type PLStandingRow = {
  position: number;
  team: {
    id: number;
    name: string;
    shortName?: string;
    crest?: string;
  };
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
};

type PLStandingsResponse = {
  data: {
    season: {
      startDate: string;
      endDate: string;
      currentMatchday?: number | null;
    };
    standings: {
      type: string;
      table: PLStandingRow[];
    }[];
  };
};

type PLMatch = {
  id: number;
  utcDate: string;
  status: string;
  matchday?: number | null;
  homeTeam: {
    id: number;
    name: string;
    shortName?: string;
    crest?: string;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName?: string;
    crest?: string;
  };
  score: {
    fullTime: {
      home: number | null;
      away: number | null;
    };
  };
  competition?: {
    name?: string;
  };
  venue?: string | null;
};

type PLMatchesResponse = {
  data: {
    matches: PLMatch[];
  };
};


type PLScorer = {
  player: {
    id: number;
    name: string;
    nationality?: string | null;
    shirtNumber?: number | null;
  };
  team: {
    id: number;
    name: string;
    shortName?: string;
    tla?: string;
    crest?: string;
  };
  playedMatches: number;
  goals: number;
  assists: number | null;
  penalties: number | null;
};

type PLScorersResponse = {
  data: {
    count?: number;
    season?: {
      startDate?: string;
      endDate?: string;
      currentMatchday?: number | null;
    };
    scorers: PLScorer[];
  };
};

async function fetchPLScorers(): Promise<PLScorer[]> {
  const { data, error } = await supabase.functions.invoke(
    'premier-league?resource=scorers',
    { method: 'GET' }
  );

  if (error) {
    throw new Error(error.message || 'Unable to fetch Premier League statistics.');
  }

  const response = data as PLScorersResponse | null;
  if (!Array.isArray(response?.data?.scorers)) {
    throw new Error('The API returned an unexpected scorers response.');
  }

  return response.data.scorers;
}

async function fetchPLMatches(
  resource: 'fixtures' | 'results'
): Promise<PLMatch[]> {
  const { data, error } = await supabase.functions.invoke(
    `premier-league?resource=${resource}`,
    { method: 'GET' }
  );

  if (error) {
    throw new Error(error.message || `Unable to fetch ${resource}.`);
  }

  const response = data as PLMatchesResponse | null;
  if (!Array.isArray(response?.data?.matches)) {
    throw new Error('The API returned an unexpected matches response.');
  }

  return response.data.matches;
}

const NAV: { id: Section; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { id: 'overview',   label: 'Overview',   icon: LayoutDashboard, description: 'Premier League standings' },
  { id: 'fixtures',   label: 'Fixtures',   icon: CalendarDays,    description: 'Upcoming matches' },
  { id: 'results',    label: 'Results',    icon: ListChecks,      description: 'Recent matches' },
  { id: 'clubs',      label: 'Clubs',      icon: Shield,          description: 'All 20 clubs' },
  { id: 'players',    label: 'Players',    icon: Users,           description: 'Player database' },
  { id: 'transfers',  label: 'Transfers',  icon: ArrowLeftRight,  description: 'Transfer Centre' },
  { id: 'statistics', label: 'Statistics', icon: BarChart3,       description: 'Top scorers and assists' },
  { id: 'injuries',   label: 'Injuries',   icon: HeartPulse,      description: 'Injury tracker' },
];

const TeamLogo = ({ src, alt, className = 'h-6 w-6' }: { src: string; alt: string; className?: string }) => (
  <img
    src={src}
    alt={`${alt} logo`}
    className={`${className} object-contain shrink-0`}
    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
  />
);


const Standings = ({ refreshKey }: { refreshKey: number }) => {
  const [rows, setRows] = useState<PLStandingRow[]>([]);
  const [season, setSeason] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStandings = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.functions.invoke(
        'premier-league?resource=standings',
        { method: 'GET' }
      );
      if (error) throw new Error(error.message || 'Unable to fetch standings.');

      const response = data as PLStandingsResponse | null;
      if (
        !response?.data?.standings ||
        !response.data.season?.startDate ||
        !response.data.season?.endDate
      ) {
        throw new Error('The API response did not contain valid standings.');
      }

      const totalTable = response.data.standings.find(
        (standing) => standing.type === 'TOTAL'
      );
      if (!totalTable || !Array.isArray(totalTable.table)) {
        throw new Error('The API returned no league table.');
      }

      setRows(totalTable.table);
      setSeason(
        `${response.data.season.startDate.slice(0, 4)}/${response.data.season.endDate.slice(2, 4)}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load standings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStandings();
  }, [refreshKey]);

  if (loading) {
    return (
      <Card className="border-purple-400/30 bg-purple-950/40 text-white">
        <CardContent className="p-6">Loading live Premier League standings...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-400/30 bg-purple-950/40 text-white">
        <CardContent className="space-y-3 p-6">
          <p>Unable to load the league table: {error}</p>
          <Button onClick={fetchStandings}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-400/30 bg-purple-950/40 text-white overflow-hidden">
      <CardHeader>
        <CardTitle>League Table — {season}</CardTitle>
        <p className="text-purple-100/70 text-sm">
          Live standings · Points, then goal difference, then goals scored.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-purple-400/20 hover:bg-transparent">
                <TableHead className="text-purple-200 w-12">#</TableHead>
                <TableHead className="text-purple-200">Club</TableHead>
                <TableHead className="text-purple-200 text-center">P</TableHead>
                <TableHead className="text-purple-200 text-center">W</TableHead>
                <TableHead className="text-purple-200 text-center">D</TableHead>
                <TableHead className="text-purple-200 text-center">L</TableHead>
                <TableHead className="text-purple-200 text-center">GF</TableHead>
                <TableHead className="text-purple-200 text-center">GA</TableHead>
                <TableHead className="text-purple-200 text-center">GD</TableHead>
                <TableHead className="text-purple-200 text-center font-bold">Pts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.team.id} className="border-purple-400/10 hover:bg-purple-900/40">
                  <TableCell className="font-semibold">{row.position}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[140px]">
                      {row.team.crest && <TeamLogo src={row.team.crest} alt={row.team.name} />}
                      <span className="font-medium">{row.team.shortName || row.team.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{row.playedGames}</TableCell>
                  <TableCell className="text-center">{row.won}</TableCell>
                  <TableCell className="text-center">{row.draw}</TableCell>
                  <TableCell className="text-center">{row.lost}</TableCell>
                  <TableCell className="text-center">{row.goalsFor}</TableCell>
                  <TableCell className="text-center">{row.goalsAgainst}</TableCell>
                  <TableCell className={`text-center ${row.goalDifference > 0 ? 'text-green-400' : row.goalDifference < 0 ? 'text-red-400' : ''}`}>
                    {row.goalDifference > 0 ? '+' : ''}{row.goalDifference}
                  </TableCell>
                  <TableCell className="text-center font-bold text-white">{row.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="px-4 py-3 text-xs text-purple-200/60">Data provided by football-data.org</p>
      </CardContent>
    </Card>
  );
};

const MatchCard = ({ match }: { match: PLMatch }) => {
  const isFinished = match.status === 'FINISHED';
  const isLive = ['IN_PLAY', 'PAUSED', 'EXTRA_TIME', 'PENALTY_SHOOTOUT'].includes(match.status);
  const homeScore = match.score?.fullTime?.home;
  const awayScore = match.score?.fullTime?.away;

  return (
    <div className="rounded-lg border border-purple-400/20 bg-purple-900/30 p-3 sm:p-4 hover:bg-purple-900/50 transition">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-purple-200/70">
        <span>{match.competition?.name || 'Premier League'}{match.venue ? ` â€¢ ${match.venue}` : ''}</span>
        {isLive ? (
          <Badge className="bg-red-500 text-white animate-pulse">LIVE</Badge>
        ) : isFinished ? (
          <Badge variant="outline" className="border-purple-400/40 text-purple-100">FT</Badge>
        ) : (
          <Badge variant="outline" className="border-purple-400/40 text-purple-100">
            {new Date(match.utcDate).toLocaleString(undefined, {
              weekday: 'short', day: 'numeric', month: 'short',
              hour: '2-digit', minute: '2-digit',
            })}
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
        <div className="flex min-w-0 items-center justify-end gap-2 text-right">
          <span className="truncate font-semibold text-white">{match.homeTeam.shortName || match.homeTeam.name}</span>
          {match.homeTeam.crest && <TeamLogo src={match.homeTeam.crest} alt={match.homeTeam.name} className="h-7 w-7 sm:h-8 sm:w-8" />}
        </div>
        <div className="text-center text-lg font-black text-white tabular-nums">
          {homeScore !== null && homeScore !== undefined && awayScore !== null && awayScore !== undefined
            ? `${homeScore} - ${awayScore}`
            : <span className="text-sm text-purple-200/80">vs</span>}
        </div>
        <div className="flex min-w-0 items-center gap-2">
          {match.awayTeam.crest && <TeamLogo src={match.awayTeam.crest} alt={match.awayTeam.name} className="h-7 w-7 sm:h-8 sm:w-8" />}
          <span className="truncate font-semibold text-white">{match.awayTeam.shortName || match.awayTeam.name}</span>
        </div>
      </div>
    </div>
  );
};

const MatchListState = ({ loading, error, onRetry, children }: {
  loading: boolean;
  error: string;
  onRetry: () => void;
  children: React.ReactNode;
}) => {
  if (loading) return <p className="p-4 text-purple-100">Loading Premier League matches...</p>;
  if (error) {
    return (
      <Card className="border-red-400/30 bg-purple-950/40 text-white">
        <CardContent className="space-y-3 p-4">
          <p>Unable to load matches: {error}</p>
          <Button onClick={onRetry}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }
  return <>{children}</>;
};

const Fixtures = ({ refreshKey }: { refreshKey: number }) => {
  const [matches, setMatches] = useState<PLMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadFixtures = async () => {
    setLoading(true);
    setError('');
    try {
      setMatches(await fetchPLMatches('fixtures'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load fixtures.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadFixtures(); }, [refreshKey]);

  const live = matches.filter((m) => ['IN_PLAY', 'PAUSED', 'EXTRA_TIME', 'PENALTY_SHOOTOUT'].includes(m.status));
  const upcoming = matches
    .filter((m) => ['SCHEDULED', 'TIMED'].includes(m.status))
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());

  return (
    <MatchListState loading={loading} error={error} onRetry={loadFixtures}>
      <div className="space-y-6">
        <Card className="border-red-500/40 bg-purple-950/40 text-white">
          <CardHeader><CardTitle>Live Now</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {live.length ? live.map((match) => <MatchCard key={match.id} match={match} />) : (
              <p className="text-sm text-purple-200/70">No matches currently marked as live.</p>
            )}
          </CardContent>
        </Card>
        <Card className="border-purple-400/30 bg-purple-950/40 text-white">
          <CardHeader><CardTitle>Upcoming Fixtures</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {upcoming.length ? upcoming.map((match) => <MatchCard key={match.id} match={match} />) : (
              <p className="text-sm text-purple-200/70">No upcoming fixtures returned by the API.</p>
            )}
          </CardContent>
        </Card>
        <p className="text-xs text-purple-200/60">Data provided by football-data.org</p>
        <Button onClick={loadFixtures}>Refresh Fixtures</Button>
      </div>
    </MatchListState>
  );
};

const Results = ({ refreshKey }: { refreshKey: number }) => {
  const [matches, setMatches] = useState<PLMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadResults = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchPLMatches('results');
      setMatches(data.filter((match) => match.status === 'FINISHED')
        .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadResults(); }, [refreshKey]);

  return (
    <MatchListState loading={loading} error={error} onRetry={loadResults}>
      <div className="space-y-4">
        {matches.length ? matches.map((match) => <MatchCard key={match.id} match={match} />) : (
          <Card className="border-purple-400/30 bg-purple-950/40 text-white">
            <CardContent className="p-4">No completed matches were returned by the API.</CardContent>
          </Card>
        )}
        <p className="text-xs text-purple-200/60">Data provided by football-data.org</p>
        <Button onClick={loadResults}>Refresh Results</Button>
      </div>
    </MatchListState>
  );
};

const Clubs = () => {
  const [q, setQ] = useState('');
  const filtered = PL_TEAMS.filter(t => t.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <Card className="border-purple-400/30 bg-purple-950/40 text-white">
      <CardHeader>
        <CardTitle>Clubs</CardTitle>
        <Input
          placeholder="Search clubs..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="mt-2 bg-purple-900/40 border-purple-400/30 text-white placeholder:text-purple-200/60"
        />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(t => (
            <div key={t.id} className="rounded-lg border border-purple-400/20 bg-purple-900/30 p-4 flex items-center gap-3">
              <TeamLogo src={t.logo} alt={t.name} className="h-12 w-12" />
              <div className="min-w-0">
                <div className="font-bold truncate">{t.name}</div>
                <div className="text-xs text-purple-200/70 truncate">{t.stadium}</div>
                <div className="text-xs text-purple-200/70 truncate">Manager: {t.manager}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};


const Statistics = ({ refreshKey }: { refreshKey: number }) => {
  const [scorers, setScorers] = useState<PLScorer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'goals' | 'assists'>('goals');

  const loadScorers = async () => {
    setLoading(true);
    setError('');
    try {
      setScorers(await fetchPLScorers());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load player statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadScorers();
  }, [refreshKey]);

  const rankedScorers = [...scorers].sort((a, b) =>
    b.goals - a.goals || a.player.name.localeCompare(b.player.name)
  );
  const rankedAssists = scorers
    .filter((player) => typeof player.assists === 'number')
    .sort((a, b) =>
      (b.assists ?? 0) - (a.assists ?? 0) ||
      b.goals - a.goals ||
      a.player.name.localeCompare(b.player.name)
    );

  if (loading) {
    return (
      <Card className="border-purple-400/30 bg-purple-950/40 text-white">
        <CardContent className="p-6">Loading live Premier League statistics...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-400/30 bg-purple-950/40 text-white">
        <CardContent className="space-y-3 p-6">
          <p>Unable to load player statistics: {error}</p>
          <Button onClick={loadScorers}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  const activeRows = view === 'goals' ? rankedScorers : rankedAssists;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Premier League Player Statistics</h2>
          <p className="text-sm text-purple-200/70">
            Live data provided by football-data.org
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setView('goals')}
            variant={view === 'goals' ? 'default' : 'outline'}
            className={view === 'goals'
              ? 'bg-purple-500 text-white hover:bg-purple-400'
              : 'border-purple-400/30 bg-purple-950/40 text-purple-100 hover:bg-purple-900/60'}
          >
            Top Scorers
          </Button>
          <Button
            size="sm"
            onClick={() => setView('assists')}
            variant={view === 'assists' ? 'default' : 'outline'}
            className={view === 'assists'
              ? 'bg-purple-500 text-white hover:bg-purple-400'
              : 'border-purple-400/30 bg-purple-950/40 text-purple-100 hover:bg-purple-900/60'}
          >
            Most Assists
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="border-purple-400/30 bg-purple-950/40 text-white">
          <CardContent className="p-4">
            <p className="text-sm text-purple-200/70">Players returned</p>
            <p className="mt-1 text-2xl font-black">{scorers.length}</p>
          </CardContent>
        </Card>
        <Card className="border-purple-400/30 bg-purple-950/40 text-white">
          <CardContent className="p-4">
            <p className="text-sm text-purple-200/70">Top goal tally</p>
            <p className="mt-1 text-2xl font-black">
              {rankedScorers[0]?.goals ?? '—'}
            </p>
            <p className="text-xs text-purple-200/70">
              {rankedScorers[0]?.player.name ?? 'No scorer data'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-purple-400/30 bg-purple-950/40 text-white">
          <CardContent className="p-4">
            <p className="text-sm text-purple-200/70">Most assists returned</p>
            <p className="mt-1 text-2xl font-black">
              {rankedAssists[0]?.assists ?? '—'}
            </p>
            <p className="text-xs text-purple-200/70">
              {rankedAssists[0]?.player.name ?? 'No assist data available'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-purple-400/30 bg-purple-950/40 text-white">
        <CardHeader>
          <CardTitle>{view === 'goals' ? 'Top Scorers' : 'Most Assists'}</CardTitle>
          <p className="text-sm text-purple-200/70">
            {view === 'goals'
              ? 'Players ranked by goals scored.'
              : 'Players with reported assist totals, ranked by assists.'}
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {activeRows.length === 0 ? (
            <p className="p-6 text-sm text-purple-200/70">
              The provider has not returned data for this statistic.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-purple-400/20 hover:bg-transparent">
                    <TableHead className="w-12 text-purple-200">#</TableHead>
                    <TableHead className="text-purple-200">Player</TableHead>
                    <TableHead className="text-purple-200">Club</TableHead>
                    <TableHead className="text-center text-purple-200">Apps</TableHead>
                    {view === 'goals' && (
                      <TableHead className="text-center text-purple-200">Pens</TableHead>
                    )}
                    <TableHead className="text-center font-bold text-purple-100">
                      {view === 'goals' ? 'Goals' : 'Assists'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeRows.map((row, index) => (
                    <TableRow key={row.player.id} className="border-purple-400/10 hover:bg-purple-900/40">
                      <TableCell className="font-semibold">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex min-w-[150px] items-center gap-2">
                          <span className="font-medium">{row.player.name}</span>
                        </div>
                        {row.player.nationality && (
                          <p className="text-xs text-purple-200/60">{row.player.nationality}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-[130px] items-center gap-2">
                          {row.team.crest && (
                            <TeamLogo src={row.team.crest} alt={row.team.name} className="h-6 w-6" />
                          )}
                          <span>{row.team.shortName || row.team.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{row.playedMatches}</TableCell>
                      {view === 'goals' && (
                        <TableCell className="text-center">
                          {row.penalties === null ? '—' : row.penalties}
                        </TableCell>
                      )}
                      <TableCell className="text-center text-lg font-black text-white">
                        {view === 'goals' ? row.goals : row.assists}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <p className="px-4 py-3 text-xs text-purple-200/60">
            Data provided by football-data.org. The provider returns a limited top-scorers list;
            the assists view ranks only players in that response with reported assist totals.
            A dash means the provider did not supply that value.
          </p>
        </CardContent>
      </Card>
      <Button onClick={loadScorers} disabled={loading}>
        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        Refresh Statistics
      </Button>
    </div>
  );
};

const ComingSoon = ({ title, description }: { title: string; description: string }) => (
  <Card className="border-purple-400/30 bg-purple-950/40 text-white">
    <CardHeader>
      <Badge className="w-fit bg-purple-500/30 text-purple-100 border-purple-400/40">Coming Soon</Badge>
      <CardTitle className="mt-2">{title}</CardTitle>
      <p className="text-purple-100/70 text-sm">{description}</p>
    </CardHeader>
    <CardContent>
      <div className="h-40 rounded-lg border-2 border-dashed border-purple-400/30 flex items-center justify-center text-purple-100/60 text-sm text-center px-4">
        This section is part of the Premier League Hub framework and will be wired up to a real football data API in the next phase.
      </div>
    </CardContent>
  </Card>
);

const PremierLeague = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>('overview');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 to-indigo-950 text-white">
        Loading...
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  const userName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Fan';
  const firstName = userName.split(' ')[0];

  const current = NAV.find(n => n.id === section)!;

  const handleRefresh = () => {
    setRefreshing(true);
    setRefreshKey((key) => key + 1);
    setLastUpdated(new Date());
    window.setTimeout(() => setRefreshing(false), 500);
  };

  const renderSection = () => {
    switch (section) {
      case 'overview':   return <Standings refreshKey={refreshKey} />;
      case 'fixtures':   return <Fixtures refreshKey={refreshKey} />;
      case 'results':    return <Results refreshKey={refreshKey} />;
      case 'clubs':      return <Clubs />;
      case 'players':    return <ComingSoon title="Players Database" description="Searchable player profiles with stats, photos, and club info." />;
      case 'transfers':  return <ComingSoon title="Transfer Centre" description="Confirmed transfers, rumours, and breaking updates." />;
      case 'statistics': return <Statistics refreshKey={refreshKey} />;
      case 'injuries':   return <ComingSoon title="Injury Centre" description="Latest injury news with expected return dates." />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950">
      <header className="border-b border-purple-400/20 bg-purple-950/60 backdrop-blur">
        <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-white font-black text-sm sm:text-base leading-tight truncate">Premier League Hub</div>
              <div className="text-purple-200/70 text-xs hidden sm:block">Hi, {firstName}! 👋</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate('/fantasy')}
              className="bg-green-500 hover:bg-green-400 text-green-950 font-bold text-xs sm:text-sm"
              size="sm"
            >
              <Trophy className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Switch to Fantasy League</span>
            </Button>
            <Button
              size="sm"
              onClick={() => signOut()}
              className="bg-white text-purple-950 hover:bg-purple-100 font-semibold"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
        <nav className="container mx-auto px-3 sm:px-4 pb-3 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {NAV.map(n => {
              const Icon = n.icon;
              const active = section === n.id;
              return (
                <Button
                  key={n.id}
                  size="sm"
                  variant={active ? 'default' : 'ghost'}
                  onClick={() => setSection(n.id)}
                  className={active
                    ? 'bg-purple-500 hover:bg-purple-400 text-white whitespace-nowrap'
                    : 'text-purple-100 hover:bg-purple-800/40 whitespace-nowrap'}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {n.label}
                </Button>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{current.label}</h1>
            <p className="text-purple-200/70 text-sm">{current.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-purple-200/70">
              Last updated: {lastUpdated.toLocaleDateString()} {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <Button size="sm" onClick={handleRefresh} disabled={refreshing} className="bg-white text-purple-950 hover:bg-purple-100 font-semibold">
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>
        {renderSection()}
      </main>
    </div>
  );
};

export default PremierLeague;
