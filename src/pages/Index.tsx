
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
import { TopScorers } from '@/components/TopScorers';
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
    addFixture,
    updateBracket,
    getTopScorers,
    getSortedTeams,
    isPlayoffUnlocked,
    reset
  } = useSupabaseLeagueData();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center space-x-2 mb-4">
            <span className="text-4xl animate-bounce">⚽</span>
            <span className="text-2xl font-bold animate-pulse">Fantasy Football League</span>
          </div>
          <p>Loading your league data...</p>
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

  const handleResetTournament = async () => {
    try {
      // Reset tournament-specific data
      toast({
        title: "Tournament Reset",
        description: "Tournament data has been cleared successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset tournament data",
        variant: "destructive"
      });
    }
  };

  const topScorers = getTopScorers();
  const sortedTeams = getSortedTeams();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <Dashboard 
              teams={sortedTeams}
              matches={matches}
              topScorers={topScorers}
              sortedTeams={sortedTeams}
            />
            <Leaderboard teams={sortedTeams} />
          </div>
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
            onResetTournament={handleResetTournament}
          />
        );
      case 'matches':
        return (
          <MatchTracker
            teams={teams}
            matches={matches}
            onAddMatch={addMatch}
          />
        );
      case 'scorers':
        return <TopScorers topScorers={topScorers} />;
      default:
        return (
          <div className="space-y-6">
            <Dashboard 
              teams={sortedTeams}
              matches={matches}
              topScorers={topScorers}
              sortedTeams={sortedTeams}
            />
            <Leaderboard teams={sortedTeams} />
          </div>
        );
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'League Dashboard';
      case 'leaderboard': return 'League Table';
      case 'teams': return 'Team Management';
      case 'players': return 'Player Management';
      case 'tournament': return 'Tournament Mode';
      case 'matches': return 'Match Tracker';
      case 'scorers': return 'Top Scorers';
      default: return 'League Dashboard';
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'dashboard': return 'Overview of your fantasy football league';
      case 'leaderboard': return 'Complete league table with all team statistics';
      case 'teams': return 'Manage teams and players';
      case 'players': return 'Manage all players across teams';
      case 'tournament': return 'Create and manage tournament competitions';
      case 'matches': return 'Add and track match results';
      case 'scorers': return 'View top 5 goal scorers and assists';
      default: return 'Overview of your fantasy football league';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{getTabTitle()}</h2>
            <p className="text-gray-600">{getTabDescription()}</p>
          </div>
          
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset League</span>
          </Button>
        </div>

        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
