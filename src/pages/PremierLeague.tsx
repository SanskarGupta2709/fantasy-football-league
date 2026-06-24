import { useMemo, useState } from 'react';
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
import {
  PL_TEAMS, PL_FIXTURES, MATCH_EVENTS, computeStandings, teamById,
} from '@/data/premierLeagueMock';

type Section =
  | 'overview' | 'fixtures' | 'results' | 'clubs'
  | 'players' | 'transfers' | 'statistics' | 'injuries';

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

const FormPill = ({ r }: { r: 'W' | 'D' | 'L' }) => (
  <span className={`inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
    r === 'W' ? 'bg-green-500 text-white' :
    r === 'D' ? 'bg-yellow-500 text-black' :
    'bg-red-500 text-white'
  }`}>{r}</span>
);

const formatKickoff = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });

const Standings = () => {
  const rows = useMemo(() => computeStandings(), []);
  return (
    <Card className="border-purple-400/30 bg-purple-950/40 text-white overflow-hidden">
      <CardHeader>
        <CardTitle>League Table — 2025/26</CardTitle>
        <p className="text-purple-100/70 text-sm">All 20 clubs ranked by Points › GD › GF.</p>
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
                <TableHead className="text-purple-200 hidden md:table-cell">Form</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => {
                const team = teamById(r.teamId);
                return (
                  <TableRow key={r.teamId} className="border-purple-400/10 hover:bg-purple-900/40">
                    <TableCell className="font-semibold">{i + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[140px]">
                        <TeamLogo src={team.logo} alt={team.name} />
                        <span className="font-medium">{team.shortName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{r.played}</TableCell>
                    <TableCell className="text-center">{r.won}</TableCell>
                    <TableCell className="text-center">{r.drawn}</TableCell>
                    <TableCell className="text-center">{r.lost}</TableCell>
                    <TableCell className="text-center">{r.gf}</TableCell>
                    <TableCell className="text-center">{r.ga}</TableCell>
                    <TableCell className={`text-center ${r.gd > 0 ? 'text-green-400' : r.gd < 0 ? 'text-red-400' : ''}`}>
                      {r.gd > 0 ? '+' : ''}{r.gd}
                    </TableCell>
                    <TableCell className="text-center font-bold text-white">{r.points}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex gap-1">
                        {r.form.map((f, idx) => <FormPill key={idx} r={f} />)}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

const FixtureRow = ({ id, homeId, awayId, kickoff, stadium, competition, status, homeScore, awayScore, minute }: typeof PL_FIXTURES[number]) => {
  const home = teamById(homeId);
  const away = teamById(awayId);
  return (
    <div key={id} className="rounded-lg border border-purple-400/20 bg-purple-900/30 p-3 sm:p-4 hover:bg-purple-900/50 transition">
      <div className="flex items-center justify-between text-xs text-purple-200/70 mb-2">
        <span>{competition} • {stadium}</span>
        {status === 'live' && <Badge className="bg-red-500 text-white animate-pulse">LIVE {minute}'</Badge>}
        {status === 'finished' && <Badge variant="outline" className="border-purple-400/40 text-purple-100">FT</Badge>}
        {status === 'upcoming' && <Badge variant="outline" className="border-purple-400/40 text-purple-100">{formatKickoff(kickoff)}</Badge>}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 justify-end text-right min-w-0">
          <span className="font-semibold text-white truncate">{home.shortName}</span>
          <TeamLogo src={home.logo} alt={home.name} className="h-7 w-7 sm:h-8 sm:w-8" />
        </div>
        <div className="text-center font-black text-white text-lg sm:text-xl tabular-nums">
          {status === 'upcoming'
            ? <span className="text-purple-200/80 text-sm">vs</span>
            : <>{homeScore} <span className="text-purple-300/60">-</span> {awayScore}</>}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <TeamLogo src={away.logo} alt={away.name} className="h-7 w-7 sm:h-8 sm:w-8" />
          <span className="font-semibold text-white truncate">{away.shortName}</span>
        </div>
      </div>
    </div>
  );
};

const Fixtures = () => {
  const live = PL_FIXTURES.filter(f => f.status === 'live');
  const upcoming = PL_FIXTURES.filter(f => f.status === 'upcoming').sort((a, b) => +new Date(a.kickoff) - +new Date(b.kickoff));
  const finished = PL_FIXTURES.filter(f => f.status === 'finished').sort((a, b) => +new Date(b.kickoff) - +new Date(a.kickoff));
  return (
    <div className="space-y-6">
      {live.length > 0 && (
        <Card className="border-red-500/40 bg-purple-950/40 text-white">
          <CardHeader><CardTitle className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> Live Now</CardTitle></CardHeader>
          <CardContent className="space-y-2">{live.map(f => <FixtureRow key={f.id} {...f} />)}</CardContent>
        </Card>
      )}
      <Card className="border-purple-400/30 bg-purple-950/40 text-white">
        <CardHeader><CardTitle>Upcoming Fixtures</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {upcoming.length === 0 ? <p className="text-purple-200/70 text-sm">No upcoming fixtures.</p> : upcoming.map(f => <FixtureRow key={f.id} {...f} />)}
        </CardContent>
      </Card>
      <Card className="border-purple-400/30 bg-purple-950/40 text-white">
        <CardHeader><CardTitle>Completed</CardTitle></CardHeader>
        <CardContent className="space-y-2">{finished.map(f => <FixtureRow key={f.id} {...f} />)}</CardContent>
      </Card>
    </div>
  );
};

const Results = () => {
  const finished = PL_FIXTURES.filter(f => f.status === 'finished')
    .sort((a, b) => +new Date(b.kickoff) - +new Date(a.kickoff));
  return (
    <div className="space-y-4">
      {finished.map(f => {
        const events = MATCH_EVENTS[f.id] ?? [];
        const home = teamById(f.homeId);
        const away = teamById(f.awayId);
        return (
          <Card key={f.id} className="border-purple-400/30 bg-purple-950/40 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between text-xs text-purple-200/70">
                <span>{f.competition} • {f.stadium}</span>
                <span>{new Date(f.kickoff).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mt-2">
                <div className="flex items-center gap-3 justify-end text-right">
                  <span className="font-bold">{home.shortName}</span>
                  <TeamLogo src={home.logo} alt={home.name} className="h-10 w-10" />
                </div>
                <div className="text-2xl font-black tabular-nums">{f.homeScore} - {f.awayScore}</div>
                <div className="flex items-center gap-3">
                  <TeamLogo src={away.logo} alt={away.name} className="h-10 w-10" />
                  <span className="font-bold">{away.shortName}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-purple-200/60 text-sm text-center">No event data available.</p>
              ) : (
                <ul className="divide-y divide-purple-400/10">
                  {events.map((e, i) => {
                    const t = teamById(e.teamId);
                    const icon =
                      e.type === 'goal' ? '⚽' :
                      e.type === 'yellow' ? '🟨' :
                      e.type === 'red' ? '🟥' : '🅰️';
                    return (
                      <li key={i} className="py-2 flex items-center gap-3 text-sm">
                        <span className="w-10 text-purple-200/80 tabular-nums">{e.minute}'</span>
                        <span>{icon}</span>
                        <TeamLogo src={t.logo} alt={t.name} className="h-5 w-5" />
                        <span className="font-medium text-white">{e.player}</span>
                        {e.assist && <span className="text-purple-200/70 text-xs">(assist: {e.assist})</span>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
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
    setTimeout(() => {
      setLastUpdated(new Date());
      setRefreshing(false);
    }, 600);
  };

  const renderSection = () => {
    switch (section) {
      case 'overview':   return <Standings />;
      case 'fixtures':   return <Fixtures />;
      case 'results':    return <Results />;
      case 'clubs':      return <Clubs />;
      case 'players':    return <ComingSoon title="Players Database" description="Searchable player profiles with stats, photos, and club info." />;
      case 'transfers':  return <ComingSoon title="Transfer Centre" description="Confirmed transfers, rumours, and breaking updates." />;
      case 'statistics': return <ComingSoon title="Statistics" description="Top scorers, assists, clean sheets, cards and more." />;
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
