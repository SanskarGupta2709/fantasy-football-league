
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award, Edit, Save, X } from "lucide-react";
import { Team } from '@/hooks/useSupabaseLeagueData';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from '@/contexts/AuthContext';
import { TeamLogo } from "./ui/team-logo";

interface LeaderboardProps {
  teams: Team[];
  onUpdateTeam?: (teamId: string, updates: Partial<Team>) => void;
}

interface EditableTeamStats {
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  matchesPlayed: number;
}

export const Leaderboard = ({ teams, onUpdateTeam }: LeaderboardProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStats, setEditingStats] = useState<Record<string, EditableTeamStats>>({});
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Manager';
  const firstName = userName.split(' ')[0];

  const enableEditMode = () => {
    const initialStats: Record<string, EditableTeamStats> = {};
    teams.forEach(team => {
      initialStats[team.id] = {
        points: team.points,
        goalsFor: team.goalsFor,
        goalsAgainst: team.goalsAgainst,
        matchesPlayed: team.matchesPlayed
      };
    });
    setEditingStats(initialStats);
    setIsEditMode(true);
  };

  const cancelEditMode = () => {
    setIsEditMode(false);
    setEditingStats({});
  };

  const saveChanges = () => {
    if (!onUpdateTeam) return;
    
    Object.entries(editingStats).forEach(([teamId, stats]) => {
      const team = teams.find(t => t.id === teamId);
      if (team) {
        const goalDifference = stats.goalsFor - stats.goalsAgainst;
        const oldGD = team.goalsFor - team.goalsAgainst;
        
        onUpdateTeam(teamId, {
          points: stats.points,
          goalsFor: stats.goalsFor,
          goalsAgainst: stats.goalsAgainst,
          matchesPlayed: stats.matchesPlayed,
        });
      }
    });
    
    setIsEditMode(false);
    setEditingStats({});
  };

  const updateTeamStats = (teamId: string, field: keyof EditableTeamStats, value: number) => {
    setEditingStats(prev => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        [field]: Math.max(0, value)
      }
    }));
  };

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
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <span className="break-words">
                <span className="hidden sm:inline">{userName}'s League Table</span>
                <span className="sm:hidden">{firstName}'s League Table</span>
              </span>
            </div>
            {onUpdateTeam && (
              <div className="flex space-x-2">
                {!isEditMode ? (
                  <Button 
                    size="sm" 
                    onClick={enableEditMode}
                    className="animate-hover-scale"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Table
                  </Button>
                ) : (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={cancelEditMode}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={saveChanges}
                      className="animate-hover-scale"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {teams.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No teams in the league yet. Add some teams to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center sticky left-0 bg-white">#</TableHead>
                    <TableHead className="min-w-[200px] sticky left-16 bg-white">Team</TableHead>
                    <TableHead className="text-center w-16">MP</TableHead>
                    <TableHead className="text-center w-16">W</TableHead>
                    <TableHead className="text-center w-16">D</TableHead>
                    <TableHead className="text-center w-16">L</TableHead>
                    <TableHead className="text-center w-16">GF</TableHead>
                    <TableHead className="text-center w-16">GA</TableHead>
                    <TableHead className="text-center w-16">GD</TableHead>
                    <TableHead className="text-center w-20">Pts</TableHead>
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
                        <TableCell className="text-center sticky left-0 bg-inherit">
                          {getPositionIcon(position)}
                        </TableCell>
                        
                        <TableCell className="sticky left-16 bg-inherit">
                          <div className="flex items-center space-x-3">
                            <TeamLogo logo={team.logo} teamName={team.name} size="lg" showTooltip />
                            <div>
                              <p className="font-semibold">{team.name}</p>
                              <p className="text-xs text-gray-600">{team.manager}</p>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          {isEditMode ? (
                            <Input
                              type="number"
                              min="0"
                              value={editingStats[team.id]?.matchesPlayed ?? team.matchesPlayed}
                              onChange={(e) => updateTeamStats(team.id, 'matchesPlayed', parseInt(e.target.value) || 0)}
                              className="w-16 text-center"
                            />
                          ) : (
                            <span className="font-semibold">{team.matchesPlayed}</span>
                          )}
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
                          {isEditMode ? (
                            <Input
                              type="number"
                              min="0"
                              value={editingStats[team.id]?.goalsFor ?? team.goalsFor}
                              onChange={(e) => updateTeamStats(team.id, 'goalsFor', parseInt(e.target.value) || 0)}
                              className="w-16 text-center"
                            />
                          ) : (
                            <span className="font-bold text-green-700">{team.goalsFor}</span>
                          )}
                        </TableCell>
                        
                        <TableCell className="text-center">
                          {isEditMode ? (
                            <Input
                              type="number"
                              min="0"
                              value={editingStats[team.id]?.goalsAgainst ?? team.goalsAgainst}
                              onChange={(e) => updateTeamStats(team.id, 'goalsAgainst', parseInt(e.target.value) || 0)}
                              className="w-16 text-center"
                            />
                          ) : (
                            <span className="font-bold text-red-700">{team.goalsAgainst}</span>
                          )}
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <span className={`font-bold text-lg ${goalDifference > 0 ? 'text-green-600' : goalDifference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {goalDifference > 0 ? '+' : ''}{goalDifference}
                          </span>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          {isEditMode ? (
                            <Input
                              type="number"
                              min="0"
                              value={editingStats[team.id]?.points ?? team.points}
                              onChange={(e) => updateTeamStats(team.id, 'points', parseInt(e.target.value) || 0)}
                              className="w-16 text-center font-bold"
                            />
                          ) : (
                            <span className="font-bold text-xl text-blue-600">{team.points}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-2 text-blue-600">Abbreviations:</p>
              <div className="space-y-1">
                <p><span className="font-medium">MP</span> - Matches Played</p>
                <p><span className="font-medium">W</span> - Wins</p>
                <p><span className="font-medium">D</span> - Draws</p>
                <p><span className="font-medium">L</span> - Losses</p>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-2 text-green-600">Scoring:</p>
              <div className="space-y-1">
                <p><span className="font-medium text-green-700">GF</span> - Goals For</p>
                <p><span className="font-medium text-red-700">GA</span> - Goals Against</p>
                <p><span className="font-medium">GD</span> - Goal Difference</p>
                <p><span className="font-medium text-blue-600">Pts</span> - Points</p>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-2 text-purple-600">Point System:</p>
              <div className="space-y-1">
                <p><span className="text-green-600">Win:</span> 3 points</p>
                <p><span className="text-yellow-600">Draw:</span> 1 point</p>
                <p><span className="text-red-600">Loss:</span> 0 points</p>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-2 text-orange-600">Tie Breakers:</p>
              <div className="space-y-1">
                <p>1. Points</p>
                <p>2. Goal Difference</p>
                <p>3. Goals Scored</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
