import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { TeamsManagement } from '@/components/TeamsManagement';
import { MatchTracker } from '@/components/MatchTracker';
import { TopScorers } from '@/components/TopScorers';
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
    loading,
    addTeam,
    updateTeam,
    deleteTeam,
    addPlayer,
    updatePlayer,
    addMatch,
    getTopScorers,
    getSortedTeams,
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
        return <Dashboard teams={sortedTeams} matches={matches} topScorers={topScorers} sortedTeams={sortedTeams} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {activeTab === 'dashboard' && 'League Dashboard'}
              {activeTab === 'teams' && 'Team Management'}
              {activeTab === 'matches' && 'Match Tracker'}
              {activeTab === 'scorers' && 'Top Scorers'}
            </h2>
            <p className="text-gray-600">
              {activeTab === 'dashboard' && 'Overview of your fantasy football league'}
              {activeTab === 'teams' && 'Manage teams and players'}
              {activeTab === 'matches' && 'Add and track match results'}
              {activeTab === 'scorers' && 'View top goal scorers and assists'}
            </p>
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
