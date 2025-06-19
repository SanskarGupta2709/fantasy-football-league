
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

  const logoOptions = ['⚽', '🔴', '🔵', '🟢', '🟡', '🟣', '🟠', '⚪', '⚫', '🔶'];

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
      {/* Add Team Section */}
      <Card>
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
              />
            </div>
            <div>
              <Label htmlFor="manager">Manager</Label>
              <Input
                id="manager"
                value={newTeam.manager}
                onChange={(e) => setNewTeam({ ...newTeam, manager: e.target.value })}
                placeholder="Enter manager name"
              />
            </div>
            <div>
              <Label htmlFor="logo">Team Logo</Label>
              <Select value={newTeam.logo} onValueChange={(value) => setNewTeam({ ...newTeam, logo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {logoOptions.map((logo) => (
                    <SelectItem key={logo} value={logo}>
                      <span className="text-xl">{logo}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddTeam} className="w-full football-gradient">
                Add Team
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teams List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teams.map((team) => (
          <Card key={team.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{team.logo}</span>
                  <div>
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <p className="text-sm text-gray-600">Manager: {team.manager}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedTeam(team)}
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
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="font-bold text-lg">{team.points}</p>
                  <p className="text-sm text-gray-600">Points</p>
                </div>
                <div>
                  <p className="font-bold text-lg">{team.goalsFor}</p>
                  <p className="text-sm text-gray-600">Goals For</p>
                </div>
                <div>
                  <p className="font-bold text-lg">{team.players.length}</p>
                  <p className="text-sm text-gray-600">Players</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Detail Modal */}
      {selectedTeam && (
        <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <span className="text-2xl">{selectedTeam.logo}</span>
                <span>{selectedTeam.name} - Squad Management</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Add Player Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add New Player</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <Label>Player Name</Label>
                      <Input
                        value={newPlayer.name}
                        onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                        placeholder="Enter player name"
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
                      />
                    </div>
                    <div>
                      <Label>Position</Label>
                      <Select value={newPlayer.position} onValueChange={(value) => setNewPlayer({ ...newPlayer, position: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                          <SelectItem value="Defender">Defender</SelectItem>
                          <SelectItem value="Midfielder">Midfielder</SelectItem>
                          <SelectItem value="Forward">Forward</SelectItem>
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
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={() => handleAddPlayer(selectedTeam.id)} className="w-full">
                        Add Player
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Players List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Squad ({selectedTeam.players.length} players)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedTeam.players.map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-800">
                            {player.jerseyNumber}
                          </div>
                          <div>
                            <p className="font-semibold">{player.name}</p>
                            <p className="text-sm text-gray-600">{player.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="font-bold">⚽ {player.goals}</p>
                            <p className="text-sm text-gray-600">Goals</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold">🅰️ {player.assists}</p>
                            <p className="text-sm text-gray-600">Assists</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {selectedTeam.players.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No players added yet. Add your first player above!</p>
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
