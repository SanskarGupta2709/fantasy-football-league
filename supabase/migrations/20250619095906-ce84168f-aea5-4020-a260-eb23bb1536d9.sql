
-- Add fixtures table for scheduling matches
CREATE TABLE public.fixtures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  team_a_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  team_b_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  stage TEXT NOT NULL DEFAULT 'Group Stage',
  status TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Ongoing', 'Completed')),
  match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add card tracking columns to goal_scorers table
ALTER TABLE public.goal_scorers 
ADD COLUMN yellow_cards INTEGER NOT NULL DEFAULT 0,
ADD COLUMN red_cards INTEGER NOT NULL DEFAULT 0;

-- Add card tracking columns to players table for cumulative stats
ALTER TABLE public.players 
ADD COLUMN yellow_cards INTEGER NOT NULL DEFAULT 0,
ADD COLUMN red_cards INTEGER NOT NULL DEFAULT 0;

-- Add tournament bracket table
CREATE TABLE public.tournament_bracket (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  bracket_data JSONB NOT NULL DEFAULT '{}',
  stage TEXT NOT NULL DEFAULT 'group',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for fixtures
ALTER TABLE public.fixtures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fixtures" ON public.fixtures
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fixtures" ON public.fixtures
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fixtures" ON public.fixtures
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fixtures" ON public.fixtures
  FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS for tournament bracket
ALTER TABLE public.tournament_bracket ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bracket" ON public.tournament_bracket
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bracket" ON public.tournament_bracket
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bracket" ON public.tournament_bracket
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bracket" ON public.tournament_bracket
  FOR DELETE USING (auth.uid() = user_id);
