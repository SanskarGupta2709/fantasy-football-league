
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";
import { Team } from '@/hooks/useSupabaseLeagueData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
        return <Trophy className="h-5 w-5 text-yellow-500 trophy-shine" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-500" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">{position}</div>;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-orange-100';
      default:
        return 'bg-white hover:bg-gray-50';
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
          {teams.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No teams in the league yet. Add some teams to get started!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-center">MP</TableHead>
                  <TableHead className="text-center">W</TableHead>
                  <TableHead className="text-center">D</TableHead>
                  <TableHead className="text-center">L</TableHead>
                  <TableHead className="text-center">GF</TableHead>
                  <TableHead className="text-center">GA</TableHead>
                  <TableHead className="text-center">GD</TableHead>
                  <TableHead className="text-center">Pts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTeams.map((team, index) => {
                  const position = index + 1;
                  const goalDifference = team.goalsFor - team.goalsAgainst;
                  
                  return (
                    <TableRow
                      key={team.id}
                      className={`transition-all ${getPositionColor(position)}`}
                    >
                      <TableCell className="text-center">
                        {getPositionIcon(position)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{team.logo}</span>
                          <div>
                            <p className="font-semibold">{team.name}</p>
                            <p className="text-xs text-gray-600">{team.manager}</p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <span className="font-semibold">{team.matchesPlayed}</span>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <span className="font-semibold text-green-600">{team.wins}</span>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <span className="font-semibold text-yellow-600">{team.draws}</span>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <span className="font-semibold text-red-600">{team.losses}</span>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <span className="font-semibold">{team.goalsFor}</span>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <span className="font-semibold">{team.goalsAgainst}</span>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <span className={`font-semibold ${goalDifference > 0 ? 'text-green-600' : goalDifference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {goalDifference > 0 ? '+' : ''}{goalDifference}
                        </span>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <span className="font-bold text-lg text-blue-600">{team.points}</span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
