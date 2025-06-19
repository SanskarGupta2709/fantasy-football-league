
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calendar, Trophy } from "lucide-react";
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

    toast({
      title: "Success",
      description: "Match added successfully!",
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
                  Set Score & Scorers
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
            <span>Match Results ({matches.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {matches.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No matches played yet. Add your first match above!</p>
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
                        <p className="font-semibold mb-2">Goal Scorers:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {match.goalScorers.map((scorer, index) => {
                            const team = teams.find(t => t.id === scorer.teamId);
                            const player = team?.players.find(p => p.id === scorer.playerId);
                            return (
                              <div key={index} className="flex items-center space-x-2 text-sm">
                                <span>{team?.logo}</span>
                                <span>{player?.name}</span>
                                <span>⚽ {scorer.goals}</span>
                                {scorer.assists > 0 && <span>🅰️ {scorer.assists}</span>}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Set Match Score & Goal Scorers</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Score Input */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>
                  {teams.find(t => t.id === newMatch.teamAId)?.name} Score
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={newMatch.teamAScore}
                  onChange={(e) => setNewMatch({ ...newMatch, teamAScore: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>
                  {teams.find(t => t.id === newMatch.teamBId)?.name} Score
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={newMatch.teamBScore}
                  onChange={(e) => setNewMatch({ ...newMatch, teamBScore: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Goal Scorers */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Goal Scorers</h3>
                <Button onClick={addGoalScorer} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Scorer
                </Button>
              </div>
              
              <div className="space-y-3">
                {goalScorers.map((scorer, index) => (
                  <div key={index} className="grid grid-cols-4 gap-3 items-end">
                    <div>
                      <Label>Team</Label>
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
                            {teams.find(t => t.id === newMatch.teamAId)?.name}
                          </SelectItem>
                          <SelectItem value={newMatch.teamBId}>
                            {teams.find(t => t.id === newMatch.teamBId)?.name}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Player</Label>
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
                              #{player.jerseyNumber} {player.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Goals</Label>
                      <Input
                        type="number"
                        min="1"
                        value={scorer.goals}
                        onChange={(e) => updateGoalScorer(index, { goals: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => removeGoalScorer(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowGoalScorerDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMatch} className="football-gradient">
                Add Match
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
