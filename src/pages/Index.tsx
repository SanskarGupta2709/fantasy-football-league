
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { TeamsManagement } from '@/components/TeamsManagement';
import { PlayerManagement } from '@/components/PlayerManagement';
import { MatchTracker } from '@/components/MatchTracker';
import { TopScorers } from '@/components/TopScorers';
import { Fixtures } from '@/components/Fixtures';
import { PlayoffBracket } from '@/components/PlayoffBracket';
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
          <div className="text-3xl animate-bounce mb-4">⚽</div>
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
          />
        );
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
      case 'fixtures':
        return (
          <Fixtures
            teams={teams}
            fixtures={fixtures}
            onAddFixture={addFixture}
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
      case 'bracket':
        return (
          <PlayoffBracket
            teams={teams}
            bracket={bracket}
            onUpdateBracket={updateBracket}
            isUnlocked={isPlayoffUnlocked()}
          />
        );
      case 'scorers':
        return <TopScorers topScorers={topScorers} />;
      default:
        return <Dashboard teams={sortedTeams} matches={matches} topScorers={topScorers} sortedTeams={sortedTeams} />;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'League Dashboard';
      case 'teams': return 'Team Management';
      case 'players': return 'Player Management';
      case 'fixtures': return 'Match Fixtures';
      case 'matches': return 'Match Tracker';
      case 'bracket': return 'Playoff Bracket';
      case 'scorers': return 'Top Scorers';
      default: return 'League Dashboard';
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'dashboard': return 'Overview of your fantasy football league';
      case 'teams': return 'Manage teams and players';
      case 'players': return 'Manage all players across teams';
      case 'fixtures': return 'Schedule upcoming matches';
      case 'matches': return 'Add and track match results';
      case 'bracket': return 'View and manage playoff brackets';
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
