import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { Match, Team, GoalScorer, Player } from "@/hooks/useSupabaseLeagueData";
import { useToast } from "@/hooks/use-toast";

interface EditMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match | null;
  teams: Team[];
  onSave: (matchId: string, updates: Partial<Match>) => void;
}

interface PlayerStats {
  playerId: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
}

export const EditMatchModal: React.FC<EditMatchModalProps> = ({
  isOpen,
  onClose,
  match,
  teams,
  onSave
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    teamAId: '',
    teamBId: '',
    teamAScore: 0,
    teamBScore: 0,
    date: '',
    round: 'Group Stage'
  });
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);

  useEffect(() => {
    if (match) {
      setFormData({
        teamAId: match.teamAId,
        teamBId: match.teamBId,
        teamAScore: match.teamAScore,
        teamBScore: match.teamBScore,
        date: match.date,
        round: match.round
      });

      // Convert goal scorers to player stats
      const stats = match.goalScorers.map(gs => ({
        playerId: gs.playerId,
        goals: gs.goals,
        assists: gs.assists,
        yellowCards: gs.yellowCards,
        redCards: gs.redCards
      }));
      setPlayerStats(stats);
    }
  }, [match]);

  const getAvailablePlayers = () => {
    if (!formData.teamAId && !formData.teamBId) return [];
    
    const teamA = teams.find(t => t.id === formData.teamAId);
    const teamB = teams.find(t => t.id === formData.teamBId);
    
    const allPlayers: Array<Player & { teamId: string; teamName: string }> = [];
    if (teamA) allPlayers.push(...teamA.players.map(p => ({ ...p, teamId: teamA.id, teamName: teamA.name })));
    if (teamB) allPlayers.push(...teamB.players.map(p => ({ ...p, teamId: teamB.id, teamName: teamB.name })));
    
    return allPlayers;
  };

  const addPlayerStat = () => {
    setPlayerStats([...playerStats, {
      playerId: '',
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
    }]);
  };

  const updatePlayerStat = (index: number, field: keyof PlayerStats, value: string | number) => {
    const newStats = [...playerStats];
    newStats[index] = { ...newStats[index], [field]: value };
    setPlayerStats(newStats);
  };

  const removePlayerStat = (index: number) => {
    setPlayerStats(playerStats.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!match) return;

    // Validation
    if (!formData.teamAId || !formData.teamBId) {
      toast({
        title: "Error",
        description: "Both teams must be selected",
        variant: "destructive",
      });
      return;
    }

    if (formData.teamAId === formData.teamBId) {
      toast({
        title: "Error",
        description: "Teams cannot play against themselves",
        variant: "destructive",
      });
      return;
    }

    if (!formData.date) {
      toast({
        title: "Error",
        description: "Match date is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.teamAScore < 0 || formData.teamBScore < 0) {
      toast({
        title: "Error",
        description: "Scores cannot be negative",
        variant: "destructive",
      });
      return;
    }

    // Convert player stats back to goal scorers
    const goalScorers: GoalScorer[] = playerStats
      .filter(stat => stat.playerId)
      .map(stat => {
        const player = getAvailablePlayers().find(p => p.id === stat.playerId);
        return {
          playerId: stat.playerId,
          teamId: player?.teamId || '',
          goals: stat.goals,
          assists: stat.assists,
          yellowCards: stat.yellowCards,
          redCards: stat.redCards,
        };
      });

    const updates: Partial<Match> = {
      ...formData,
      goalScorers
    };

    onSave(match.id, updates);
    onClose();
    toast({
      title: "Success",
      description: "Match updated successfully",
    });
  };

  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.name || 'Unknown Team';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>✏️</span>
            <span>Edit Match</span>
          </DialogTitle>
          <DialogDescription>
            Update match information and player statistics. Changes will update leaderboards and stats.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Teams Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="teamA">Team A</Label>
              <Select 
                value={formData.teamAId} 
                onValueChange={(value) => setFormData({...formData, teamAId: value})}
              >
                <SelectTrigger className="animate-fade-in">
                  <SelectValue placeholder="Select Team A" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id} disabled={team.id === formData.teamBId}>
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
              <Label htmlFor="teamB">Team B</Label>
              <Select 
                value={formData.teamBId} 
                onValueChange={(value) => setFormData({...formData, teamBId: value})}
              >
                <SelectTrigger className="animate-fade-in">
                  <SelectValue placeholder="Select Team B" />
                </SelectTrigger>
                <SelectContent>
                  {teams.filter(t => t.id !== formData.teamAId).map(team => (
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
          </div>

          {/* Scores and Date */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="teamAScore">{getTeamName(formData.teamAId)} Score</Label>
              <Input
                id="teamAScore"
                type="number"
                min="0"
                value={formData.teamAScore}
                onChange={(e) => setFormData({...formData, teamAScore: parseInt(e.target.value) || 0})}
                className="animate-fade-in"
              />
            </div>
            <div>
              <Label htmlFor="teamBScore">{getTeamName(formData.teamBId)} Score</Label>
              <Input
                id="teamBScore"
                type="number"
                min="0"
                value={formData.teamBScore}
                onChange={(e) => setFormData({...formData, teamBScore: parseInt(e.target.value) || 0})}
                className="animate-fade-in"
              />
            </div>
            <div>
              <Label htmlFor="date">Match Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="animate-fade-in"
              />
            </div>
          </div>

          {/* Round Selection */}
          <div>
            <Label htmlFor="round">Round</Label>
            <Select 
              value={formData.round} 
              onValueChange={(value) => setFormData({...formData, round: value})}
            >
              <SelectTrigger className="animate-fade-in">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Group Stage">🏟️ Group Stage</SelectItem>
                <SelectItem value="Round of 16">🎯 Round of 16</SelectItem>
                <SelectItem value="Quarter Finals">⚡ Quarter Finals</SelectItem>
                <SelectItem value="Semi Finals">🔥 Semi Finals</SelectItem>
                <SelectItem value="Final">🏆 Final</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Player Statistics */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <Label className="text-lg font-semibold">Player Statistics</Label>
              <Button 
                type="button" 
                onClick={addPlayerStat} 
                size="sm"
                className="animate-hover-scale"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Player
              </Button>
            </div>

            {playerStats.map((stat, index) => (
              <Card key={index} className="mb-4 animate-fade-in">
                <CardContent className="p-4">
                  <div className="grid grid-cols-6 gap-4 items-end">
                    <div className="col-span-2">
                      <Label>Player</Label>
                      <Select 
                        value={stat.playerId} 
                        onValueChange={(value) => updatePlayerStat(index, 'playerId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Player" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailablePlayers().map(player => (
                            <SelectItem key={player.id} value={player.id}>
                              {player.name} (#{player.jerseyNumber}) - {player.teamName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Goals ⚽</Label>
                      <Input
                        type="number"
                        min="0"
                        value={stat.goals}
                        onChange={(e) => updatePlayerStat(index, 'goals', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Assists 🅰️</Label>
                      <Input
                        type="number"
                        min="0"
                        value={stat.assists}
                        onChange={(e) => updatePlayerStat(index, 'assists', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>🟨 Cards</Label>
                      <Select 
                        value={stat.yellowCards.toString()} 
                        onValueChange={(value) => updatePlayerStat(index, 'yellowCards', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Label>🟥</Label>
                        <div className="flex items-center justify-center mt-2">
                          <input
                            type="checkbox"
                            checked={stat.redCards > 0}
                            onChange={(e) => updatePlayerStat(index, 'redCards', e.target.checked ? 1 : 0)}
                            className="w-5 h-5"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePlayerStat(index)}
                        className="mt-6"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="football-gradient animate-hover-scale">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};