
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { Leaderboard } from '@/components/Leaderboard';
import { TeamsManagement } from '@/components/TeamsManagement';
import { PlayerManagement } from '@/components/PlayerManagement';
import { MatchTracker } from '@/components/MatchTracker';
import { Fixtures } from '@/components/Fixtures';
import { PlayoffBracket } from '@/components/PlayoffBracket';
import { TournamentMode } from '@/components/TournamentMode';
import { useSupabaseLeagueData } from '@/hooks/useSupabaseLeagueData';
import { useAuth } from '@/contexts/AuthContext';
import { RotateCcw } from 'lucide-react';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const {
    teams,
    matches,
    fixtures,
    bracket,
    loading,
    addTeam,
    updateTeam,
    deleteTeam,
    addPlayer,
    updatePlayer,
    deletePlayer,
    addMatch,
    updateMatch,
    addFixture,
    updateBracket,
    getTopScorers,
    getSortedTeams,
    isPlayoffUnlocked,
    reset,
    resetTournament
  } = useSupabaseLeagueData();

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Manager';
  const firstName = userName.split(' ')[0];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center space-x-2 mb-4">
            <span className="text-4xl animate-bounce">⚽</span>
            <span className="text-xl sm:text-2xl font-bold animate-pulse">Fantasy Football League</span>
          </div>
          <p className="text-sm sm:text-base">Loading {firstName}'s league data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      reset();
    }
  };

  const topScorers = getTopScorers();
  const sortedTeams = getSortedTeams();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            teams={sortedTeams}
            matches={matches}
            topScorers={topScorers}
            sortedTeams={sortedTeams}
            onReset={handleReset}
          />
        );
      case 'leaderboard':
        return <Leaderboard teams={sortedTeams} />;
      case 'teams':
        return (
          <TeamsManagement
            teams={teams}
            onAddTeam={addTeam}
            onUpdateTeam={updateTeam}
            onDeleteTeam={deleteTeam}
            onAddPlayer={addPlayer}
            onUpdatePlayer={updatePlayer}
          />
        );
      case 'players':
        return (
          <PlayerManagement
            teams={teams}
            onAddPlayer={addPlayer}
            onUpdatePlayer={updatePlayer}
            onDeletePlayer={deletePlayer}
          />
        );
      case 'tournament':
        return (
          <TournamentMode
            teams={teams}
            fixtures={fixtures}
            matches={matches}
            bracket={bracket}
            onAddFixture={addFixture}
            onUpdateBracket={updateBracket}
            onResetTournament={resetTournament}
          />
        );
      case 'matches':
        return (
        <MatchTracker 
          teams={teams} 
          matches={matches} 
          onAddMatch={addMatch}
          onUpdateMatch={updateMatch}
        />
        );
      default:
        return (
          <Dashboard 
            teams={sortedTeams}
            matches={matches}
            topScorers={topScorers}
            sortedTeams={sortedTeams}
            onReset={handleReset}
          />
        );
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': 
        return '';
      case 'leaderboard': 
        return 'League Table';
      case 'teams': 
        return 'Team Management';
      case 'players': 
        return 'Player Management';
      case 'tournament': 
        return (
          <span className="break-words">
            <span className="hidden sm:inline">Let's create your tournament, {userName}!</span>
            <span className="sm:hidden">Tournament Setup</span>
          </span>
        );
      case 'matches': 
        return (
          <span className="break-words">
            <span className="hidden sm:inline">Log your match results, {userName}</span>
            <span className="sm:hidden">Match Results</span>
          </span>
        );
      default: 
        return '';
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'dashboard': 
        return '';
      case 'leaderboard': 
        return 'Complete league table with all team statistics';
      case 'teams': 
        return 'Manage teams and players';
      case 'players': 
        return 'Manage all players across teams';
      case 'tournament': 
        return 'Create and manage tournament competitions';
      case 'matches': 
        return 'Add and track match results';
      default: 
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Only show heading for non-dashboard tabs */}
        {activeTab !== 'dashboard' && (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <div className="overflow-hidden">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 break-words">{getTabTitle()}</h2>
              <p className="text-gray-600 text-sm sm:text-base break-words">{getTabDescription()}</p>
            </div>
            
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 shrink-0"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Reset League</span>
              <span className="sm:hidden">Reset</span>
            </Button>
          </div>
        )}

        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
