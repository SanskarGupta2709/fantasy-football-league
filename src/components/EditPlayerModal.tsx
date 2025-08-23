import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Player, Team } from "@/hooks/useSupabaseLeagueData";
import { useToast } from "@/hooks/use-toast";

interface EditPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player & { teamId: string; teamName: string } | null;
  teams: Team[];
  onSave: (playerId: string, teamId: string, updates: Partial<Player>) => void;
}

export const EditPlayerModal: React.FC<EditPlayerModalProps> = ({
  isOpen,
  onClose,
  player,
  teams,
  onSave
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    jerseyNumber: 1,
    position: 'Forward' as Player['position'],
    teamId: '',
    goals: 0,
    assists: 0
  });

  useEffect(() => {
    if (player) {
      setFormData({
        name: player.name,
        jerseyNumber: player.jerseyNumber,
        position: player.position,
        teamId: player.teamId,
        goals: player.goals,
        assists: player.assists
      });
    }
  }, [player]);

  const handleSave = () => {
    if (!player) return;

    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Player name is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.jerseyNumber < 1 || formData.jerseyNumber > 99) {
      toast({
        title: "Error",
        description: "Jersey number must be between 1 and 99",
        variant: "destructive",
      });
      return;
    }

    if (formData.goals < 0 || formData.assists < 0) {
      toast({
        title: "Error",
        description: "Goals and assists cannot be negative",
        variant: "destructive",
      });
      return;
    }

    // Check if jersey number is unique within the new team
    const targetTeam = teams.find(t => t.id === formData.teamId);
    if (targetTeam) {
      const jerseyTaken = targetTeam.players.some(
        p => p.id !== player.id && p.jerseyNumber === formData.jerseyNumber
      );
      if (jerseyTaken) {
        toast({
          title: "Error",
          description: "Jersey number already taken in this team",
          variant: "destructive",
        });
        return;
      }
    }

    onSave(player.id, formData.teamId, {
      name: formData.name,
      jerseyNumber: formData.jerseyNumber,
      position: formData.position,
      goals: formData.goals,
      assists: formData.assists
    });

    onClose();
    toast({
      title: "Success",
      description: "Player updated successfully",
    });
  };

  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'Goalkeeper': return '🧤';
      case 'Defender': return '🛡️';
      case 'Midfielder': return '⚽';
      case 'Forward': return '🎯';
      default: return '⚽';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>✏️</span>
            <span>Edit Player</span>
          </DialogTitle>
          <DialogDescription>
            Update player information. All changes will be reflected immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="playerName">Player Name</Label>
              <Input
                id="playerName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter player name"
                className="animate-fade-in"
              />
            </div>
            <div>
              <Label htmlFor="jerseyNumber">Jersey Number</Label>
              <Input
                id="jerseyNumber"
                type="number"
                min="1"
                max="99"
                value={formData.jerseyNumber}
                onChange={(e) => setFormData({ ...formData, jerseyNumber: parseInt(e.target.value) || 1 })}
                className="animate-fade-in"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="position">Position</Label>
            <Select 
              value={formData.position} 
              onValueChange={(value) => setFormData({ ...formData, position: value as Player['position'] })}
            >
              <SelectTrigger className="animate-fade-in">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Goalkeeper">
                  <div className="flex items-center space-x-2">
                    <span>🧤</span>
                    <span>Goalkeeper</span>
                  </div>
                </SelectItem>
                <SelectItem value="Defender">
                  <div className="flex items-center space-x-2">
                    <span>🛡️</span>
                    <span>Defender</span>
                  </div>
                </SelectItem>
                <SelectItem value="Midfielder">
                  <div className="flex items-center space-x-2">
                    <span>⚽</span>
                    <span>Midfielder</span>
                  </div>
                </SelectItem>
                <SelectItem value="Forward">
                  <div className="flex items-center space-x-2">
                    <span>🎯</span>
                    <span>Forward</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="team">Team</Label>
            <Select 
              value={formData.teamId} 
              onValueChange={(value) => setFormData({ ...formData, teamId: value })}
            >
              <SelectTrigger className="animate-fade-in">
                <SelectValue />
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="goals">Goals ⚽</Label>
              <Input
                id="goals"
                type="number"
                min="0"
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: parseInt(e.target.value) || 0 })}
                className="animate-fade-in"
              />
            </div>
            <div>
              <Label htmlFor="assists">Assists 🅰️</Label>
              <Input
                id="assists"
                type="number"
                min="0"
                value={formData.assists}
                onChange={(e) => setFormData({ ...formData, assists: parseInt(e.target.value) || 0 })}
                className="animate-fade-in"
              />
            </div>
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