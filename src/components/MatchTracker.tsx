
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calendar, Trophy, Target, Award } from "lucide-react";
import { Team, Match, Player } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";

interface MatchTrackerProps {
  teams: Team[];
  matches: Match[];
  onAddMatch: (match: Omit<Match, 'id'>) => void;
}

export const MatchTracker = ({ teams, matches, onAddMatch }: MatchTrackerProps) => {
  const { toast } = useToast();
  const [newMatch, setNewMatch] = useState({
    teamAId: '',
    teamBId: '',
    teamAScore: 0,
    teamBScore: 0,
    date: new Date().toISOString().split('T')[0],
    round: 'Group Stage'
  });
  const [goalScorers, setGoalScorers] = useState<Array<{
    playerId: string;
    teamId: string;
    goals: number;
    assists: number;
  }>>([]);
  const [showGoalScorerDialog, setShowGoalScorerDialog] = useState(false);

  const rounds = ['Group Stage', 'Round of 16', 'Quarter Final', 'Semi Final', 'Final'];

  const resetForm = () => {
    setNewMatch({
      teamAId: '',
      teamBId: '',
      teamAScore: 0,
      teamBScore: 0,
      date: new Date().toISOString().split('T')[0],
      round: 'Group Stage'
    });
    setGoalScorers([]);
    setShowGoalScorerDialog(false);
  };

  const handleAddMatch = () => {
    if (!newMatch.teamAId || !newMatch.teamBId || newMatch.teamAId === newMatch.teamBId) {
      toast({
        title: "Error",
        description: "Please select two different teams",
        variant: "destructive",
      });
      return;
    }

    const totalGoals = newMatch.teamAScore + newMatch.teamBScore;
    const totalGoalScorers = goalScorers.reduce((sum, gs) => sum + gs.goals, 0);

    if (totalGoals !== totalGoalScorers) {
      toast({
        title: "Error",
        description: `Total goals (${totalGoals}) must match goal scorers (${totalGoalScorers})`,
        variant: "destructive",
      });
      return;
    }

    onAddMatch({
      ...newMatch,
      goalScorers
    });

    resetForm();

    toast({
      title: "Success",
      description: "Match added successfully! You can add another match.",
    });
  };

  const addGoalScorer = () => {
    setGoalScorers([...goalScorers, {
      playerId: '',
      teamId: '',
      goals: 1,
      assists: 0
    }]);
  };

  const updateGoalScorer = (index: number, updates: Partial<typeof goalScorers[0]>) => {
    const updated = [...goalScorers];
    updated[index] = { ...updated[index], ...updates };
    setGoalScorers(updated);
  };

  const removeGoalScorer = (index: number) => {
    setGoalScorers(goalScorers.filter((_, i) => i !== index));
  };

  const getPlayersForTeam = (teamId: string): Player[] => {
    const team = teams.find(t => t.id === teamId);
    return team?.players || [];
  };

  return (
    <div className="space-y-6">
      {/* Add Match Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add New Match</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label>Team A</Label>
                <Select value={newMatch.teamAId} onValueChange={(value) => setNewMatch({ ...newMatch, teamAId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Team A" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        <div className="flex items-center space-x-2">
                          <span>{team.logo}</span>
                          <span>{team.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Team B</Label>
                <Select value={newMatch.teamBId} onValueChange={(value) => setNewMatch({ ...newMatch, teamBId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Team B" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id} disabled={team.id === newMatch.teamAId}>
                        <div className="flex items-center space-x-2">
                          <span>{team.logo}</span>
                          <span>{team.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Round</Label>
                <Select value={newMatch.round} onValueChange={(value) => setNewMatch({ ...newMatch, round: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rounds.map((round) => (
                      <SelectItem key={round} value={round}>
                        {round}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newMatch.date}
                  onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
                />
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={() => setShowGoalScorerDialog(true)}
                  className="w-full football-gradient"
                  disabled={!newMatch.teamAId || !newMatch.teamBId}
                >
                  Set Score & Stats
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Match History ({matches.length} matches)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {matches.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No matches played yet</p>
                <p className="text-gray-400">Add your first match above to get started!</p>
              </div>
            ) : (
              matches.slice().reverse().map((match) => {
                const teamA = teams.find(t => t.id === match.teamAId);
                const teamB = teams.find(t => t.id === match.teamBId);
                
                return (
                  <div key={match.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-xl">{teamA?.logo}</p>
                          <p className="font-semibold text-sm">{teamA?.name}</p>
                        </div>
                        
                        <div className="text-center bg-green-100 px-4 py-2 rounded-lg">
                          <p className="text-2xl font-bold text-green-800">
                            {match.teamAScore} - {match.teamBScore}
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-xl">{teamB?.logo}</p>
                          <p className="font-semibold text-sm">{teamB?.name}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">{match.round}</p>
                        <p className="text-sm text-gray-600">{match.date}</p>
                      </div>
                    </div>
                    
                    {match.goalScorers.length > 0 && (
                      <div className="border-t pt-3">
                        <p className="font-semibold mb-2">Player Stats:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {match.goalScorers.map((scorer, index) => {
                            const team = teams.find(t => t.id === scorer.teamId);
                            const player = team?.players.find(p => p.id === scorer.playerId);
                            return (
                              <div key={index} className="flex items-center space-x-2 text-sm">
                                <span>{team?.logo}</span>
                                <span className="font-medium">{player?.name}</span>
                                <div className="flex items-center space-x-1">
                                  <Target className="h-3 w-3 text-green-600" />
                                  <span>{scorer.goals}</span>
                                </div>
                                {scorer.assists > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <Award className="h-3 w-3 text-blue-600" />
                                    <span>{scorer.assists}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Goal Scorer Dialog */}
      <Dialog open={showGoalScorerDialog} onOpenChange={setShowGoalScorerDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Set Match Score & Player Statistics</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Score Input */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-lg font-semibold">
                  {teams.find(t => t.id === newMatch.teamAId)?.name} Score
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={newMatch.teamAScore}
                  onChange={(e) => setNewMatch({ ...newMatch, teamAScore: parseInt(e.target.value) || 0 })}
                  className="text-xl text-center font-bold"
                />
              </div>
              <div>
                <Label className="text-lg font-semibold">
                  {teams.find(t => t.id === newMatch.teamBId)?.name} Score
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={newMatch.teamBScore}
                  onChange={(e) => setNewMatch({ ...newMatch, teamBScore: parseInt(e.target.value) || 0 })}
                  className="text-xl text-center font-bold"
                />
              </div>
            </div>

            {/* Goal Scorers */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Player Statistics</h3>
                <Button onClick={addGoalScorer} size="sm" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Player Stats</span>
                </Button>
              </div>
              
              <div className="space-y-4">
                {goalScorers.map((scorer, index) => (
                  <div key={index} className="grid grid-cols-5 gap-3 items-end p-4 border rounded-lg bg-gray-50">
                    <div>
                      <Label className="font-medium">Team</Label>
                      <Select 
                        value={scorer.teamId} 
                        onValueChange={(value) => updateGoalScorer(index, { 
                          teamId: value, 
                          playerId: '' // Reset player when team changes
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={newMatch.teamAId}>
                            <div className="flex items-center space-x-2">
                              <span>{teams.find(t => t.id === newMatch.teamAId)?.logo}</span>
                              <span>{teams.find(t => t.id === newMatch.teamAId)?.name}</span>
                            </div>
                          </SelectItem>
                          <SelectItem value={newMatch.teamBId}>
                            <div className="flex items-center space-x-2">
                              <span>{teams.find(t => t.id === newMatch.teamBId)?.logo}</span>
                              <span>{teams.find(t => t.id === newMatch.teamBId)?.name}</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="font-medium">Player</Label>
                      <Select 
                        value={scorer.playerId} 
                        onValueChange={(value) => updateGoalScorer(index, { playerId: value })}
                        disabled={!scorer.teamId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select player" />
                        </SelectTrigger>
                        <SelectContent>
                          {getPlayersForTeam(scorer.teamId).map((player) => (
                            <SelectItem key={player.id} value={player.id}>
                              #{player.jerseyNumber} {player.name} ({player.position})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="font-medium flex items-center space-x-1">
                        <Target className="h-4 w-4 text-green-600" />
                        <span>Goals</span>
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        value={scorer.goals}
                        onChange={(e) => updateGoalScorer(index, { goals: parseInt(e.target.value) || 0 })}
                        className="text-center"
                      />
                    </div>
                    
                    <div>
                      <Label className="font-medium flex items-center space-x-1">
                        <Award className="h-4 w-4 text-blue-600" />
                        <span>Assists</span>
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        value={scorer.assists}
                        onChange={(e) => updateGoalScorer(index, { assists: parseInt(e.target.value) || 0 })}
                        className="text-center"
                      />
                    </div>
                    
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => removeGoalScorer(index)}
                      className="mt-6"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                
                {goalScorers.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                    <Target className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No player stats added yet</p>
                    <p className="text-sm text-gray-400">Click "Add Player Stats" to record goals and assists</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowGoalScorerDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMatch} className="football-gradient">
                <Plus className="h-4 w-4 mr-2" />
                Add Match
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
