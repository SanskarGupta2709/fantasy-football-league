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
  yellowCards: number;
  redCards: number;
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
  yellowCards: number;
  redCards: number;
}

export interface Fixture {
  id: string;
  teamAId: string;
  teamBId: string;
  scheduledDate: string;
  stage: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  matchId?: string;
}

export interface Bracket {
  id: string;
  bracketData: any;
  stage: string;
}

export const useSupabaseLeagueData = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [bracket, setBracket] = useState<Bracket | null>(null);
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
            yellowCards: player.yellow_cards,
            redCards: player.red_cards,
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
            yellowCards: gs.yellow_cards,
            redCards: gs.red_cards,
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

  const fetchFixtures = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('fixtures')
        .select('*')
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      const fixturesData = data.map(fixture => ({
        id: fixture.id,
        teamAId: fixture.team_a_id,
        teamBId: fixture.team_b_id,
        scheduledDate: fixture.scheduled_date,
        stage: fixture.stage,
        status: fixture.status as 'Upcoming' | 'Ongoing' | 'Completed',
        matchId: fixture.match_id,
      }));

      setFixtures(fixturesData);
    } catch (error) {
      console.error('Error fetching fixtures:', error);
      toast({
        title: "Error",
        description: "Failed to fetch fixtures",
        variant: "destructive"
      });
    }
  };

  const fetchBracket = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tournament_bracket')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setBracket({
          id: data.id,
          bracketData: data.bracket_data,
          stage: data.stage,
        });
      }
    } catch (error) {
      console.error('Error fetching bracket:', error);
    }
  };

  useEffect(() => {
    if (user) {
      Promise.all([fetchTeams(), fetchMatches(), fetchFixtures(), fetchBracket()]).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  const addFixture = async (fixture: Omit<Fixture, 'id'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('fixtures')
        .insert({
          user_id: user.id,
          team_a_id: fixture.teamAId,
          team_b_id: fixture.teamBId,
          scheduled_date: fixture.scheduledDate,
          stage: fixture.stage,
          status: fixture.status,
        });

      if (error) throw error;

      await fetchFixtures();
      toast({
        title: "Success",
        description: "Fixture added successfully",
      });
    } catch (error) {
      console.error('Error adding fixture:', error);
      toast({
        title: "Error",
        description: "Failed to add fixture",
        variant: "destructive"
      });
    }
  };

  const updateFixtureStatus = async (fixtureId: string, matchId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('fixtures')
        .update({
          status: 'Completed',
          match_id: matchId,
        })
        .eq('id', fixtureId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchFixtures();
    } catch (error) {
      console.error('Error updating fixture status:', error);
    }
  };

  const updateBracket = async (bracketData: any, stage: string) => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from('tournament_bracket')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('tournament_bracket')
          .update({
            bracket_data: bracketData,
            stage: stage,
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tournament_bracket')
          .insert({
            user_id: user.id,
            bracket_data: bracketData,
            stage: stage,
          });

        if (error) throw error;
      }

      await fetchBracket();
      toast({
        title: "Success",
        description: "Bracket updated successfully",
      });
    } catch (error) {
      console.error('Error updating bracket:', error);
      toast({
        title: "Error",
        description: "Failed to update bracket",
        variant: "destructive"
      });
    }
  };

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

  const updateMatch = async (matchId: string, updates: Partial<Match>) => {
    if (!user) return;

    try {
      const originalMatch = matches.find(m => m.id === matchId);
      if (!originalMatch) throw new Error('Match not found');

      // First, reverse the original match stats
      if (originalMatch.goalScorers.length > 0) {
        for (const gs of originalMatch.goalScorers) {
          const player = teams.flatMap(t => t.players).find(p => p.id === gs.playerId);
          if (player) {
            await supabase
              .from('players')
              .update({
                goals: Math.max(0, player.goals - gs.goals),
                assists: Math.max(0, player.assists - gs.assists),
                yellow_cards: Math.max(0, player.yellowCards - gs.yellowCards),
                red_cards: Math.max(0, player.redCards - gs.redCards),
              })
              .eq('id', gs.playerId);
          }
        }
      }

      // Reverse team statistics for original match
      const originalTeamA = teams.find(t => t.id === originalMatch.teamAId);
      const originalTeamB = teams.find(t => t.id === originalMatch.teamBId);

      if (originalTeamA) {
        const wasWinA = originalMatch.teamAScore > originalMatch.teamBScore;
        const wasDrawA = originalMatch.teamAScore === originalMatch.teamBScore;
        await supabase
          .from('teams')
          .update({
            matches_played: Math.max(0, originalTeamA.matchesPlayed - 1),
            wins: Math.max(0, originalTeamA.wins - (wasWinA ? 1 : 0)),
            draws: Math.max(0, originalTeamA.draws - (wasDrawA ? 1 : 0)),
            losses: Math.max(0, originalTeamA.losses - (!wasWinA && !wasDrawA ? 1 : 0)),
            goals_for: Math.max(0, originalTeamA.goalsFor - originalMatch.teamAScore),
            goals_against: Math.max(0, originalTeamA.goalsAgainst - originalMatch.teamBScore),
            points: Math.max(0, originalTeamA.points - (wasWinA ? 3 : wasDrawA ? 1 : 0)),
          })
          .eq('id', originalMatch.teamAId);
      }

      if (originalTeamB) {
        const wasWinB = originalMatch.teamBScore > originalMatch.teamAScore;
        const wasDrawB = originalMatch.teamAScore === originalMatch.teamBScore;
        await supabase
          .from('teams')
          .update({
            matches_played: Math.max(0, originalTeamB.matchesPlayed - 1),
            wins: Math.max(0, originalTeamB.wins - (wasWinB ? 1 : 0)),
            draws: Math.max(0, originalTeamB.draws - (wasDrawB ? 1 : 0)),
            losses: Math.max(0, originalTeamB.losses - (!wasWinB && !wasDrawB ? 1 : 0)),
            goals_for: Math.max(0, originalTeamB.goalsFor - originalMatch.teamBScore),
            goals_against: Math.max(0, originalTeamB.goalsAgainst - originalMatch.teamAScore),
            points: Math.max(0, originalTeamB.points - (wasWinB ? 3 : wasDrawB ? 1 : 0)),
          })
          .eq('id', originalMatch.teamBId);
      }

      // Update the match record
      const { error: matchError } = await supabase
        .from('matches')
        .update({
          team_a_id: updates.teamAId || originalMatch.teamAId,
          team_b_id: updates.teamBId || originalMatch.teamBId,
          team_a_score: updates.teamAScore ?? originalMatch.teamAScore,
          team_b_score: updates.teamBScore ?? originalMatch.teamBScore,
          match_date: updates.date || originalMatch.date,
          round: (updates.round || originalMatch.round) as 'Group Stage' | 'Round of 16' | 'Quarter Finals' | 'Semi Finals' | 'Final',
        })
        .eq('id', matchId)
        .eq('user_id', user.id);

      if (matchError) throw matchError;

      // Delete old goal scorers
      await supabase
        .from('goal_scorers')
        .delete()
        .eq('match_id', matchId);

      // Add new goal scorers
      if (updates.goalScorers && updates.goalScorers.length > 0) {
        const goalScorersToInsert = updates.goalScorers.map(gs => ({
          match_id: matchId,
          player_id: gs.playerId,
          team_id: gs.teamId,
          goals: gs.goals,
          assists: gs.assists,
          yellow_cards: gs.yellowCards,
          red_cards: gs.redCards,
        }));

        const { error: goalScorersError } = await supabase
          .from('goal_scorers')
          .insert(goalScorersToInsert);

        if (goalScorersError) throw goalScorersError;

        // Update player stats with new values
        for (const gs of updates.goalScorers) {
          const player = teams.flatMap(t => t.players).find(p => p.id === gs.playerId);
          if (player) {
            await supabase
              .from('players')
              .update({
                goals: player.goals + gs.goals,
                assists: player.assists + gs.assists,
                yellow_cards: player.yellowCards + gs.yellowCards,
                red_cards: player.redCards + gs.redCards,
              })
              .eq('id', gs.playerId);
          }
        }
      }

      // Update team statistics with new values
      const updatedMatch = { ...originalMatch, ...updates };
      const teamA = teams.find(t => t.id === updatedMatch.teamAId);
      const teamB = teams.find(t => t.id === updatedMatch.teamBId);

      if (teamA) {
        const isWinA = updatedMatch.teamAScore > updatedMatch.teamBScore;
        const isDrawA = updatedMatch.teamAScore === updatedMatch.teamBScore;
        await supabase
          .from('teams')
          .update({
            matches_played: teamA.matchesPlayed + 1,
            wins: teamA.wins + (isWinA ? 1 : 0),
            draws: teamA.draws + (isDrawA ? 1 : 0),
            losses: teamA.losses + (!isWinA && !isDrawA ? 1 : 0),
            goals_for: teamA.goalsFor + updatedMatch.teamAScore,
            goals_against: teamA.goalsAgainst + updatedMatch.teamBScore,
            points: teamA.points + (isWinA ? 3 : isDrawA ? 1 : 0),
          })
          .eq('id', updatedMatch.teamAId);
      }

      if (teamB) {
        const isWinB = updatedMatch.teamBScore > updatedMatch.teamAScore;
        const isDrawB = updatedMatch.teamAScore === updatedMatch.teamBScore;
        await supabase
          .from('teams')
          .update({
            matches_played: teamB.matchesPlayed + 1,
            wins: teamB.wins + (isWinB ? 1 : 0),
            draws: teamB.draws + (isDrawB ? 1 : 0),
            losses: teamB.losses + (!isWinB && !isDrawB ? 1 : 0),
            goals_for: teamB.goalsFor + updatedMatch.teamBScore,
            goals_against: teamB.goalsAgainst + updatedMatch.teamAScore,
            points: teamB.points + (isWinB ? 3 : isDrawB ? 1 : 0),
          })
          .eq('id', updatedMatch.teamBId);
      }

      await fetchTeams();
      await fetchMatches();
      toast({
        title: "Success",
        description: "Match updated successfully",
      });
    } catch (error) {
      console.error('Error updating match:', error);
      toast({
        title: "Error",
        description: "Failed to update match",
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

      // Add goal scorers with card data
      if (match.goalScorers.length > 0) {
        const goalScorersToInsert = match.goalScorers.map(gs => ({
          match_id: matchData.id,
          player_id: gs.playerId,
          team_id: gs.teamId,
          goals: gs.goals,
          assists: gs.assists,
          yellow_cards: gs.yellowCards,
          red_cards: gs.redCards,
        }));

        const { error: goalScorersError } = await supabase
          .from('goal_scorers')
          .insert(goalScorersToInsert);

        if (goalScorersError) throw goalScorersError;

        // Update player stats including cards
        for (const gs of match.goalScorers) {
          const player = teams.flatMap(t => t.players).find(p => p.id === gs.playerId);
          if (player) {
            await supabase
              .from('players')
              .update({
                goals: player.goals + gs.goals,
                assists: player.assists + gs.assists,
                yellow_cards: player.yellowCards + gs.yellowCards,
                red_cards: player.redCards + gs.redCards,
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

      // Check if this match corresponds to a fixture and update it
      const correspondingFixture = fixtures.find(f => 
        f.teamAId === match.teamAId && 
        f.teamBId === match.teamBId && 
        f.status === 'Upcoming'
      );

      if (correspondingFixture) {
        await updateFixtureStatus(correspondingFixture.id, matchData.id);
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

  const isPlayoffUnlocked = (): boolean => {
    const groupStageFixtures = fixtures.filter(f => f.stage === 'Group Stage');
    return groupStageFixtures.length > 0 && groupStageFixtures.every(f => f.status === 'Completed');
  };

  const resetTournament = async () => {
    if (!user) return;

    try {
      // Delete tournament-specific data
      await supabase.from('fixtures').delete().eq('user_id', user.id);
      await supabase.from('tournament_bracket').delete().eq('user_id', user.id);
      
      // Note: We don't delete matches and goal_scorers as they are part of league history
      // Only tournament-specific fixtures and brackets are removed

      await fetchFixtures();
      await fetchBracket();
      toast({
        title: "Tournament Reset Successfully",
        description: "Tournament data has been cleared. Please select teams to begin a new tournament.",
      });
    } catch (error) {
      console.error('Error resetting tournament:', error);
      toast({
        title: "Error",
        description: "Failed to reset tournament data",
        variant: "destructive"
      });
    }
  };

  const deleteMatch = async (matchId: string) => {
    if (!user) return;

    try {
      const matchToDelete = matches.find(m => m.id === matchId);
      if (!matchToDelete) throw new Error('Match not found');

      // First, reverse the match stats from players
      if (matchToDelete.goalScorers.length > 0) {
        for (const gs of matchToDelete.goalScorers) {
          const player = teams.flatMap(t => t.players).find(p => p.id === gs.playerId);
          if (player) {
            await supabase
              .from('players')
              .update({
                goals: Math.max(0, player.goals - gs.goals),
                assists: Math.max(0, player.assists - gs.assists),
                yellow_cards: Math.max(0, player.yellowCards - gs.yellowCards),
                red_cards: Math.max(0, player.redCards - gs.redCards),
              })
              .eq('id', gs.playerId);
          }
        }
      }

      // Reverse team statistics
      const teamA = teams.find(t => t.id === matchToDelete.teamAId);
      const teamB = teams.find(t => t.id === matchToDelete.teamBId);

      if (teamA) {
        const wasWinA = matchToDelete.teamAScore > matchToDelete.teamBScore;
        const wasDrawA = matchToDelete.teamAScore === matchToDelete.teamBScore;
        await supabase
          .from('teams')
          .update({
            matches_played: Math.max(0, teamA.matchesPlayed - 1),
            wins: Math.max(0, teamA.wins - (wasWinA ? 1 : 0)),
            draws: Math.max(0, teamA.draws - (wasDrawA ? 1 : 0)),
            losses: Math.max(0, teamA.losses - (!wasWinA && !wasDrawA ? 1 : 0)),
            goals_for: Math.max(0, teamA.goalsFor - matchToDelete.teamAScore),
            goals_against: Math.max(0, teamA.goalsAgainst - matchToDelete.teamBScore),
            points: Math.max(0, teamA.points - (wasWinA ? 3 : wasDrawA ? 1 : 0)),
          })
          .eq('id', matchToDelete.teamAId);
      }

      if (teamB) {
        const wasWinB = matchToDelete.teamBScore > matchToDelete.teamAScore;
        const wasDrawB = matchToDelete.teamAScore === matchToDelete.teamBScore;
        await supabase
          .from('teams')
          .update({
            matches_played: Math.max(0, teamB.matchesPlayed - 1),
            wins: Math.max(0, teamB.wins - (wasWinB ? 1 : 0)),
            draws: Math.max(0, teamB.draws - (wasDrawB ? 1 : 0)),
            losses: Math.max(0, teamB.losses - (!wasWinB && !wasDrawB ? 1 : 0)),
            goals_for: Math.max(0, teamB.goalsFor - matchToDelete.teamBScore),
            goals_against: Math.max(0, teamB.goalsAgainst - matchToDelete.teamAScore),
            points: Math.max(0, teamB.points - (wasWinB ? 3 : wasDrawB ? 1 : 0)),
          })
          .eq('id', matchToDelete.teamBId);
      }

      // Delete goal scorers first
      await supabase
        .from('goal_scorers')
        .delete()
        .eq('match_id', matchId);

      // Delete the match
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update any corresponding fixture status back to 'Upcoming'
      const correspondingFixture = fixtures.find(f => f.matchId === matchId);
      if (correspondingFixture) {
        await supabase
          .from('fixtures')
          .update({
            status: 'Upcoming',
            match_id: null,
          })
          .eq('id', correspondingFixture.id);
      }

      await fetchTeams();
      await fetchMatches();
      await fetchFixtures();
      toast({
        title: "Success",
        description: "Match deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting match:', error);
      toast({
        title: "Error",
        description: "Failed to delete match",
        variant: "destructive"
      });
    }
  };

  const reset = async () => {
    if (!user) return;

    try {
      await supabase.from('goal_scorers').delete().neq('id', '');
      await supabase.from('matches').delete().eq('user_id', user.id);
      await supabase.from('fixtures').delete().eq('user_id', user.id);
      await supabase.from('tournament_bracket').delete().eq('user_id', user.id);
      await supabase.from('players').delete().neq('id', '');
      await supabase.from('teams').delete().eq('user_id', user.id);

      await fetchTeams();
      await fetchMatches();
      await fetchFixtures();
      await fetchBracket();
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
    fixtures,
    bracket,
    loading,
    addTeam,
    updateTeam,
    deleteTeam,
    addPlayer,
    updatePlayer,
    deletePlayer,
    addMatch,
    updateMatch,
    deleteMatch,
    addFixture,
    updateBracket,
    getTopScorers,
    getSortedTeams,
    isPlayoffUnlocked,
    reset,
    resetTournament
  };
};
