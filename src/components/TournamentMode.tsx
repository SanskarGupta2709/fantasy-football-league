
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, Trophy, Users, Target, Calendar } from 'lucide-react';
import { Team, Fixture, Match } from '@/hooks/useSupabaseLeagueData';
import { Fixtures } from './Fixtures';
import { PlayoffBracket } from './PlayoffBracket';

interface TournamentModeProps {
  teams: Team[];
  fixtures: Fixture[];
  matches: Match[];
  bracket: any;
  onAddFixture: (fixture: Omit<Fixture, 'id'>) => void;
  onUpdateBracket: (bracketData: any, stage: string) => void;
}

type TournamentType = 'oneoff' | 'four-team' | 'eight-team' | 'custom';

export const TournamentMode: React.FC<TournamentModeProps> = ({
  teams,
  fixtures,
  matches,
  bracket,
  onAddFixture,
  onUpdateBracket
}) => {
  const [tournamentType, setTournamentType] = useState<TournamentType | ''>('');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [bestOfSeries, setBestOfSeries] = useState<'1' | '3' | '5'>('1');
  const [activeSubTab, setActiveSubTab] = useState<'setup' | 'fixtures' | 'bracket'>('setup');

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateOneOffFixtures = () => {
    if (selectedTeams.length !== 2) return;
    
    const seriesCount = parseInt(bestOfSeries);
    const fixtures: Omit<Fixture, 'id'>[] = [];
    
    for (let i = 1; i <= seriesCount; i++) {
      fixtures.push({
        teamAId: selectedTeams[0],
        teamBId: selectedTeams[1],
        scheduledDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
        stage: `Game ${i} of ${seriesCount}`,
        status: 'Upcoming'
      });
    }
    
    fixtures.forEach(fixture => onAddFixture(fixture));
  };

  const generateFourTeamFixtures = () => {
    if (selectedTeams.length !== 4) return;
    
    const shuffledTeams = shuffleArray(selectedTeams);
    const fixtures: Omit<Fixture, 'id'>[] = [];
    
    // Round robin: each team plays every other team once
    for (let i = 0; i < shuffledTeams.length; i++) {
      for (let j = i + 1; j < shuffledTeams.length; j++) {
        fixtures.push({
          teamAId: shuffledTeams[i],
          teamBId: shuffledTeams[j],
          scheduledDate: new Date(Date.now() + fixtures.length * 24 * 60 * 60 * 1000).toISOString(),
          stage: 'Group Stage',
          status: 'Upcoming'
        });
      }
    }
    
    fixtures.forEach(fixture => onAddFixture(fixture));
  };

  const generateEightTeamFixtures = () => {
    if (selectedTeams.length !== 8) return;
    
    const shuffledTeams = shuffleArray(selectedTeams);
    const groupA = shuffledTeams.slice(0, 4);
    const groupB = shuffledTeams.slice(4, 8);
    const fixtures: Omit<Fixture, 'id'>[] = [];
    
    // Group A fixtures
    for (let i = 0; i < groupA.length; i++) {
      for (let j = i + 1; j < groupA.length; j++) {
        fixtures.push({
          teamAId: groupA[i],
          teamBId: groupA[j],
          scheduledDate: new Date(Date.now() + fixtures.length * 24 * 60 * 60 * 1000).toISOString(),
          stage: 'Group A',
          status: 'Upcoming'
        });
      }
    }
    
    // Group B fixtures
    for (let i = 0; i < groupB.length; i++) {
      for (let j = i + 1; j < groupB.length; j++) {
        fixtures.push({
          teamAId: groupB[i],
          teamBId: groupB[j],
          scheduledDate: new Date(Date.now() + fixtures.length * 24 * 60 * 60 * 1000).toISOString(),
          stage: 'Group B',
          status: 'Upcoming'
        });
      }
    }
    
    fixtures.forEach(fixture => onAddFixture(fixture));
  };

  const generateCustomFixtures = () => {
    if (selectedTeams.length < 2) return;
    
    const fixtures: Omit<Fixture, 'id'>[] = [];
    
    // Round robin for custom number of teams
    for (let i = 0; i < selectedTeams.length; i++) {
      for (let j = i + 1; j < selectedTeams.length; j++) {
        fixtures.push({
          teamAId: selectedTeams[i],
          teamBId: selectedTeams[j],
          scheduledDate: new Date(Date.now() + fixtures.length * 24 * 60 * 60 * 1000).toISOString(),
          stage: 'Group Stage',
          status: 'Upcoming'
        });
      }
    }
    
    fixtures.forEach(fixture => onAddFixture(fixture));
  };

  const handleGenerateFixtures = () => {
    switch (tournamentType) {
      case 'oneoff':
        generateOneOffFixtures();
        break;
      case 'four-team':
        generateFourTeamFixtures();
        break;
      case 'eight-team':
        generateEightTeamFixtures();
        break;
      case 'custom':
        generateCustomFixtures();
        break;
    }
    setActiveSubTab('fixtures');
  };

  const getTeamRequirement = () => {
    switch (tournamentType) {
      case 'oneoff': return 2;
      case 'four-team': return 4;
      case 'eight-team': return 8;
      case 'custom': return 0; // Any number
      default: return 0;
    }
  };

  const isTeamSelectionValid = () => {
    const required = getTeamRequirement();
    if (required === 0) return selectedTeams.length >= 2;
    return selectedTeams.length === required;
  };

  const subTabs = [
    { id: 'setup', label: 'Tournament Setup', icon: Zap },
    { id: 'fixtures', label: 'Fixtures', icon: Calendar },
    { id: 'bracket', label: 'Bracket', icon: Trophy },
  ];

  const renderSetup = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-blue-500" />
            <span>Tournament Setup</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Tournament Type</label>
            <Select value={tournamentType} onValueChange={(value: TournamentType) => setTournamentType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select tournament type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oneoff">One-off Match (2 Teams)</SelectItem>
                <SelectItem value="four-team">4-Team Tournament</SelectItem>
                <SelectItem value="eight-team">8-Team Tournament</SelectItem>
                <SelectItem value="custom">Custom Tournament</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tournamentType === 'oneoff' && (
            <div>
              <label className="block text-sm font-medium mb-2">Best of Series</label>
              <Select value={bestOfSeries} onValueChange={(value: '1' | '3' | '5') => setBestOfSeries(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Best of 1</SelectItem>
                  <SelectItem value="3">Best of 3</SelectItem>
                  <SelectItem value="5">Best of 5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Select Teams 
              {getTeamRequirement() > 0 && (
                <span className="text-sm text-gray-500 ml-2">
                  (Required: {getTeamRequirement()})
                </span>
              )}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {teams.map(team => (
                <Button
                  key={team.id}
                  variant={selectedTeams.includes(team.id) ? "default" : "outline"}
                  onClick={() => {
                    const maxTeams = getTeamRequirement() || teams.length;
                    if (selectedTeams.includes(team.id)) {
                      setSelectedTeams(selectedTeams.filter(id => id !== team.id));
                    } else if (selectedTeams.length < maxTeams) {
                      setSelectedTeams([...selectedTeams, team.id]);
                    }
                  }}
                  className="flex items-center space-x-2 justify-start"
                >
                  <span>{team.logo}</span>
                  <span className="truncate">{team.name}</span>
                </Button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Selected: {selectedTeams.length} teams
            </p>
          </div>

          <Button
            onClick={handleGenerateFixtures}
            disabled={!tournamentType || !isTeamSelectionValid()}
            className="w-full"
          >
            Generate Tournament Fixtures
          </Button>
        </CardContent>
      </Card>

      {tournamentType && (
        <Card>
          <CardHeader>
            <CardTitle>Tournament Format</CardTitle>
          </CardHeader>
          <CardContent>
            {tournamentType === 'oneoff' && (
              <div className="space-y-2">
                <p>• 2 teams compete in a {bestOfSeries === '1' ? 'single match' : `best of ${bestOfSeries} series`}</p>
                <p>• Winner is determined by {bestOfSeries === '1' ? 'match result' : 'series wins'}</p>
              </div>
            )}
            {tournamentType === 'four-team' && (
              <div className="space-y-2">
                <p>• 4 teams in round-robin format (6 matches total)</p>
                <p>• Each team plays every other team once</p>
                <p>• Top 2 teams advance to final based on points and goal difference</p>
              </div>
            )}
            {tournamentType === 'eight-team' && (
              <div className="space-y-2">
                <p>• 8 teams split into 2 groups of 4</p>
                <p>• Round-robin within each group (6 matches per group)</p>
                <p>• Top 2 from each group advance to semifinals</p>
                <p>• Winners of semifinals play in final</p>
              </div>
            )}
            {tournamentType === 'custom' && (
              <div className="space-y-2">
                <p>• Round-robin format with selected teams</p>
                <p>• Each team plays every other team once</p>
                <p>• Top 2 teams advance to final based on points and goal difference</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center space-x-2">
            <Zap className="h-8 w-8 text-blue-500" />
            <span>Tournament Mode</span>
          </h2>
          <p className="text-gray-600">Create and manage tournament competitions</p>
        </div>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {subTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeSubTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveSubTab(tab.id as any)}
              className="flex items-center space-x-2"
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </Button>
          );
        })}
      </div>

      {activeSubTab === 'setup' && renderSetup()}
      {activeSubTab === 'fixtures' && (
        <Fixtures
          teams={teams}
          fixtures={fixtures}
          onAddFixture={onAddFixture}
        />
      )}
      {activeSubTab === 'bracket' && (
        <PlayoffBracket
          teams={teams}
          bracket={bracket}
          onUpdateBracket={onUpdateBracket}
          isUnlocked={true}
        />
      )}
    </div>
  );
};
