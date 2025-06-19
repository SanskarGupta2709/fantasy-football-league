
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";
import { Team } from "@/utils/storage";

interface LeaderboardProps {
  teams: Team[];
}

export const Leaderboard = ({ teams }: LeaderboardProps) => {
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const aGD = a.goalsFor - a.goalsAgainst;
    const bGD = b.goalsFor - b.goalsAgainst;
    if (bGD !== aGD) return bGD - aGD;
    return b.goalsFor - a.goalsFor;
  });

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500 trophy-shine" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-500" />;
      default:
        return <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">{position}</div>;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <span>League Table</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 p-3 bg-gray-100 rounded-lg font-semibold text-sm">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-4">Team</div>
              <div className="col-span-1 text-center">MP</div>
              <div className="col-span-1 text-center">W</div>
              <div className="col-span-1 text-center">D</div>
              <div className="col-span-1 text-center">L</div>
              <div className="col-span-1 text-center">GF</div>
              <div className="col-span-1 text-center">GA</div>
              <div className="col-span-1 text-center">GD</div>
              <div className="col-span-1 text-center">Pts</div>
            </div>

            {/* Team Rows */}
            {sortedTeams.map((team, index) => {
              const position = index + 1;
              const goalDifference = team.goalsFor - team.goalsAgainst;
              
              return (
                <div
                  key={team.id}
                  className={`grid grid-cols-12 gap-2 p-3 rounded-lg border transition-all hover:shadow-md ${getPositionColor(position)}`}
                >
                  <div className="col-span-1 flex justify-center items-center">
                    {getPositionIcon(position)}
                  </div>
                  
                  <div className="col-span-4 flex items-center space-x-3">
                    <span className="text-2xl">{team.logo}</span>
                    <div>
                      <p className="font-semibold">{team.name}</p>
                      <p className="text-xs text-gray-600">{team.manager}</p>
                    </div>
                  </div>
                  
                  <div className="col-span-1 text-center flex items-center justify-center">
                    <span className="font-semibold">{team.matchesPlayed}</span>
                  </div>
                  
                  <div className="col-span-1 text-center flex items-center justify-center">
                    <span className="font-semibold text-green-600">{team.wins}</span>
                  </div>
                  
                  <div className="col-span-1 text-center flex items-center justify-center">
                    <span className="font-semibold text-yellow-600">{team.draws}</span>
                  </div>
                  
                  <div className="col-span-1 text-center flex items-center justify-center">
                    <span className="font-semibold text-red-600">{team.losses}</span>
                  </div>
                  
                  <div className="col-span-1 text-center flex items-center justify-center">
                    <span className="font-semibold">{team.goalsFor}</span>
                  </div>
                  
                  <div className="col-span-1 text-center flex items-center justify-center">
                    <span className="font-semibold">{team.goalsAgainst}</span>
                  </div>
                  
                  <div className="col-span-1 text-center flex items-center justify-center">
                    <span className={`font-semibold ${goalDifference > 0 ? 'text-green-600' : goalDifference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {goalDifference > 0 ? '+' : ''}{goalDifference}
                    </span>
                  </div>
                  
                  <div className="col-span-1 text-center flex items-center justify-center">
                    <span className="font-bold text-lg text-blue-600">{team.points}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {teams.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No teams in the league yet. Add some teams to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1">Abbreviations:</p>
              <p>MP - Matches Played</p>
              <p>W - Wins</p>
              <p>D - Draws</p>
              <p>L - Losses</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Scoring:</p>
              <p>GF - Goals For</p>
              <p>GA - Goals Against</p>
              <p>GD - Goal Difference</p>
              <p>Pts - Points</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Point System:</p>
              <p>Win: 3 points</p>
              <p>Draw: 1 point</p>
              <p>Loss: 0 points</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Tie Breakers:</p>
              <p>1. Points</p>
              <p>2. Goal Difference</p>
              <p>3. Goals Scored</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
