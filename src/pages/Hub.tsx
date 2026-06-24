import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Shield, ArrowRight } from 'lucide-react';

const Hub = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any previously chosen experience so the picker shows on every login
    sessionStorage.removeItem('experience');
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-emerald-800 to-blue-900">
        <div className="text-white text-center">
          <span className="text-5xl animate-bounce inline-block">⚽</span>
          <p className="mt-3 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const userName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Manager';
  const firstName = userName.split(' ')[0];

  const choose = (target: 'fantasy' | 'premier') => {
    sessionStorage.setItem('experience', target);
    navigate(target === 'fantasy' ? '/fantasy' : '/premier-league');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-900 to-blue-950 relative overflow-hidden">
      {/* Pitch lines decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-y-0 left-1/2 w-px bg-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-white" />
      </div>

      <div className="relative container mx-auto px-4 py-10 md:py-16">
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-block text-6xl mb-4 animate-bounce" style={{ filter: 'drop-shadow(0 0 20px rgba(34,197,94,0.7))' }}>⚽</div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3">
            Welcome Back, <span className="bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent">{firstName}!</span>
          </h1>
          <p className="text-lg md:text-xl text-green-100/80">Choose your football experience.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* Fantasy League Card */}
          <Card
            onClick={() => choose('fantasy')}
            className="group cursor-pointer overflow-hidden border-2 border-green-400/40 bg-gradient-to-br from-green-900/90 to-emerald-950/90 hover:border-green-300 hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] transition-all duration-300 hover:-translate-y-1"
          >
            <div className="h-32 bg-gradient-to-br from-green-500 to-emerald-700 relative flex items-center justify-center">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255,255,255,0.3) 30px, rgba(255,255,255,0.3) 60px)' }} />
              <Trophy className="h-16 w-16 text-yellow-300 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
            </div>
            <CardContent className="p-6 text-white">
              <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                🏆 Fantasy Football League
              </h2>
              <p className="text-green-100/80 text-sm mb-4">
                Create your own football league, manage teams, players, tournaments, fixtures and track statistics.
              </p>
              <ul className="grid grid-cols-2 gap-y-1 gap-x-3 text-sm text-green-100/90 mb-6">
                {['Team Management','Player Management','Match Logging','Tournament Mode','League Tables','Top Scorers','Most Assists','Football News Hub'].map(f => (
                  <li key={f} className="flex items-center gap-1"><span className="text-green-400">✓</span>{f}</li>
                ))}
              </ul>
              <Button className="w-full bg-green-500 hover:bg-green-400 text-green-950 font-bold group-hover:scale-[1.02] transition-transform">
                Enter Fantasy League <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Premier League Card */}
          <Card
            onClick={() => choose('premier')}
            className="group cursor-pointer overflow-hidden border-2 border-purple-400/40 bg-gradient-to-br from-purple-950/90 to-indigo-950/90 hover:border-purple-300 hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] transition-all duration-300 hover:-translate-y-1"
          >
            <div className="h-32 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 relative flex items-center justify-center">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)' }} />
              <Shield className="h-16 w-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
            </div>
            <CardContent className="p-6 text-white">
              <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                ⚽ Premier League Hub
              </h2>
              <p className="text-purple-100/80 text-sm mb-4">
                Follow the real Premier League with live standings, fixtures, player stats, transfers and club information.
              </p>
              <ul className="grid grid-cols-2 gap-y-1 gap-x-3 text-sm text-purple-100/90 mb-6">
                {['Premier League Table','Fixtures & Results','Club Profiles','Player Database','Top Scorers','Top Assists','Transfer News','Injury Tracker','Match Centre'].map(f => (
                  <li key={f} className="flex items-center gap-1"><span className="text-purple-300">✓</span>{f}</li>
                ))}
              </ul>
              <Button className="w-full bg-purple-500 hover:bg-purple-400 text-white font-bold group-hover:scale-[1.02] transition-transform">
                Enter Premier League Hub <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Hub;
