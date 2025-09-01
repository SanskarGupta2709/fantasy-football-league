import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Zap, Trophy, Users, Target, Calendar, Edit, Trash2, RotateCcw } from 'lucide-react';
import { Team, Fixture, Match } from '@/hooks/useSupabaseLeagueData';
import { Fixtures } from './Fixtures';
import { PlayoffBracket } from './PlayoffBracket';
import { useToast } from '@/hooks/use-toast';
import { TeamLogo } from "./ui/team-logo";

interface TournamentModeProps {
  teams: Team[];
  fixtures: Fixture[];
  matches: Match[];
  bracket: any;
  onAddFixture: (fixture: Omit<Fixture, 'id'>) => void;
  onUpdateBracket: (bracketData: any, stage: string) => void;
  onResetTournament?: () => void;
}

type TournamentType = 'oneoff' | 'four-team' | 'eight-team' | 'custom';

interface TournamentGroup {
  name: string;
  teams: Team[];
}

export const TournamentMode: React.FC<TournamentModeProps> = ({
  teams,
  fixtures,
  matches,
  bracket,
  onAddFixture,
  onUpdateBracket,
  onResetTournament
}) => {
  const [tournamentType, setTournamentType] = useState<TournamentType | ''>('');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [bestOfSeries, setBestOfSeries] = useState<'1' | '3' | '5'>('1');
  const [activeSubTab, setActiveSubTab] = useState<'setup' | 'fixtures' | 'groups' | 'bracket'>('setup');
  const [tournamentGroups, setTournamentGroups] = useState<TournamentGroup[]>([]);
  const { toast } = useToast();

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleResetTournament = async () => {
    if (confirm('Are you sure you want to reset the tournament? This will clear all fixtures, matches, and bracket data.')) {
      try {
        // Reset local state
        setTournamentType('');
        setSelectedTeams([]);
        setBestOfSeries('1');
        setTournamentGroups([]);
        setActiveSubTab('setup');
        
        // Call the parent reset function to clear backend data
        if (onResetTournament) {
          await onResetTournament();
        }
        
        toast({
          title: "Tournament Reset Successfully",
          description: "Please select teams to begin a new tournament.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to reset tournament data",
          variant: "destructive"
        });
      }
    }
  };

  const calculateGroupStats = (groupTeams: Team[], groupName: string) => {
    return groupTeams.map(team => {
      // Get matches for this team in this group
      const teamMatches = matches.filter(match => 
        (match.teamAId === team.id || match.teamBId === team.id) &&
        fixtures.some(fixture => 
          fixture.stage === groupName &&
          ((fixture.teamAId === match.teamAId && fixture.teamBId === match.teamBId) ||
           (fixture.teamAId === match.teamBId && fixture.teamBId === match.teamAId))
        )
      );

      let goalsFor = 0;
      let goalsAgainst = 0;
      let points = 0;
      let wins = 0;
      let draws = 0;
      let losses = 0;

      teamMatches.forEach(match => {
        if (match.teamAId === team.id) {
          goalsFor += match.teamAScore;
          goalsAgainst += match.teamBScore;
          if (match.teamAScore > match.teamBScore) {
            wins++;
            points += 3;
          } else if (match.teamAScore === match.teamBScore) {
            draws++;
            points += 1;
          } else {
            losses++;
          }
        } else {
          goalsFor += match.teamBScore;
          goalsAgainst += match.teamAScore;
          if (match.teamBScore > match.teamAScore) {
            wins++;
            points += 3;
          } else if (match.teamBScore === match.teamAScore) {
            draws++;
            points += 1;
          } else {
            losses++;
          }
        }
      });

      return {
        ...team,
        groupGoalsFor: goalsFor,
        groupGoalsAgainst: goalsAgainst,
        groupGoalDifference: goalsFor - goalsAgainst,
        groupPoints: points,
        groupWins: wins,
        groupDraws: draws,
        groupLosses: losses,
        matchesPlayed: teamMatches.length
      };
    }).sort((a, b) => {
      // Sort by points, then goal difference, then goals for
      if (b.groupPoints !== a.groupPoints) return b.groupPoints - a.groupPoints;
      if (b.groupGoalDifference !== a.groupGoalDifference) return b.groupGoalDifference - a.groupGoalDifference;
      return b.groupGoalsFor - a.groupGoalsFor;
    });
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
    
    // Set groups for display
    setTournamentGroups([
      { name: 'Group A', teams: groupA.map(id => teams.find(t => t.id === id)!).filter(Boolean) },
      { name: 'Group B', teams: groupB.map(id => teams.find(t => t.id === id)!).filter(Boolean) }
    ]);
    
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
    ...(tournamentType === 'eight-team' ? [{ id: 'groups', label: 'Groups', icon: Users }] : []),
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
                  <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    <TeamLogo logo={team.logo} teamName={team.name} size="md" showTooltip />
                  </div>
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

  const renderGroups = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Tournament Groups</h3>
        <p className="text-sm text-gray-600">Groups are ranked by Points → Goal Difference → Goals For</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tournamentGroups.map((group, groupIndex) => {
          const groupStats = calculateGroupStats(group.teams, group.name);
          
          return (
            <Card key={groupIndex}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {group.name.charAt(group.name.length - 1)}
                  </Badge>
                  <span>{group.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead className="text-center w-12">P</TableHead>
                        <TableHead className="text-center w-12">GF</TableHead>
                        <TableHead className="text-center w-12">GA</TableHead>
                        <TableHead className="text-center w-12">GD</TableHead>
                        <TableHead className="text-center w-16">Pts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupStats.map((team, teamIndex) => (
                        <TableRow key={team.id} className={teamIndex < 2 ? "bg-green-50" : ""}>
                          <TableCell className="font-medium">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              teamIndex === 0 ? 'bg-yellow-500' : 
                              teamIndex === 1 ? 'bg-gray-400' : 
                              'bg-blue-500'
                            }`}>
                              {teamIndex + 1}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <TeamLogo logo={team.logo} teamName={team.name} size="lg" showTooltip />
                              <div>
                                <p className="font-medium text-sm">{team.name}</p>
                                <p className="text-xs text-gray-500">{team.manager}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-medium text-sm">{team.matchesPlayed}</TableCell>
                          <TableCell className="text-center font-medium text-sm text-green-600">{team.groupGoalsFor}</TableCell>
                          <TableCell className="text-center font-medium text-sm text-red-600">{team.groupGoalsAgainst}</TableCell>
                          <TableCell className="text-center font-medium text-sm">
                            <span className={team.groupGoalDifference >= 0 ? "text-green-600" : "text-red-600"}>
                              {team.groupGoalDifference >= 0 ? '+' : ''}{team.groupGoalDifference}
                            </span>
                          </TableCell>
                          <TableCell className="text-center font-bold text-lg text-blue-600">{team.groupPoints}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-3 p-2 bg-green-50 rounded text-sm text-green-700">
                  <span className="font-medium">Top 2 teams advance to semifinals</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
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
        
        <Button
          variant="outline"
          onClick={handleResetTournament}
          className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 text-red-600"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset Tournament</span>
        </Button>
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
      {activeSubTab === 'groups' && renderGroups()}
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
