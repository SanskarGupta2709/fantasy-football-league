
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { TeamsManagement } from '@/components/TeamsManagement';
import { MatchTracker } from '@/components/MatchTracker';
import { Leaderboard } from '@/components/Leaderboard';
import { TopScorers } from '@/components/TopScorers';
import { useLeagueData } from '@/hooks/useLeagueData';
import { RotateCcw } from 'lucide-react';

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const {
    teams,
    matches,
    addTeam,
    updateTeam,
    deleteTeam,
    addPlayer,
    updatePlayer,
    addMatch,
    getTopScorers,
    getSortedTeams,
    reset
  } = useLeagueData();

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      reset();
      toast({
        title: "League Reset",
        description: "All data has been cleared and sample data has been loaded.",
      });
    }
  };

  const topScorers = getTopScorers();
  const sortedTeams = getSortedTeams();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            teams={teams}
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
        return <Leaderboard teams={sortedTeams} />;
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
