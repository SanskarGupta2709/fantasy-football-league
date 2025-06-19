
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { Team, Match, GoalScorer } from '@/hooks/useSupabaseLeagueData';

interface MatchTrackerProps {
  teams: Team[];
  matches: Match[];
  onAddMatch: (match: Omit<Match, 'id'>) => void;
}

interface PlayerStats {
  playerId: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
}

export const MatchTracker: React.FC<MatchTrackerProps> = ({ teams, matches, onAddMatch }) => {
  const [showForm, setShowForm] = useState(false);
  const [showAnimations, setShowAnimations] = useState(false);
  const [animationData, setAnimationData] = useState<{ goals: any[], redCards: any[] }>({ goals: [], redCards: [] });
  
  const [matchData, setMatchData] = useState({
    teamAId: '',
    teamBId: '',
    teamAScore: 0,
    teamBScore: 0,
    date: '',
    round: 'Group Stage',
  });

  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);

  const resetForm = () => {
    setMatchData({
      teamAId: '',
      teamBId: '',
      teamAScore: 0,
      teamBScore: 0,
      date: '',
      round: 'Group Stage',
    });
    setPlayerStats([]);
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

  const getAvailablePlayers = () => {
    if (!matchData.teamAId && !matchData.teamBId) return [];
    
    const teamA = teams.find(t => t.id === matchData.teamAId);
    const teamB = teams.find(t => t.id === matchData.teamBId);
    
    const allPlayers = [];
    if (teamA) allPlayers.push(...teamA.players.map(p => ({ ...p, teamId: teamA.id, teamName: teamA.name })));
    if (teamB) allPlayers.push(...teamB.players.map(p => ({ ...p, teamId: teamB.id, teamName: teamB.name })));
    
    return allPlayers;
  };

  const showMatchAnimations = (goalScorers: GoalScorer[]) => {
    const availablePlayers = getAvailablePlayers();
    
    const goalAnimations = goalScorers
      .filter(gs => gs.goals > 0)
      .map(gs => {
        const player = availablePlayers.find(p => p.id === gs.playerId);
        return {
          playerName: player?.name || 'Unknown',
          teamName: player?.teamName || 'Unknown',
          goals: gs.goals
        };
      });

    const redCardAnimations = goalScorers
      .filter(gs => gs.redCards > 0)
      .map(gs => {
        const player = availablePlayers.find(p => p.id === gs.playerId);
        return {
          playerName: player?.name || 'Unknown',
          teamName: player?.teamName || 'Unknown'
        };
      });

    setAnimationData({ goals: goalAnimations, redCards: redCardAnimations });
    setShowAnimations(true);
    
    setTimeout(() => {
      setShowAnimations(false);
      setAnimationData({ goals: [], redCards: [] });
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!matchData.teamAId || !matchData.teamBId || !matchData.date) {
      return;
    }

    // Determine team for each player
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

    const match: Omit<Match, 'id'> = {
      ...matchData,
      goalScorers,
    };

    onAddMatch(match);
    showMatchAnimations(goalScorers);
    resetForm();
    setShowForm(false);
  };

  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.name || 'Unknown Team';
  };

  const getPlayerName = (playerId: string) => {
    const player = getAvailablePlayers().find(p => p.id === playerId);
    return player ? `${player.name} (#${player.jerseyNumber})` : 'Unknown Player';
  };

  return (
    <div className="space-y-6">
      {/* Match Animations */}
      {showAnimations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96 bg-gradient-to-r from-green-400 to-blue-500 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold mb-4">Match Results!</h3>
              
              {animationData.goals.map((goal, index) => (
                <div key={index} className="animate-pulse mb-2 flex items-center justify-center space-x-2">
                  <span className="text-4xl animate-bounce">⚽</span>
                  <div className="bg-yellow-300 text-yellow-800 px-3 py-1 rounded-full animate-ping">
                    <span className="font-bold">{goal.playerName}</span> scored {goal.goals} goal{goal.goals > 1 ? 's' : ''}!
                  </div>
                </div>
              ))}
              
              {animationData.redCards.map((card, index) => (
                <div key={index} className="animate-bounce mb-2 flex items-center justify-center space-x-2">
                  <span className="text-4xl animate-pulse">🟥</span>
                  <div className="bg-red-300 text-red-800 px-3 py-1 rounded-full animate-bounce">
                    <span className="font-bold">{card.playerName}</span> received a red card!
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Match Tracker</h3>
        <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Match</span>
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Log Match Result</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Match Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Team A</label>
                  <Select value={matchData.teamAId} onValueChange={(value) => setMatchData({...matchData, teamAId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Team A" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map(team => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Team B</label>
                  <Select value={matchData.teamBId} onValueChange={(value) => setMatchData({...matchData, teamBId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Team B" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.filter(t => t.id !== matchData.teamAId).map(team => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Team A Score</label>
                  <Input
                    type="number"
                    min="0"
                    value={matchData.teamAScore}
                    onChange={(e) => setMatchData({...matchData, teamAScore: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Team B Score</label>
                  <Input
                    type="number"
                    min="0"
                    value={matchData.teamBScore}
                    onChange={(e) => setMatchData({...matchData, teamBScore: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <Input
                    type="date"
                    value={matchData.date}
                    onChange={(e) => setMatchData({...matchData, date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Round</label>
                <Select value={matchData.round} onValueChange={(value) => setMatchData({...matchData, round: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Group Stage">Group Stage</SelectItem>
                    <SelectItem value="Round of 16">Round of 16</SelectItem>
                    <SelectItem value="Quarter Finals">Quarter Finals</SelectItem>
                    <SelectItem value="Semi Finals">Semi Finals</SelectItem>
                    <SelectItem value="Final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Player Statistics */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold">Player Statistics</h4>
                  <Button type="button" onClick={addPlayerStat} size="sm">
                    Add Player
                  </Button>
                </div>

                {playerStats.map((stat, index) => (
                  <Card key={index} className="mb-4">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-6 gap-4 items-end">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-2">Player</label>
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
                          <label className="block text-sm font-medium mb-2">Goals ⚽</label>
                          <Input
                            type="number"
                            min="0"
                            value={stat.goals}
                            onChange={(e) => updatePlayerStat(index, 'goals', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Assists 🎯</label>
                          <Input
                            type="number"
                            min="0"
                            value={stat.assists}
                            onChange={(e) => updatePlayerStat(index, 'assists', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">🟨 Cards</label>
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
                            <label className="block text-sm font-medium mb-2">🟥</label>
                            <input
                              type="checkbox"
                              checked={stat.redCards > 0}
                              onChange={(e) => updatePlayerStat(index, 'redCards', e.target.checked ? 1 : 0)}
                              className="w-5 h-5"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removePlayerStat(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex space-x-2">
                <Button type="submit">Save Match</Button>
                <Button type="button" variant="outline" onClick={() => { resetForm(); setShowForm(false); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Match History */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Recent Matches</h4>
        {matches.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No matches recorded yet. Add your first match!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {matches.slice(0, 5).map(match => (
              <Card key={match.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="font-semibold">{getTeamName(match.teamAId)}</p>
                        <p className="text-2xl font-bold">{match.teamAScore}</p>
                      </div>
                      <div className="text-gray-400 font-bold">-</div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{match.teamBScore}</p>
                        <p className="font-semibold">{getTeamName(match.teamBId)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge>{match.round}</Badge>
                      <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(match.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {match.goalScorers.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="font-medium mb-2">Match Details:</h5>
                      <div className="space-y-1">
                        {match.goalScorers.map((scorer, index) => (
                          <div key={index} className="text-sm flex items-center space-x-2">
                            <span>{getPlayerName(scorer.playerId)}</span>
                            {scorer.goals > 0 && <Badge variant="outline">⚽ {scorer.goals}</Badge>}
                            {scorer.assists > 0 && <Badge variant="outline">🎯 {scorer.assists}</Badge>}
                            {scorer.yellowCards > 0 && <Badge variant="outline">🟨 {scorer.yellowCards}</Badge>}
                            {scorer.redCards > 0 && <Badge variant="outline">🟥</Badge>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
