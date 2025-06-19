
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, Target, Award } from "lucide-react";
import { Team, Match, Player } from "@/utils/storage";
import { useAuth } from '@/contexts/AuthContext';

interface DashboardProps {
  teams: Team[];
  matches: Match[];
  topScorers: Array<Player & { teamName: string }>;
  sortedTeams: Team[];
}

export const Dashboard = ({ teams, matches, topScorers, sortedTeams }: DashboardProps) => {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Manager';

  const totalGoals = teams.reduce((sum, team) => sum + team.goalsFor, 0);
  const totalMatches = matches.length;
  const leaderTeam = sortedTeams[0];

  return (
    <div className="space-y-6">
      {/* Personalized Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {userName}! ⚽
        </h2>
        <p className="text-gray-600 text-lg">
          Ready to manage your Fantasy Football League? Here's your league overview.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">Total Teams</p>
                <p className="text-2xl font-bold">{teams.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">Matches Played</p>
                <p className="text-2xl font-bold">{totalMatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Target className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">Total Goals</p>
                <p className="text-2xl font-bold goal-bounce">{totalGoals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Trophy className="h-8 w-8 trophy-shine" />
              <div>
                <p className="text-sm opacity-90">League Leader</p>
                <p className="text-lg font-bold">{leaderTeam?.name || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>{userName}'s League Table (Top 5)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedTeams.slice(0, 5).map((team, index) => (
                <div key={team.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-lg">{team.logo}</span>
                    <div>
                      <p className="font-semibold">{team.name}</p>
                      <p className="text-sm text-gray-600">{team.manager}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{team.points}</p>
                    <p className="text-sm text-gray-600">pts</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Scorers Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-500" />
              <span>Top Scorers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topScorers.slice(0, 5).map((player, index) => (
                <div key={player.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-500' : 'bg-green-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{player.name}</p>
                      <p className="text-sm text-gray-600">{player.teamName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">⚽ {player.goals}</p>
                    <p className="text-sm text-gray-600">🅰️ {player.assists}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personalized Footer */}
      <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 text-center">
        <p className="text-sm text-gray-600">
          ⚽ Built for {userName}'s Fantasy Football League ⚽
        </p>
      </div>
    </div>
  );
};
