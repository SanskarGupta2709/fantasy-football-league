
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, User } from "lucide-react";
import { Team, Player } from "@/hooks/useSupabaseLeagueData";
import { useToast } from "@/hooks/use-toast";
import { EditPlayerModal } from "./EditPlayerModal";
import { TeamLogo } from "./ui/team-logo";
import { getClubLogo } from "@/utils/footballClubs";

interface PlayerManagementProps {
  teams: Team[];
  onAddPlayer: (teamId: string, player: Omit<Player, 'id'>) => void;
  onUpdatePlayer: (teamId: string, playerId: string, updates: Partial<Player>) => void;
  onDeletePlayer: (playerId: string) => void;
}

export const PlayerManagement = ({
  teams,
  onAddPlayer,
  onUpdatePlayer,
  onDeletePlayer
}: PlayerManagementProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<(Player & { teamId: string; teamName: string }) | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    jerseyNumber: 1,
    position: '',
    teamId: '',
    goals: 0,
    assists: 0
  });

  const allPlayers = teams.flatMap(team => 
    team.players.map(player => ({
      ...player,
      teamId: team.id,
      teamName: team.name,
      teamLogo: team.logo
    }))
  );

  const filteredPlayers = allPlayers.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.jerseyNumber.toString().includes(searchTerm) ||
    player.teamName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPlayer = () => {
    if (!newPlayer.name || !newPlayer.position || !newPlayer.teamId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const team = teams.find(t => t.id === newPlayer.teamId);
    if (team && team.players.some(p => p.jerseyNumber === newPlayer.jerseyNumber)) {
      toast({
        title: "Error",
        description: "Jersey number already taken in this team",
        variant: "destructive",
      });
      return;
    }

    onAddPlayer(newPlayer.teamId, {
      name: newPlayer.name,
      jerseyNumber: newPlayer.jerseyNumber,
      position: newPlayer.position as 'Forward' | 'Midfielder' | 'Defender' | 'Goalkeeper',
      goals: newPlayer.goals,
      assists: newPlayer.assists,
      yellowCards: 0,
      redCards: 0
    });

    setNewPlayer({
      name: '',
      jerseyNumber: 1,
      position: '',
      teamId: '',
      goals: 0,
      assists: 0
    });
  };

  const getPositionBadgeColor = (position: string) => {
    const colors = {
      'Goalkeeper': 'bg-purple-100 text-purple-800',
      'Defender': 'bg-blue-100 text-blue-800',
      'Midfielder': 'bg-green-100 text-green-800',
      'Forward': 'bg-red-100 text-red-800'
    };
    return colors[position as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleEditPlayer = (player: Player & { teamId: string; teamName: string }) => {
    setEditingPlayer(player);
    setIsEditModalOpen(true);
  };

  const handleSavePlayer = (playerId: string, teamId: string, updates: Partial<Player>) => {
    onUpdatePlayer(teamId, playerId, updates);
    setIsEditModalOpen(false);
    setEditingPlayer(null);
  };

  return (
    <div className="space-y-6">
      <EditPlayerModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPlayer(null);
        }}
        player={editingPlayer}
        teams={teams}
        onSave={handleSavePlayer}
      />
      {/* Add Player Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add New Player</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="playerName">Player Name</Label>
              <Input
                id="playerName"
                value={newPlayer.name}
                onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                placeholder="Enter player name"
              />
            </div>
            <div>
              <Label htmlFor="jerseyNumber">Jersey #</Label>
              <Input
                id="jerseyNumber"
                type="number"
                min="1"
                max="99"
                value={newPlayer.jerseyNumber}
                onChange={(e) => setNewPlayer({ ...newPlayer, jerseyNumber: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <Label htmlFor="position">Position</Label>
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
              <Label htmlFor="team">Team</Label>
              <Select value={newPlayer.teamId} onValueChange={(value) => setNewPlayer({ ...newPlayer, teamId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      <div className="flex items-center space-x-2">
                        <TeamLogo logo={team.logo} teamName={team.name} size="sm" />
                        <span>{team.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="goals">Goals</Label>
              <Input
                id="goals"
                type="number"
                min="0"
                value={newPlayer.goals}
                onChange={(e) => setNewPlayer({ ...newPlayer, goals: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddPlayer} className="w-full football-gradient">
                Add Player
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search & Player List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>All Players ({allPlayers.length})</span>
            </CardTitle>
            <div className="flex items-center space-x-2 w-64">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {allPlayers.length === 0 
                  ? "No players added yet. Add your first player above!" 
                  : "No players match your search criteria."
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Jersey #</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Goals</TableHead>
                  <TableHead>Assists</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">{player.name}</TableCell>
                    <TableCell>
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-800">
                        {player.jerseyNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPositionBadgeColor(player.position)}`}>
                        {player.position}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <TeamLogo logo={player.teamLogo} teamName={player.teamName} size="md" showTooltip />
                        <span>{player.teamName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">⚽ {player.goals}</TableCell>
                    <TableCell className="font-bold">🅰️ {player.assists}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPlayer({
                            ...player,
                            teamId: player.teamId,
                            teamName: player.teamName
                          })}
                          className="animate-hover-scale"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${player.name}?`)) {
                              onDeletePlayer(player.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
