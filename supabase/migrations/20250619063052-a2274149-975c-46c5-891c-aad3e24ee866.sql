
-- Create enum types for positions and match rounds
CREATE TYPE player_position AS ENUM ('Forward', 'Midfielder', 'Defender', 'Goalkeeper');
CREATE TYPE match_round AS ENUM ('Group Stage', 'Round of 16', 'Quarter Finals', 'Semi Finals', 'Final');

-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  manager TEXT NOT NULL,
  logo TEXT NOT NULL,
  matches_played INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  goals_for INTEGER NOT NULL DEFAULT 0,
  goals_against INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  jersey_number INTEGER NOT NULL,
  position player_position NOT NULL,
  goals INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, jersey_number)
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  team_a_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  team_b_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  team_a_score INTEGER NOT NULL DEFAULT 0,
  team_b_score INTEGER NOT NULL DEFAULT 0,
  match_date DATE NOT NULL,
  round match_round NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create goal scorers table for match details
CREATE TABLE public.goal_scorers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  goals INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_scorers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for teams
CREATE POLICY "Users can view their own teams" ON public.teams
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own teams" ON public.teams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own teams" ON public.teams
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own teams" ON public.teams
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for players
CREATE POLICY "Users can view players of their teams" ON public.players
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teams 
      WHERE teams.id = players.team_id AND teams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create players for their teams" ON public.players
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams 
      WHERE teams.id = players.team_id AND teams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update players of their teams" ON public.players
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.teams 
      WHERE teams.id = players.team_id AND teams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete players of their teams" ON public.players
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.teams 
      WHERE teams.id = players.team_id AND teams.user_id = auth.uid()
    )
  );

-- Create RLS policies for matches
CREATE POLICY "Users can view their own matches" ON public.matches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own matches" ON public.matches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own matches" ON public.matches
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own matches" ON public.matches
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for goal scorers
CREATE POLICY "Users can view goal scorers of their matches" ON public.goal_scorers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE matches.id = goal_scorers.match_id AND matches.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create goal scorers for their matches" ON public.goal_scorers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE matches.id = goal_scorers.match_id AND matches.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update goal scorers of their matches" ON public.goal_scorers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE matches.id = goal_scorers.match_id AND matches.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete goal scorers of their matches" ON public.goal_scorers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE matches.id = goal_scorers.match_id AND matches.user_id = auth.uid()
    )
  );
