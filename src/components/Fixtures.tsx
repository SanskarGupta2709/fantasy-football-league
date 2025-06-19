
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus } from 'lucide-react';
import { Team, Fixture } from '@/hooks/useSupabaseLeagueData';

interface FixturesProps {
  teams: Team[];
  fixtures: Fixture[];
  onAddFixture: (fixture: Omit<Fixture, 'id'>) => void;
}

export const Fixtures: React.FC<FixturesProps> = ({ teams, fixtures, onAddFixture }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    teamAId: '',
    teamBId: '',
    scheduledDate: '',
    stage: 'Group Stage',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.teamAId && formData.teamBId && formData.scheduledDate) {
      onAddFixture({
        ...formData,
        status: 'Upcoming' as const,
      });
      setFormData({
        teamAId: '',
        teamBId: '',
        scheduledDate: '',
        stage: 'Group Stage',
      });
      setShowForm(false);
    }
  };

  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.name || 'Unknown Team';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming': return 'bg-blue-100 text-blue-800';
      case 'Ongoing': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Match Fixtures</h3>
        <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Schedule Match</span>
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Match</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Team A</label>
                  <Select value={formData.teamAId} onValueChange={(value) => setFormData({...formData, teamAId: value})}>
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
                  <Select value={formData.teamBId} onValueChange={(value) => setFormData({...formData, teamBId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Team B" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.filter(t => t.id !== formData.teamAId).map(team => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stage</label>
                  <Select value={formData.stage} onValueChange={(value) => setFormData({...formData, stage: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Group Stage">Group Stage</SelectItem>
                      <SelectItem value="Quarter Finals">Quarter Finals</SelectItem>
                      <SelectItem value="Semi Finals">Semi Finals</SelectItem>
                      <SelectItem value="Final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Schedule Match</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {fixtures.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No fixtures scheduled yet. Create your first fixture!</p>
            </CardContent>
          </Card>
        ) : (
          fixtures.map(fixture => (
            <Card key={fixture.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="font-semibold">{getTeamName(fixture.teamAId)}</p>
                      <p className="text-sm text-gray-500">Home</p>
                    </div>
                    <div className="text-2xl font-bold text-gray-400">VS</div>
                    <div className="text-center">
                      <p className="font-semibold">{getTeamName(fixture.teamBId)}</p>
                      <p className="text-sm text-gray-500">Away</p>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge className={getStatusColor(fixture.status)}>
                      {fixture.status}
                    </Badge>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(fixture.scheduledDate).toLocaleDateString()}</span>
                      <Clock className="h-4 w-4" />
                      <span>{new Date(fixture.scheduledDate).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm font-medium">{fixture.stage}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
