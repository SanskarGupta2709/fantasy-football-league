import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Users, Edit, Trash2, User } from "lucide-react";
import { Team, Player } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";

interface TeamsManagementProps {
  teams: Team[];
  onAddTeam: (team: Omit<Team, 'id'>) => void;
  onUpdateTeam: (teamId: string, updates: Partial<Team>) => void;
  onDeleteTeam: (teamId: string) => void;
  onAddPlayer: (teamId: string, player: Omit<Player, 'id'>) => void;
  onUpdatePlayer: (teamId: string, playerId: string, updates: Partial<Player>) => void;
}

export const TeamsManagement = ({
  teams,
  onAddTeam,
  onUpdateTeam,
  onDeleteTeam,
  onAddPlayer,
  onUpdatePlayer
}: TeamsManagementProps) => {
  const { toast } = useToast();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [newTeam, setNewTeam] = useState({ name: '', manager: '', logo: '⚽' });
  const [newPlayer, setNewPlayer] = useState({ 
    name: '', 
    jerseyNumber: 1, 
    position: '', 
    goals: 0, 
    assists: 0 
  });

  // Enhanced logo options with more football-themed badges and shields
  const logoOptions = [
    '⚽', '🔴', '🔵', '🟢', '🟡', '🟣', '🟠', '⚪', '⚫', '🔶',
    '🛡️', '⭐', '🔥', '⚡', '💎', '🦅', '🐺', '🦁', '🐯', '🏆',
    '👑', '⚔️', '🗲', '🌟', '💪', '🎯', '🔱', '🏴', '🚀', '💫'
  ];

  const handleAddTeam = () => {
    if (!newTeam.name || !newTeam.manager) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    onAddTeam({
      ...newTeam,
      players: [],
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0
    });

    setNewTeam({ name: '', manager: '', logo: '⚽' });
    toast({
      title: "Success",
      description: "Team added successfully!",
    });
  };

  const handleAddPlayer = (teamId: string) => {
    if (!newPlayer.name || !newPlayer.position) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const team = teams.find(t => t.id === teamId);
    if (team && team.players.some(p => p.jerseyNumber === newPlayer.jerseyNumber)) {
      toast({
        title: "Error",
        description: "Jersey number already taken",
        variant: "destructive",
      });
      return;
    }

    onAddPlayer(teamId, newPlayer);
    setNewPlayer({ name: '', jerseyNumber: 1, position: '', goals: 0, assists: 0 });
    toast({
      title: "Success",
      description: "Player added successfully!",
    });
  };

  return (
    <div className="space-y-6">
      {/* Add Team Section with Enhanced Logo Gallery */}
      <Card className="stadium-glow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add New Team</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                placeholder="Enter team name"
                className="bg-white/90 backdrop-blur-sm"
              />
            </div>
            <div>
              <Label htmlFor="manager">Manager</Label>
              <Input
                id="manager"
                value={newTeam.manager}
                onChange={(e) => setNewTeam({ ...newTeam, manager: e.target.value })}
                placeholder="Enter manager name"
                className="bg-white/90 backdrop-blur-sm"
              />
            </div>
            <div>
              <Label htmlFor="logo">Team Logo/Badge</Label>
              <Select value={newTeam.logo} onValueChange={(value) => setNewTeam({ ...newTeam, logo: value })}>
                <SelectTrigger className="bg-white/90 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48 bg-white/95 backdrop-blur-sm">
                  <div className="grid grid-cols-6 gap-1 p-2">
                    {logoOptions.map((logo) => (
                      <SelectItem 
                        key={logo} 
                        value={logo}
                        className="flex items-center justify-center p-2 hover:bg-green-50 cursor-pointer rounded"
                      >
                        <span className="text-2xl hover:scale-110 transition-transform">{logo}</span>
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddTeam} className="w-full football-gradient hover:shadow-lg">
                Add Team
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teams List with Enhanced Visual Design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teams.map((team) => (
          <Card key={team.id} className="hover:shadow-xl transition-all duration-300 stadium-glow hover:scale-[1.02] bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <span className="text-4xl drop-shadow-sm">{team.logo}</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-800">{team.name}</CardTitle>
                    <p className="text-sm text-gray-600 font-medium">Manager: {team.manager}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedTeam(team)}
                    className="hover:bg-green-50 hover:border-green-300 bg-white/80"
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this team?')) {
                        onDeleteTeam(team.id);
                        toast({
                          title: "Team deleted",
                          description: `${team.name} has been removed from the league.`,
                        });
                      }
                    }}
                    className="hover:shadow-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 p-3 rounded-lg">
                  <p className="font-bold text-xl text-yellow-800">{team.points}</p>
                  <p className="text-sm text-yellow-700 font-medium">Points</p>
                </div>
                <div className="bg-gradient-to-r from-green-100 to-green-200 p-3 rounded-lg">
                  <p className="font-bold text-xl text-green-800">{team.goalsFor}</p>
                  <p className="text-sm text-green-700 font-medium">Goals For</p>
                </div>
                <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-3 rounded-lg">
                  <p className="font-bold text-xl text-blue-800">{team.players.length}</p>
                  <p className="text-sm text-blue-700 font-medium">Players</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Detail Modal with Enhanced Design */}
      {selectedTeam && (
        <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                  <span className="text-3xl">{selectedTeam.logo}</span>
                </div>
                <span className="text-xl font-bold">{selectedTeam.name} - Squad Management</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Add Player Form with Enhanced Styling */}
              <Card className="stadium-glow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Add New Player</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <Label>Player Name</Label>
                      <Input
                        value={newPlayer.name}
                        onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                        placeholder="Enter player name"
                        className="bg-white/90"
                      />
                    </div>
                    <div>
                      <Label>Jersey Number</Label>
                      <Input
                        type="number"
                        min="1"
                        max="99"
                        value={newPlayer.jerseyNumber}
                        onChange={(e) => setNewPlayer({ ...newPlayer, jerseyNumber: parseInt(e.target.value) || 1 })}
                        className="bg-white/90"
                      />
                    </div>
                    <div>
                      <Label>Position</Label>
                      <Select value={newPlayer.position} onValueChange={(value) => setNewPlayer({ ...newPlayer, position: value })}>
                        <SelectTrigger className="bg-white/90">
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95">
                          <SelectItem value="Goalkeeper">🧤 Goalkeeper</SelectItem>
                          <SelectItem value="Defender">🛡️ Defender</SelectItem>
                          <SelectItem value="Midfielder">⚡ Midfielder</SelectItem>
                          <SelectItem value="Forward">⚽ Forward</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Goals</Label>
                      <Input
                        type="number"
                        min="0"
                        value={newPlayer.goals}
                        onChange={(e) => setNewPlayer({ ...newPlayer, goals: parseInt(e.target.value) || 0 })}
                        className="bg-white/90"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={() => handleAddPlayer(selectedTeam.id)} className="w-full football-gradient hover:shadow-lg">
                        Add Player
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Players List with Enhanced Visual Design */}
              <Card className="stadium-glow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Current Squad ({selectedTeam.players.length} players)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedTeam.players.map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-4 rounded-lg border-2 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all duration-300 bg-white/80 shadow-sm">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center font-bold text-green-800 shadow-lg border-2 border-white">
                            {player.jerseyNumber}
                          </div>
                          <div>
                            <p className="font-semibold text-lg text-gray-800">{player.name}</p>
                            <p className="text-sm text-gray-600 font-medium">{player.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-center bg-green-100 p-2 rounded-lg min-w-[60px]">
                            <p className="font-bold text-green-800">⚽ {player.goals}</p>
                            <p className="text-xs text-green-700">Goals</p>
                          </div>
                          <div className="text-center bg-blue-100 p-2 rounded-lg min-w-[60px]">
                            <p className="font-bold text-blue-800">🎯 {player.assists}</p>
                            <p className="text-xs text-blue-700">Assists</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {selectedTeam.players.length === 0 && (
                      <div className="text-center text-gray-500 py-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                        <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No players added yet</p>
                        <p className="text-sm">Add your first player above to build your squad!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
