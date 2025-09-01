
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Calendar, Target, Award, RotateCcw } from "lucide-react";
import { Team, Match, Player } from "@/utils/storage";
import { useAuth } from '@/contexts/AuthContext';
import { TeamLogo } from "./ui/team-logo";

interface DashboardProps {
  teams: Team[];
  matches: Match[];
  topScorers: Array<Player & { teamName: string }>;
  sortedTeams: Team[];
  onReset: () => void;
}

export const Dashboard = ({ teams, matches, topScorers, sortedTeams, onReset }: DashboardProps) => {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Manager';
  const firstName = userName.split(' ')[0];

  const totalGoals = teams.reduce((sum, team) => sum + team.goalsFor, 0);
  const totalMatches = matches.length;
  const leaderTeam = sortedTeams[0];

  // Get top assisters by sorting all players by assists
  const topAssisters = teams
    .flatMap(team => 
      team.players?.map(player => ({
        ...player,
        teamName: team.name
      })) || []
    )
    .filter(player => player.assists > 0)
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Personalized Header with Reset Button */}
      <div className="relative bg-gradient-to-r from-green-50 to-blue-50 p-4 sm:p-6 rounded-lg border border-green-200">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 break-words">
          <span className="hidden sm:inline">Welcome back, {userName}! ⚽</span>
          <span className="sm:hidden">Welcome back, {firstName}! ⚽</span>
        </h2>
        <p className="text-gray-600 text-sm sm:text-base md:text-lg break-words">
          <span className="hidden sm:inline">Ready to manage your Fantasy Football League? Here's your league overview.</span>
          <span className="sm:hidden">Here's your league overview.</span>
        </p>
        
        {/* Reset Button - positioned absolutely on larger screens, block on mobile */}
        <div className="absolute top-4 right-4 hidden sm:block">
          <Button
            variant="outline"
            onClick={onReset}
            className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 bg-white/80 backdrop-blur-sm"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset League</span>
          </Button>
        </div>
        
        {/* Reset Button for mobile - centered below text */}
        <div className="mt-4 sm:hidden flex justify-center">
          <Button
            variant="outline"
            onClick={onReset}
            className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset League</span>
          </Button>
        </div>
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
                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    <TeamLogo logo={team.logo} teamName={team.name} size="lg" showTooltip />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1">
                      <p className={`font-semibold text-sm sm:text-base truncate ${index === 0 ? 'text-yellow-700' : ''}`}>
                        {team.name}
                      </p>
                      {index === 0 && <Trophy className="h-4 w-4 text-yellow-500 shrink-0" />}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{team.manager}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 flex items-center space-x-3">
                  <div className="text-xs text-gray-500 hidden sm:block">
                    <div className="flex space-x-1">
                      <span className="text-green-600">{team.goalsFor}</span>
                      <span>-</span>
                      <span className="text-red-600">{team.goalsAgainst}</span>
                    </div>
                    <div className={`${team.goalsFor - team.goalsAgainst >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {team.goalsFor - team.goalsAgainst >= 0 ? '+' : ''}{team.goalsFor - team.goalsAgainst}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm sm:text-lg">{team.points}</p>
                    <p className="text-xs sm:text-sm text-gray-600">pts</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Scorers and Most Assists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Scorers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
              <Award className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" />
              <span>🥅 Top Scorers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {topScorers.length > 0 ? (
                topScorers.slice(0, 5).map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0 ${
                        index === 0 ? 'bg-green-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm sm:text-base truncate">{player.name}</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{player.teamName}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm sm:text-lg text-green-500">⚽ {player.goals}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Award className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No goals scored yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Most Assists */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 shrink-0" />
              <span>🎯 Most Assists</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {topAssisters.length > 0 ? (
                topAssisters.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0 ${
                        index === 0 ? 'bg-blue-500' : 
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
                      <p className="font-bold text-sm sm:text-lg text-blue-500">🎯 {player.assists}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No assists recorded yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
