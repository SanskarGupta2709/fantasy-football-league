import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Team {
  id: string;
  name: string;
  manager: string;
  logo: string;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  players: Player[];
}

export interface Player {
  id: string;
  name: string;
  jerseyNumber: number;
  position: 'Forward' | 'Midfielder' | 'Defender' | 'Goalkeeper';
  goals: number;
  assists: number;
}

export interface Match {
  id: string;
  teamAId: string;
  teamBId: string;
  teamAScore: number;
  teamBScore: number;
  date: string;
  round: string;
  goalScorers: GoalScorer[];
}

export interface GoalScorer {
  playerId: string;
  teamId: string;
  goals: number;
  assists: number;
}

export const useSupabaseLeagueData = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTeams = async () => {
    if (!user) return;

    try {
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('points', { ascending: false });

      if (teamsError) throw teamsError;

      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*');

      if (playersError) throw playersError;

      const teamsWithPlayers = teamsData.map(team => ({
        id: team.id,
        name: team.name,
        manager: team.manager,
        logo: team.logo,
        matchesPlayed: team.matches_played,
        wins: team.wins,
        draws: team.draws,
        losses: team.losses,
        goalsFor: team.goals_for,
        goalsAgainst: team.goals_against,
        points: team.points,
        players: playersData
          .filter(player => player.team_id === team.id)
          .map(player => ({
            id: player.id,
            name: player.name,
            jerseyNumber: player.jersey_number,
            position: player.position,
            goals: player.goals,
            assists: player.assists,
          }))
      }));

      setTeams(teamsWithPlayers);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error",
        description: "Failed to fetch teams",
        variant: "destructive"
      });
    }
  };

  const fetchMatches = async () => {
    if (!user) return;

    try {
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false });

      if (matchesError) throw matchesError;

      const { data: goalScorersData, error: goalScorersError } = await supabase
        .from('goal_scorers')
        .select('*');

      if (goalScorersError) throw goalScorersError;

      const matchesWithGoalScorers = matchesData.map(match => ({
        id: match.id,
        teamAId: match.team_a_id,
        teamBId: match.team_b_id,
        teamAScore: match.team_a_score,
        teamBScore: match.team_b_score,
        date: match.match_date,
        round: match.round,
        goalScorers: goalScorersData
          .filter(gs => gs.match_id === match.id)
          .map(gs => ({
            playerId: gs.player_id,
            teamId: gs.team_id,
            goals: gs.goals,
            assists: gs.assists,
          }))
      }));

      setMatches(matchesWithGoalScorers);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to fetch matches",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      Promise.all([fetchTeams(), fetchMatches()]).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  const addTeam = async (team: Omit<Team, 'id' | 'players'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          user_id: user.id,
          name: team.name,
          manager: team.manager,
          logo: team.logo,
          matches_played: team.matchesPlayed,
          wins: team.wins,
          draws: team.draws,
          losses: team.losses,
          goals_for: team.goalsFor,
          goals_against: team.goalsAgainst,
          points: team.points,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchTeams();
      toast({
        title: "Success",
        description: "Team added successfully",
      });
    } catch (error) {
      console.error('Error adding team:', error);
      toast({
        title: "Error",
        description: "Failed to add team",
        variant: "destructive"
      });
    }
  };

  const updateTeam = async (teamId: string, updates: Partial<Team>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('teams')
        .update({
          name: updates.name,
          manager: updates.manager,
          logo: updates.logo,
          matches_played: updates.matchesPlayed,
          wins: updates.wins,
          draws: updates.draws,
          losses: updates.losses,
          goals_for: updates.goalsFor,
          goals_against: updates.goalsAgainst,
          points: updates.points,
        })
        .eq('id', teamId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchTeams();
      toast({
        title: "Success",
        description: "Team updated successfully",
      });
    } catch (error) {
      console.error('Error updating team:', error);
      toast({
        title: "Error",
        description: "Failed to update team",
        variant: "destructive"
      });
    }
  };

  const deleteTeam = async (teamId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchTeams();
      await fetchMatches();
      toast({
        title: "Success",
        description: "Team deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: "Error",
        description: "Failed to delete team",
        variant: "destructive"
      });
    }
  };

  const addPlayer = async (teamId: string, player: Omit<Player, 'id'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('players')
        .insert({
          team_id: teamId,
          name: player.name,
          jersey_number: player.jerseyNumber,
          position: player.position,
          goals: player.goals,
          assists: player.assists,
        });

      if (error) throw error;

      await fetchTeams();
      toast({
        title: "Success",
        description: "Player added successfully",
      });
    } catch (error) {
      console.error('Error adding player:', error);
      toast({
        title: "Error",
        description: "Failed to add player",
        variant: "destructive"
      });
    }
  };

  const updatePlayer = async (teamId: string, playerId: string, updates: Partial<Player>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('players')
        .update({
          name: updates.name,
          jersey_number: updates.jerseyNumber,
          position: updates.position,
          goals: updates.goals,
          assists: updates.assists,
        })
        .eq('id', playerId);

      if (error) throw error;

      await fetchTeams();
      toast({
        title: "Success",
        description: "Player updated successfully",
      });
    } catch (error) {
      console.error('Error updating player:', error);
      toast({
        title: "Error",
        description: "Failed to update player",
        variant: "destructive"
      });
    }
  };

  const deletePlayer = async (playerId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) throw error;

      await fetchTeams();
      toast({
        title: "Success",
        description: "Player deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting player:', error);
      toast({
        title: "Error",
        description: "Failed to delete player",
        variant: "destructive"
      });
    }
  };

  const addMatch = async (match: Omit<Match, 'id'>) => {
    if (!user) return;

    try {
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .insert({
          user_id: user.id,
          team_a_id: match.teamAId,
          team_b_id: match.teamBId,
          team_a_score: match.teamAScore,
          team_b_score: match.teamBScore,
          match_date: match.date,
          round: match.round as 'Group Stage' | 'Round of 16' | 'Quarter Finals' | 'Semi Finals' | 'Final',
        })
        .select()
        .single();

      if (matchError) throw matchError;

      // Add goal scorers
      if (match.goalScorers.length > 0) {
        const goalScorersToInsert = match.goalScorers.map(gs => ({
          match_id: matchData.id,
          player_id: gs.playerId,
          team_id: gs.teamId,
          goals: gs.goals,
          assists: gs.assists,
        }));

        const { error: goalScorersError } = await supabase
          .from('goal_scorers')
          .insert(goalScorersToInsert);

        if (goalScorersError) throw goalScorersError;

        // Update player stats
        for (const gs of match.goalScorers) {
          const player = teams.flatMap(t => t.players).find(p => p.id === gs.playerId);
          if (player) {
            await supabase
              .from('players')
              .update({
                goals: player.goals + gs.goals,
                assists: player.assists + gs.assists,
              })
              .eq('id', gs.playerId);
          }
        }
      }

      // Update team statistics
      const teamA = teams.find(t => t.id === match.teamAId);
      const teamB = teams.find(t => t.id === match.teamBId);

      if (teamA) {
        const isWinA = match.teamAScore > match.teamBScore;
        const isDrawA = match.teamAScore === match.teamBScore;
        await supabase
          .from('teams')
          .update({
            matches_played: teamA.matchesPlayed + 1,
            wins: teamA.wins + (isWinA ? 1 : 0),
            draws: teamA.draws + (isDrawA ? 1 : 0),
            losses: teamA.losses + (!isWinA && !isDrawA ? 1 : 0),
            goals_for: teamA.goalsFor + match.teamAScore,
            goals_against: teamA.goalsAgainst + match.teamBScore,
            points: teamA.points + (isWinA ? 3 : isDrawA ? 1 : 0),
          })
          .eq('id', match.teamAId);
      }

      if (teamB) {
        const isWinB = match.teamBScore > match.teamAScore;
        const isDrawB = match.teamAScore === match.teamBScore;
        await supabase
          .from('teams')
          .update({
            matches_played: teamB.matchesPlayed + 1,
            wins: teamB.wins + (isWinB ? 1 : 0),
            draws: teamB.draws + (isDrawB ? 1 : 0),
            losses: teamB.losses + (!isWinB && !isDrawB ? 1 : 0),
            goals_for: teamB.goalsFor + match.teamBScore,
            goals_against: teamB.goalsAgainst + match.teamAScore,
            points: teamB.points + (isWinB ? 3 : isDrawB ? 1 : 0),
          })
          .eq('id', match.teamBId);
      }

      await fetchTeams();
      await fetchMatches();
      toast({
        title: "Success",
        description: "Match added successfully",
      });
    } catch (error) {
      console.error('Error adding match:', error);
      toast({
        title: "Error",
        description: "Failed to add match",
        variant: "destructive"
      });
    }
  };

  const getTopScorers = (): Array<Player & { teamName: string }> => {
    const allPlayers: Array<Player & { teamName: string }> = [];
    
    teams.forEach(team => {
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
      .slice(0, 5); // Changed from 10 to 5
  };

  const getSortedTeams = (): Team[] => {
    return [...teams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const aGD = a.goalsFor - a.goalsAgainst;
      const bGD = b.goalsFor - b.goalsAgainst;
      if (bGD !== aGD) return bGD - aGD;
      return b.goalsFor - a.goalsFor;
    });
  };

  const reset = async () => {
    if (!user) return;

    try {
      await supabase.from('goal_scorers').delete().neq('id', '');
      await supabase.from('matches').delete().eq('user_id', user.id);
      await supabase.from('players').delete().neq('id', '');
      await supabase.from('teams').delete().eq('user_id', user.id);

      await fetchTeams();
      await fetchMatches();
      toast({
        title: "Success",
        description: "League data reset successfully",
      });
    } catch (error) {
      console.error('Error resetting data:', error);
      toast({
        title: "Error",
        description: "Failed to reset league data",
        variant: "destructive"
      });
    }
  };

  return {
    teams,
    matches,
    loading,
    addTeam,
    updateTeam,
    deleteTeam,
    addPlayer,
    updatePlayer,
    deletePlayer,
    addMatch,
    getTopScorers,
    getSortedTeams,
    reset
  };
};
