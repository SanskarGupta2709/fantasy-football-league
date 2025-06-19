
export interface Player {
  id: string;
  name: string;
  jerseyNumber: number;
  position: string;
  goals: number;
  assists: number;
}

export interface Team {
  id: string;
  name: string;
  manager: string;
  logo: string;
  players: Player[];
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface Match {
  id: string;
  teamAId: string;
  teamBId: string;
  teamAScore: number;
  teamBScore: number;
  date: string;
  round: string;
  goalScorers: Array<{
    playerId: string;
    teamId: string;
    goals: number;
    assists: number;
  }>;
}

export interface LeagueData {
  teams: Team[];
  matches: Match[];
}

const STORAGE_KEY = 'fantasy-football-league';

export const saveData = (data: LeagueData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const loadData = (): LeagueData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return getInitialData();
};

export const resetData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

const getInitialData = (): LeagueData => {
  return {
    teams: [
      {
        id: '1',
        name: 'Manchester United',
        manager: 'Erik ten Hag',
        logo: '🔴',
        players: [
          { id: '1-1', name: 'Marcus Rashford', jerseyNumber: 10, position: 'Forward', goals: 5, assists: 2 },
          { id: '1-2', name: 'Bruno Fernandes', jerseyNumber: 8, position: 'Midfielder', goals: 3, assists: 4 },
          { id: '1-3', name: 'Harry Maguire', jerseyNumber: 5, position: 'Defender', goals: 1, assists: 0 },
        ],
        matchesPlayed: 3,
        wins: 2,
        draws: 1,
        losses: 0,
        goalsFor: 8,
        goalsAgainst: 3,
        points: 7
      },
      {
        id: '2',
        name: 'Liverpool FC',
        manager: 'Jürgen Klopp',
        logo: '🔴',
        players: [
          { id: '2-1', name: 'Mohamed Salah', jerseyNumber: 11, position: 'Forward', goals: 7, assists: 3 },
          { id: '2-2', name: 'Sadio Mané', jerseyNumber: 10, position: 'Forward', goals: 4, assists: 2 },
          { id: '2-3', name: 'Virgil van Dijk', jerseyNumber: 4, position: 'Defender', goals: 2, assists: 1 },
        ],
        matchesPlayed: 3,
        wins: 2,
        draws: 0,
        losses: 1,
        goalsFor: 9,
        goalsAgainst: 4,
        points: 6
      },
      {
        id: '3',
        name: 'Chelsea FC',
        manager: 'Frank Lampard',
        logo: '🔵',
        players: [
          { id: '3-1', name: 'Kai Havertz', jerseyNumber: 29, position: 'Forward', goals: 3, assists: 2 },
          { id: '3-2', name: 'Mason Mount', jerseyNumber: 19, position: 'Midfielder', goals: 2, assists: 3 },
          { id: '3-3', name: 'Thiago Silva', jerseyNumber: 6, position: 'Defender', goals: 1, assists: 0 },
        ],
        matchesPlayed: 3,
        wins: 1,
        draws: 2,
        losses: 0,
        goalsFor: 5,
        goalsAgainst: 3,
        points: 5
      }
    ],
    matches: [
      {
        id: '1',
        teamAId: '1',
        teamBId: '2',
        teamAScore: 3,
        teamBScore: 2,
        date: '2024-06-15',
        round: 'Group Stage',
        goalScorers: [
          { playerId: '1-1', teamId: '1', goals: 2, assists: 0 },
          { playerId: '1-2', teamId: '1', goals: 1, assists: 1 },
          { playerId: '2-1', teamId: '2', goals: 2, assists: 0 }
        ]
      },
      {
        id: '2',
        teamAId: '2',
        teamBId: '3',
        teamAScore: 2,
        teamBScore: 1,
        date: '2024-06-16',
        round: 'Group Stage',
        goalScorers: [
          { playerId: '2-1', teamId: '2', goals: 1, assists: 1 },
          { playerId: '2-2', teamId: '2', goals: 1, assists: 0 },
          { playerId: '3-1', teamId: '3', goals: 1, assists: 0 }
        ]
      }
    ]
  };
};
