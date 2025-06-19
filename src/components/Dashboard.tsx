
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
  const firstName = userName.split(' ')[0];

  const totalGoals = teams.reduce((sum, team) => sum + team.goalsFor, 0);
  const totalMatches = matches.length;
  const leaderTeam = sortedTeams[0];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Personalized Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 sm:p-6 rounded-lg border border-green-200">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 break-words">
          <span className="hidden sm:inline">Welcome back, {userName}! ⚽</span>
          <span className="sm:hidden">Welcome back, {firstName}! ⚽</span>
        </h2>
        <p className="text-gray-600 text-sm sm:text-base md:text-lg break-words">
          <span className="hidden sm:inline">Ready to manage your Fantasy Football League? Here's your league overview.</span>
          <span className="sm:hidden">Here's your league overview.</span>
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm opacity-90">Total Teams</p>
                <p className="text-lg sm:text-2xl font-bold">{teams.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm opacity-90">Matches Played</p>
                <p className="text-lg sm:text-2xl font-bold">{totalMatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Target className="h-6 w-6 sm:h-8 sm:w-8 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm opacity-90">Total Goals</p>
                <p className="text-lg sm:text-2xl font-bold goal-bounce">{totalGoals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Trophy className="h-6 w-6 sm:h-8 sm:w-8 trophy-shine shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm opacity-90">League Leader</p>
                <p className="text-sm sm:text-lg font-bold truncate">{leaderTeam?.name || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Quick Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 shrink-0" />
              <span className="break-words min-w-0">
                <span className="hidden sm:inline">{userName}'s League Table (Top 5)</span>
                <span className="sm:hidden">{firstName}'s Top 5</span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {sortedTeams.slice(0, 5).map((team, index) => (
                <div key={team.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0 ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-sm sm:text-lg shrink-0">{team.logo}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm sm:text-base truncate">{team.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{team.manager}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm sm:text-lg">{team.points}</p>
                    <p className="text-xs sm:text-sm text-gray-600">pts</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Scorers Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
              <Award className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" />
              <span>Top Scorers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {topScorers.slice(0, 5).map((player, index) => (
                <div key={player.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0 ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-500' : 'bg-green-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm sm:text-base truncate">{player.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{player.teamName}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm sm:text-lg">⚽ {player.goals}</p>
                    <p className="text-xs sm:text-sm text-gray-600">🅰️ {player.assists}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personalized Footer */}
      <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 text-center">
        <p className="text-xs sm:text-sm text-gray-600 break-words">
          <span className="hidden sm:inline">⚽ Built for {userName}'s Fantasy Football League ⚽</span>
          <span className="sm:hidden">⚽ {firstName}'s League ⚽</span>
        </p>
      </div>
    </div>
  );
};
