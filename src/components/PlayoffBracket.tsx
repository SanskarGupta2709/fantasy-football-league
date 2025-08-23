
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trophy, Edit } from 'lucide-react';
import { Team, Bracket } from '@/hooks/useSupabaseLeagueData';

interface PlayoffBracketProps {
  teams: Team[];
  bracket: Bracket | null;
  onUpdateBracket: (bracketData: any, stage: string) => void;
  isUnlocked: boolean;
}

interface BracketMatch {
  id: string;
  teamA?: Team;
  teamB?: Team;
  scoreA?: number;
  scoreB?: number;
  winner?: Team;
}

export const PlayoffBracket: React.FC<PlayoffBracketProps> = ({ 
  teams, 
  bracket, 
  onUpdateBracket, 
  isUnlocked 
}) => {
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [bracketData, setBracketData] = useState(bracket?.bracketData || {
    quarterfinals: [],
    semifinals: [],
    final: null
  });

  const initializeBracket = () => {
    const topTeams = teams
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const aGD = a.goalsFor - a.goalsAgainst;
        const bGD = b.goalsFor - b.goalsAgainst;
        if (bGD !== aGD) return bGD - aGD;
        return b.goalsFor - a.goalsFor;
      })
      .slice(0, 8);

    const newBracketData = {
      quarterfinals: [
        { id: 'qf1', teamA: topTeams[0], teamB: topTeams[7] },
        { id: 'qf2', teamA: topTeams[1], teamB: topTeams[6] },
        { id: 'qf3', teamA: topTeams[2], teamB: topTeams[5] },
        { id: 'qf4', teamA: topTeams[3], teamB: topTeams[4] },
      ],
      semifinals: [
        { id: 'sf1' },
        { id: 'sf2' },
      ],
      final: { id: 'final' }
    };

    setBracketData(newBracketData);
    onUpdateBracket(newBracketData, 'playoffs');
  };

  const updateMatchResult = (stage: string, matchId: string, scoreA: number, scoreB: number) => {
    const newBracketData = { ...bracketData };
    
    if (stage === 'quarterfinals') {
      const match = newBracketData.quarterfinals.find((m: any) => m.id === matchId);
      if (match) {
        match.scoreA = scoreA;
        match.scoreB = scoreB;
        match.winner = scoreA > scoreB ? match.teamA : match.teamB;
        
        // Advance winner to semifinals
        const qfIndex = newBracketData.quarterfinals.findIndex((m: any) => m.id === matchId);
        const sfIndex = Math.floor(qfIndex / 2);
        const sfMatch = newBracketData.semifinals[sfIndex];
        
        if (qfIndex % 2 === 0) {
          sfMatch.teamA = match.winner;
        } else {
          sfMatch.teamB = match.winner;
        }
      }
    } else if (stage === 'semifinals') {
      const match = newBracketData.semifinals.find((m: any) => m.id === matchId);
      if (match) {
        match.scoreA = scoreA;
        match.scoreB = scoreB;
        match.winner = scoreA > scoreB ? match.teamA : match.teamB;
        
        // Advance winner to final
        const sfIndex = newBracketData.semifinals.findIndex((m: any) => m.id === matchId);
        if (sfIndex === 0) {
          newBracketData.final.teamA = match.winner;
        } else {
          newBracketData.final.teamB = match.winner;
        }
      }
    } else if (stage === 'final') {
      const match = newBracketData.final;
      match.scoreA = scoreA;
      match.scoreB = scoreB;
      match.winner = scoreA > scoreB ? match.teamA : match.teamB;
      match.champion = match.winner;
    }

    setBracketData(newBracketData);
    onUpdateBracket(newBracketData, 'playoffs');
    setEditingMatch(null);
  };

  const renderMatch = (match: BracketMatch, stage: string) => {
    const isEditing = editingMatch === match.id;
    
    return (
      <Card key={match.id} className="w-64 mb-4">
        <CardContent className="p-4">
          {match.teamA && match.teamB ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    {match.teamA.logo ? (
                      <img 
                        src={match.teamA.logo} 
                        alt={`${match.teamA.name} logo`}
                        className="w-6 h-6 object-cover rounded-full border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs ${match.teamA.logo ? 'hidden' : ''}`}>
                      ⚽
                    </div>
                  </div>
                  <span className={`font-medium truncate ${match.winner?.id === match.teamA.id ? 'text-green-700 font-bold' : ''}`}>
                    {match.teamA.name}
                  </span>
                </div>
                <span className="font-bold ml-2">{match.scoreA ?? '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    {match.teamB.logo ? (
                      <img 
                        src={match.teamB.logo} 
                        alt={`${match.teamB.name} logo`}
                        className="w-6 h-6 object-cover rounded-full border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs ${match.teamB.logo ? 'hidden' : ''}`}>
                      ⚽
                    </div>
                  </div>
                  <span className={`font-medium truncate ${match.winner?.id === match.teamB.id ? 'text-green-700 font-bold' : ''}`}>
                    {match.teamB.name}
                  </span>
                </div>
                <span className="font-bold ml-2">{match.scoreB ?? '-'}</span>
              </div>
              {isEditing ? (
                <MatchEditor 
                  match={match}
                  onSave={(scoreA, scoreB) => updateMatchResult(stage, match.id, scoreA, scoreB)}
                  onCancel={() => setEditingMatch(null)}
                />
              ) : (
                <div className="flex justify-between items-center mt-2">
                  {match.winner && (
                    <Badge className="bg-green-100 text-green-800 flex items-center space-x-1">
                      <div className="w-4 h-4 flex items-center justify-center">
                        {match.winner.logo ? (
                          <img 
                            src={match.winner.logo} 
                            alt={`${match.winner.name} logo`}
                            className="w-4 h-4 object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-xs">🏆</span>
                        )}
                      </div>
                      <span>Winner: {match.winner.name}</span>
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingMatch(match.id)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              TBD
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!isUnlocked) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Playoff Bracket Locked</h3>
          <p className="text-gray-500">Complete all group stage matches to unlock the playoff bracket.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold flex items-center space-x-2">
          <Trophy className="h-6 w-6" />
          <span>Playoff Bracket</span>
        </h3>
        {!bracket && (
          <Button onClick={initializeBracket}>
            Initialize Bracket
          </Button>
        )}
      </div>

      {bracketData.quarterfinals?.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quarterfinals */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quarterfinals</h4>
            {bracketData.quarterfinals.map((match: BracketMatch) => renderMatch(match, 'quarterfinals'))}
          </div>

          {/* Semifinals */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Semifinals</h4>
            {bracketData.semifinals.map((match: BracketMatch) => renderMatch(match, 'semifinals'))}
          </div>

          {/* Final */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Final</h4>
            {bracketData.final && renderMatch(bracketData.final, 'final')}
            {bracketData.final?.champion && (
              <Card className="w-64 mt-4 bg-yellow-50 border-yellow-200">
                <CardContent className="p-4 text-center">
                  <div className="relative">
                    <Trophy className="h-12 w-12 mx-auto mb-2 text-yellow-600" />
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 flex items-center justify-center">
                      {bracketData.final.champion.logo ? (
                        <img 
                          src={bracketData.final.champion.logo} 
                          alt={`${bracketData.final.champion.name} logo`}
                          className="w-6 h-6 object-cover rounded-full border border-yellow-400"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-yellow-800 text-xs font-bold">
                          🏆
                        </div>
                      )}
                    </div>
                  </div>
                  <h5 className="font-bold text-yellow-800">CHAMPION</h5>
                  <p className="font-semibold text-yellow-700">{bracketData.final.champion.name}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MatchEditor: React.FC<{
  match: BracketMatch;
  onSave: (scoreA: number, scoreB: number) => void;
  onCancel: () => void;
}> = ({ match, onSave, onCancel }) => {
  const [scoreA, setScoreA] = useState(match.scoreA?.toString() || '0');
  const [scoreB, setScoreB] = useState(match.scoreB?.toString() || '0');

  const handleSave = () => {
    onSave(parseInt(scoreA) || 0, parseInt(scoreB) || 0);
  };

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <Input
          type="number"
          value={scoreA}
          onChange={(e) => setScoreA(e.target.value)}
          className="w-16"
          min="0"
        />
        <Input
          type="number"
          value={scoreB}
          onChange={(e) => setScoreB(e.target.value)}
          className="w-16"
          min="0"
        />
      </div>
      <div className="flex space-x-2">
        <Button size="sm" onClick={handleSave}>Save</Button>
        <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
};
