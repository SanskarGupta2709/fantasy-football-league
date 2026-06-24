import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, CalendarDays, ListChecks, Shield, Users,
  ArrowLeftRight, BarChart3, HeartPulse, LogOut, Trophy
} from 'lucide-react';

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

const Placeholder = ({ title, description }: { title: string; description: string }) => (
  <Card className="border-purple-400/30 bg-gradient-to-br from-purple-950/60 to-indigo-950/60 text-white">
    <CardHeader>
      <Badge className="w-fit bg-purple-500/30 text-purple-100 border-purple-400/40">Coming Soon</Badge>
      <CardTitle className="text-2xl mt-2">{title}</CardTitle>
      <p className="text-purple-100/70">{description}</p>
    </CardHeader>
    <CardContent>
      <div className="h-48 rounded-lg border-2 border-dashed border-purple-400/30 flex items-center justify-center text-purple-100/60">
        This section is part of the Premier League Hub framework and will be expanded soon.
      </div>
    </CardContent>
  </Card>
);

const PremierLeague = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>('overview');

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950">
      {/* Top bar */}
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
            <Button variant="outline" size="sm" onClick={() => signOut()} className="border-purple-400/40 text-purple-100 hover:bg-purple-800/40">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Sign Out</span>
            </Button>
          </div>
        </div>
        {/* Section nav */}
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

      <main className="container mx-auto px-3 sm:px-4 py-6">
        <Placeholder title={current.label} description={current.description} />
      </main>
    </div>
  );
};

export default PremierLeague;
