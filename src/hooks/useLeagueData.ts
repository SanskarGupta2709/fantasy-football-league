
import { useState, useEffect } from 'react';
import { LeagueData, Team, Match, Player, loadData, saveData, resetData } from '@/utils/storage';

export const useLeagueData = () => {
  const [data, setData] = useState<LeagueData>(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  const addTeam = (team: Omit<Team, 'id'>) => {
    const newTeam: Team = {
      ...team,
      id: Date.now().toString(),
    };
    setData(prev => ({
      ...prev,
      teams: [...prev.teams, newTeam]
    }));
  };

  const updateTeam = (teamId: string, updates: Partial<Team>) => {
    setData(prev => ({
      ...prev,
      teams: prev.teams.map(team => 
        team.id === teamId ? { ...team, ...updates } : team
      )
    }));
  };

  const deleteTeam = (teamId: string) => {
    setData(prev => ({
      ...prev,
      teams: prev.teams.filter(team => team.id !== teamId),
      matches: prev.matches.filter(match => 
        match.teamAId !== teamId && match.teamBId !== teamId
      )
    }));
  };

  const addPlayer = (teamId: string, player: Omit<Player, 'id'>) => {
    const newPlayer: Player = {
      ...player,
      id: `${teamId}-${Date.now()}`,
    };
    
    setData(prev => ({
      ...prev,
      teams: prev.teams.map(team => 
        team.id === teamId 
          ? { ...team, players: [...team.players, newPlayer] }
          : team
      )
    }));
  };

  const updatePlayer = (teamId: string, playerId: string, updates: Partial<Player>) => {
    setData(prev => ({
      ...prev,
      teams: prev.teams.map(team => 
        team.id === teamId 
          ? {
              ...team,
              players: team.players.map(player =>
                player.id === playerId ? { ...player, ...updates } : player
              )
            }
          : team
      )
    }));
  };

  const addMatch = (match: Omit<Match, 'id'>) => {
    const newMatch: Match = {
      ...match,
      id: Date.now().toString(),
    };

    // Update team statistics
    setData(prev => {
      const updatedTeams = prev.teams.map(team => {
        if (team.id === match.teamAId) {
          const isWin = match.teamAScore > match.teamBScore;
          const isDraw = match.teamAScore === match.teamBScore;
          return {
            ...team,
            matchesPlayed: team.matchesPlayed + 1,
            wins: team.wins + (isWin ? 1 : 0),
            draws: team.draws + (isDraw ? 1 : 0),
            losses: team.losses + (!isWin && !isDraw ? 1 : 0),
            goalsFor: team.goalsFor + match.teamAScore,
            goalsAgainst: team.goalsAgainst + match.teamBScore,
            points: team.points + (isWin ? 3 : isDraw ? 1 : 0)
          };
        }
        if (team.id === match.teamBId) {
          const isWin = match.teamBScore > match.teamAScore;
          const isDraw = match.teamAScore === match.teamBScore;
          return {
            ...team,
            matchesPlayed: team.matchesPlayed + 1,
            wins: team.wins + (isWin ? 1 : 0),
            draws: team.draws + (isDraw ? 1 : 0),
            losses: team.losses + (!isWin && !isDraw ? 1 : 0),
            goalsFor: team.goalsFor + match.teamBScore,
            goalsAgainst: team.goalsAgainst + match.teamAScore,
            points: team.points + (isWin ? 3 : isDraw ? 1 : 0)
          };
        }
        return team;
      });

      // Update player statistics
      const updatedTeamsWithPlayerStats = updatedTeams.map(team => ({
        ...team,
        players: team.players.map(player => {
          const goalScorer = match.goalScorers.find(gs => gs.playerId === player.id);
          if (goalScorer) {
            return {
              ...player,
              goals: player.goals + goalScorer.goals,
              assists: player.assists + goalScorer.assists
            };
          }
          return player;
        })
      }));

      return {
        ...prev,
        teams: updatedTeamsWithPlayerStats,
        matches: [...prev.matches, newMatch]
      };
    });
  };

  const getTopScorers = (): Array<Player & { teamName: string }> => {
    const allPlayers: Array<Player & { teamName: string }> = [];
    
    data.teams.forEach(team => {
      team.players.forEach(player => {
        allPlayers.push({
          ...player,
          teamName: team.name
        });
      });
    });

    return allPlayers
      .filter(player => player.goals > 0)
      .sort((a, b) => {
        if (b.goals !== a.goals) return b.goals - a.goals;
        return b.assists - a.assists;
      })
      .slice(0, 10);
  };

  const getSortedTeams = (): Team[] => {
    return [...data.teams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const aGD = a.goalsFor - a.goalsAgainst;
      const bGD = b.goalsFor - b.goalsAgainst;
      if (bGD !== aGD) return bGD - aGD;
      return b.goalsFor - a.goalsFor;
    });
  };

  const reset = () => {
    resetData();
    setData(loadData());
  };

  return {
    teams: data.teams,
    matches: data.matches,
    addTeam,
    updateTeam,
    deleteTeam,
    addPlayer,
    updatePlayer,
    addMatch,
    getTopScorers,
    getSortedTeams,
    reset
  };
};
