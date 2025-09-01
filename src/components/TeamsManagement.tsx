import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Users, Edit, Trash2, User } from "lucide-react";
import { Team, Player } from "@/hooks/useSupabaseLeagueData";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getClubLogo, getClubOptions } from "@/utils/footballClubs";
import { TeamLogo } from "./ui/team-logo";
// Import real football club logos
import arsenalLogo from "@/assets/logos/arsenal.png";
import chelseaLogo from "@/assets/logos/chelsea.png";
import liverpoolLogo from "@/assets/logos/liverpool.png";
import manchesterUnitedLogo from "@/assets/logos/manchester-united.png";
import manchesterCityLogo from "@/assets/logos/manchester-city.png";
import realMadridLogo from "@/assets/logos/real-madrid.png";
import barcelonaLogo from "@/assets/logos/barcelona.png";
import bayernLogo from "@/assets/logos/bayern.png";
import juventusLogo from "@/assets/logos/juventus.png";
import tottenhamLogo from "@/assets/logos/tottenham.png";
import psgLogo from "@/assets/logos/psg.png";
import dortmundLogo from "@/assets/logos/dortmund.png";
import acMilanLogo from "@/assets/logos/ac-milan.png";
import interMilanLogo from "@/assets/logos/inter-milan.png";
import atleticoMadridLogo from "@/assets/logos/atletico-madrid.png";

// Import custom fantasy logos
import dragonsFcLogo from "@/assets/logos/dragons-fc.png";
import lionsUnitedLogo from "@/assets/logos/lions-united.png";
import eaglesFcLogo from "@/assets/logos/eagles-fc.png";
import lightningFcLogo from "@/assets/logos/lightning-fc.png";
import knightsFcLogo from "@/assets/logos/knights-fc.png";
import wolvesFcLogo from "@/assets/logos/wolves-fc.png";
import starsFcLogo from "@/assets/logos/stars-fc.png";
import phoenixFcLogo from "@/assets/logos/phoenix-fc.png";

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

  // Comprehensive logo library with real football clubs and fantasy teams
  const logoOptions = [
    // Premier League clubs
    { name: "Arsenal", logo: arsenalLogo, category: "Premier League" },
    { name: "Chelsea", logo: chelseaLogo, category: "Premier League" },
    { name: "Liverpool", logo: liverpoolLogo, category: "Premier League" },
    { name: "Manchester United", logo: manchesterUnitedLogo, category: "Premier League" },
    { name: "Manchester City", logo: manchesterCityLogo, category: "Premier League" },
    { name: "Tottenham", logo: tottenhamLogo, category: "Premier League" },
    
    // La Liga clubs
    { name: "Real Madrid", logo: realMadridLogo, category: "La Liga" },
    { name: "Barcelona", logo: barcelonaLogo, category: "La Liga" },
    { name: "Atletico Madrid", logo: atleticoMadridLogo, category: "La Liga" },
    
    // Bundesliga clubs
    { name: "Bayern Munich", logo: bayernLogo, category: "Bundesliga" },
    { name: "Borussia Dortmund", logo: dortmundLogo, category: "Bundesliga" },
    
    // Serie A clubs
    { name: "Juventus", logo: juventusLogo, category: "Serie A" },
    { name: "AC Milan", logo: acMilanLogo, category: "Serie A" },
    { name: "Inter Milan", logo: interMilanLogo, category: "Serie A" },
    
    // Ligue 1 clubs
    { name: "PSG", logo: psgLogo, category: "Ligue 1" },
    
    // Fantasy teams
    { name: "Dragons FC", logo: dragonsFcLogo, category: "Fantasy" },
    { name: "Lions United", logo: lionsUnitedLogo, category: "Fantasy" },
    { name: "Eagles FC", logo: eaglesFcLogo, category: "Fantasy" },
    { name: "Lightning FC", logo: lightningFcLogo, category: "Fantasy" },
    { name: "Knights FC", logo: knightsFcLogo, category: "Fantasy" },
    { name: "Wolves FC", logo: wolvesFcLogo, category: "Fantasy" },
    { name: "Stars FC", logo: starsFcLogo, category: "Fantasy" },
    { name: "Phoenix FC", logo: phoenixFcLogo, category: "Fantasy" },
    
    // Emoji fallbacks
    { name: "Custom Ball", logo: '⚽', category: "Custom" },
    { name: "Custom Shield", logo: '🛡️', category: "Custom" },
    { name: "Custom Star", logo: '⭐', category: "Custom" },
    { name: "Custom Fire", logo: '🔥', category: "Custom" },
    { name: "Custom Thunder", logo: '⚡', category: "Custom" },
    { name: "Custom Diamond", logo: '💎', category: "Custom" },
    { name: "Custom Eagle", logo: '🦅', category: "Custom" },
    { name: "Custom Wolf", logo: '🐺', category: "Custom" },
    { name: "Custom Lion", logo: '🦁', category: "Custom" },
    { name: "Custom Trophy", logo: '🏆', category: "Custom" },
  ];

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [newTeam, setNewTeam] = useState({ name: '', manager: '', logo: logoOptions[0].logo });
  const [newPlayer, setNewPlayer] = useState({ 
    name: '', 
    jerseyNumber: 1, 
    position: '' as 'Forward' | 'Midfielder' | 'Defender' | 'Goalkeeper' | '', 
    goals: 0, 
    assists: 0,
    yellowCards: 0,
    redCards: 0
  });

  const handleAddTeam = () => {
    if (!newTeam.name || !newTeam.manager) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Auto-assign real club logo if available (prioritize auto-assignment)
    const autoLogo = getClubLogo(newTeam.name);
    const finalLogo = autoLogo || newTeam.logo || '⚽';

    onAddTeam({
      ...newTeam,
      logo: finalLogo,
      players: [],
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0
    });

    // Show success message with auto-assignment info
    if (autoLogo) {
      toast({
        title: "✅ Team Added Successfully!",
        description: `Real ${newTeam.name} logo automatically assigned. You can change it anytime.`,
      });
    } else {
      toast({
        title: "Success",
        description: "Team added successfully!",
      });
    }

    setNewTeam({ name: '', manager: '', logo: logoOptions[0].logo });
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

    // Type-safe player creation
    const playerData = {
      ...newPlayer,
      position: newPlayer.position as 'Forward' | 'Midfielder' | 'Defender' | 'Goalkeeper'
    };

    onAddPlayer(teamId, playerData);
    setNewPlayer({ name: '', jerseyNumber: 1, position: '' as any, goals: 0, assists: 0, yellowCards: 0, redCards: 0 });
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
              <div className="space-y-2">
                {/* Current selection display with improved alignment */}
                <div className="flex items-center space-x-3 p-3 bg-white/90 backdrop-blur-sm border rounded-md">
                  <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center border-2 border-white shadow-sm">
                    {newTeam.logo.includes('.png') || newTeam.logo.includes('.jpg') || newTeam.logo.startsWith('http') ? (
                      <img 
                        src={newTeam.logo} 
                        alt="Selected logo"
                        className="w-8 h-8 object-contain rounded-full"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<span class="text-xl">⚽</span>`;
                          }
                        }}
                      />
                    ) : (
                      <span className="text-xl">{newTeam.logo}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {logoOptions.find(opt => opt.logo === newTeam.logo)?.name || 'Selected Logo'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {logoOptions.find(opt => opt.logo === newTeam.logo)?.category || 'Custom'}
                    </p>
                  </div>
                </div>
                
                {/* Logo selection modal */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full bg-white/90 hover:bg-white">
                      Choose Logo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden bg-white/95 backdrop-blur-sm">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <span>🏆 Choose Team Logo</span>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto max-h-[60vh] pr-2">
                      <div className="space-y-6">
                        {/* Group logos by category */}
                        {['Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1', 'Fantasy', 'Custom'].map(category => (
                          <div key={category} className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                              {category}
                            </h3>
                            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                              {logoOptions
                                .filter(option => option.category === category)
                                .map((option, index) => (
                                <button
                                  key={`${category}-${index}`}
                                  onClick={() => {
                                    setNewTeam({ ...newTeam, logo: option.logo });
                                  }}
                                  className={`group relative p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                                    newTeam.logo === option.logo 
                                      ? 'border-green-400 bg-green-50 shadow-md' 
                                      : 'border-gray-200 hover:border-green-300 bg-white'
                                  }`}
                                  title={`${option.name} (${option.category})`}
                                >
                                  <div className="flex flex-col items-center space-y-2">
                                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-green-50 group-hover:to-blue-50">
                                      {option.logo.includes('.png') || option.logo.includes('.jpg') || option.logo.startsWith('http') ? (
                                        <img 
                                          src={option.logo} 
                                          alt={option.name}
                                          className="w-10 h-10 object-contain rounded-full transition-transform group-hover:scale-110"
                                          onError={(e) => {
                                            const target = e.currentTarget as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent) {
                                              parent.innerHTML = `<span class="text-2xl">⚽</span>`;
                                            }
                                          }}
                                        />
                                      ) : (
                                        <span className="text-2xl transition-transform group-hover:scale-110">{option.logo}</span>
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-600 text-center font-medium truncate w-full">
                                      {option.name}
                                    </span>
                                  </div>
                                  {newTeam.logo === option.logo && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs">✓</span>
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
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
                  <TeamLogo logo={team.logo} teamName={team.name} size="xl" showTooltip />
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="hover:shadow-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="animate-scale-in">
                      <AlertDialogHeader>
                        <AlertDialogTitle>🗑️ Remove Team</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove <strong>{team.name}</strong>? This will:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Delete all team data and players</li>
                            <li>Remove from league table and matches</li>
                            <li>Recalculate all statistics</li>
                          </ul>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            onDeleteTeam(team.id);
                            toast({
                              title: "✅ Team removed successfully",
                              description: `${team.name} has been removed from the league.`,
                            });
                          }}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Remove Team
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
                   {selectedTeam.logo.includes('.png') || selectedTeam.logo.includes('.jpg') || selectedTeam.logo.startsWith('http') ? (
                     <img 
                       src={selectedTeam.logo} 
                       alt={selectedTeam.name}
                       className="w-10 h-10 object-contain rounded-full"
                       onError={(e) => {
                         const target = e.currentTarget as HTMLImageElement;
                         target.style.display = 'none';
                         const parent = target.parentElement;
                         if (parent) {
                           parent.innerHTML = `<span class="text-3xl">⚽</span>`;
                         }
                       }}
                     />
                   ) : (
                     <span className="text-3xl">{selectedTeam.logo}</span>
                   )}
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
                      <Select value={newPlayer.position} onValueChange={(value) => setNewPlayer({ ...newPlayer, position: value as 'Forward' | 'Midfielder' | 'Defender' | 'Goalkeeper' })}>
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
