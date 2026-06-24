// Mock Premier League data for 2025/26 season.
// Replace with a real API later (Football-Data.org or API-Football).

import arsenal from "@/assets/logos/arsenal.png";
import chelsea from "@/assets/logos/chelsea.png";
import liverpool from "@/assets/logos/liverpool.png";
import mancity from "@/assets/logos/manchester-city.png";
import manunited from "@/assets/logos/manchester-united.png";
import tottenham from "@/assets/logos/tottenham.png";
import wolves from "@/assets/logos/wolves-fc.png";

export type PLTeam = {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  stadium: string;
  manager: string;
  founded: number;
};

const placeholder = "/placeholder.svg";

export const PL_TEAMS: PLTeam[] = [
  { id: "ars", name: "Arsenal",            shortName: "Arsenal",      logo: arsenal,    stadium: "Emirates Stadium",     manager: "Mikel Arteta",      founded: 1886 },
  { id: "avl", name: "Aston Villa",        shortName: "Villa",        logo: placeholder, stadium: "Villa Park",          manager: "Unai Emery",        founded: 1874 },
  { id: "bou", name: "Bournemouth",        shortName: "Bournemouth",  logo: placeholder, stadium: "Vitality Stadium",    manager: "Andoni Iraola",     founded: 1899 },
  { id: "bre", name: "Brentford",          shortName: "Brentford",    logo: placeholder, stadium: "Gtech Community",     manager: "Keith Andrews",     founded: 1889 },
  { id: "bha", name: "Brighton",           shortName: "Brighton",     logo: placeholder, stadium: "Amex Stadium",        manager: "Fabian Hürzeler",   founded: 1901 },
  { id: "bur", name: "Burnley",            shortName: "Burnley",      logo: placeholder, stadium: "Turf Moor",           manager: "Scott Parker",      founded: 1882 },
  { id: "che", name: "Chelsea",            shortName: "Chelsea",      logo: chelsea,    stadium: "Stamford Bridge",      manager: "Enzo Maresca",      founded: 1905 },
  { id: "cry", name: "Crystal Palace",     shortName: "Palace",       logo: placeholder, stadium: "Selhurst Park",       manager: "Oliver Glasner",    founded: 1905 },
  { id: "eve", name: "Everton",            shortName: "Everton",      logo: placeholder, stadium: "Hill Dickinson",      manager: "David Moyes",       founded: 1878 },
  { id: "ful", name: "Fulham",             shortName: "Fulham",       logo: placeholder, stadium: "Craven Cottage",      manager: "Marco Silva",       founded: 1879 },
  { id: "lee", name: "Leeds United",       shortName: "Leeds",        logo: placeholder, stadium: "Elland Road",         manager: "Daniel Farke",      founded: 1919 },
  { id: "liv", name: "Liverpool",          shortName: "Liverpool",    logo: liverpool,  stadium: "Anfield",              manager: "Arne Slot",         founded: 1892 },
  { id: "mci", name: "Manchester City",    shortName: "Man City",     logo: mancity,    stadium: "Etihad Stadium",       manager: "Pep Guardiola",     founded: 1880 },
  { id: "mun", name: "Manchester United",  shortName: "Man Utd",      logo: manunited,  stadium: "Old Trafford",         manager: "Ruben Amorim",      founded: 1878 },
  { id: "new", name: "Newcastle United",   shortName: "Newcastle",    logo: placeholder, stadium: "St James' Park",      manager: "Eddie Howe",        founded: 1892 },
  { id: "not", name: "Nottingham Forest",  shortName: "Forest",       logo: placeholder, stadium: "City Ground",         manager: "Nuno Espírito Santo", founded: 1865 },
  { id: "sun", name: "Sunderland",         shortName: "Sunderland",   logo: placeholder, stadium: "Stadium of Light",    manager: "Régis Le Bris",     founded: 1879 },
  { id: "tot", name: "Tottenham",          shortName: "Spurs",        logo: tottenham,  stadium: "Tottenham Hotspur",    manager: "Thomas Frank",      founded: 1882 },
  { id: "whu", name: "West Ham",           shortName: "West Ham",     logo: placeholder, stadium: "London Stadium",      manager: "Nuno Espírito Santo", founded: 1895 },
  { id: "wol", name: "Wolves",             shortName: "Wolves",       logo: wolves,     stadium: "Molineux",             manager: "Vítor Pereira",     founded: 1877 },
];

export const teamById = (id: string) => PL_TEAMS.find(t => t.id === id)!;

export type StandingRow = {
  teamId: string;
  played: number; won: number; drawn: number; lost: number;
  gf: number; ga: number;
  form: ("W" | "D" | "L")[];
};

// Mock standings — illustrative, not real results.
export const PL_STANDINGS: StandingRow[] = [
  { teamId: "ars", played: 15, won: 11, drawn: 3, lost: 1, gf: 32, ga: 11, form: ["W","W","D","W","W"] },
  { teamId: "mci", played: 15, won: 10, drawn: 3, lost: 2, gf: 35, ga: 14, form: ["W","W","W","D","L"] },
  { teamId: "liv", played: 15, won: 10, drawn: 2, lost: 3, gf: 30, ga: 15, form: ["W","L","W","W","D"] },
  { teamId: "che", played: 15, won: 9,  drawn: 3, lost: 3, gf: 28, ga: 16, form: ["W","D","W","W","L"] },
  { teamId: "tot", played: 15, won: 8,  drawn: 4, lost: 3, gf: 27, ga: 18, form: ["D","W","W","L","W"] },
  { teamId: "new", played: 15, won: 8,  drawn: 3, lost: 4, gf: 24, ga: 17, form: ["W","W","L","D","W"] },
  { teamId: "avl", played: 15, won: 7,  drawn: 4, lost: 4, gf: 22, ga: 18, form: ["L","W","D","W","D"] },
  { teamId: "mun", played: 15, won: 7,  drawn: 3, lost: 5, gf: 21, ga: 20, form: ["W","L","W","L","D"] },
  { teamId: "bha", played: 15, won: 6,  drawn: 5, lost: 4, gf: 23, ga: 21, form: ["D","W","D","W","L"] },
  { teamId: "bou", played: 15, won: 6,  drawn: 4, lost: 5, gf: 19, ga: 19, form: ["W","D","L","W","D"] },
  { teamId: "cry", played: 15, won: 6,  drawn: 4, lost: 5, gf: 18, ga: 18, form: ["D","L","W","D","W"] },
  { teamId: "ful", played: 15, won: 6,  drawn: 3, lost: 6, gf: 20, ga: 22, form: ["L","W","L","W","D"] },
  { teamId: "bre", played: 15, won: 5,  drawn: 5, lost: 5, gf: 21, ga: 22, form: ["D","D","W","L","W"] },
  { teamId: "whu", played: 15, won: 5,  drawn: 4, lost: 6, gf: 18, ga: 22, form: ["L","D","W","L","W"] },
  { teamId: "eve", played: 15, won: 5,  drawn: 4, lost: 6, gf: 16, ga: 20, form: ["D","L","W","D","L"] },
  { teamId: "not", played: 15, won: 4,  drawn: 5, lost: 6, gf: 15, ga: 21, form: ["L","D","D","W","L"] },
  { teamId: "wol", played: 15, won: 4,  drawn: 3, lost: 8, gf: 16, ga: 26, form: ["L","L","W","D","L"] },
  { teamId: "lee", played: 15, won: 3,  drawn: 5, lost: 7, gf: 14, ga: 24, form: ["D","L","L","D","W"] },
  { teamId: "sun", played: 15, won: 3,  drawn: 4, lost: 8, gf: 13, ga: 25, form: ["L","D","L","L","W"] },
  { teamId: "bur", played: 15, won: 2,  drawn: 4, lost: 9, gf: 12, ga: 28, form: ["L","L","D","L","D"] },
];

export type Fixture = {
  id: string;
  homeId: string;
  awayId: string;
  kickoff: string; // ISO
  stadium: string;
  competition: string;
  status: "upcoming" | "live" | "finished";
  homeScore?: number;
  awayScore?: number;
  minute?: number;
};

const iso = (daysFromNow: number, hour = 15, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const PL_FIXTURES: Fixture[] = [
  // Live
  { id: "f-live-1", homeId: "ars", awayId: "tot", kickoff: iso(0, 12, 30), stadium: "Emirates Stadium", competition: "Premier League", status: "live", homeScore: 1, awayScore: 0, minute: 67 },
  // Upcoming
  { id: "f-up-1", homeId: "liv", awayId: "mci", kickoff: iso(2, 16, 30), stadium: "Anfield",            competition: "Premier League", status: "upcoming" },
  { id: "f-up-2", homeId: "che", awayId: "mun", kickoff: iso(3, 15, 0),  stadium: "Stamford Bridge",    competition: "Premier League", status: "upcoming" },
  { id: "f-up-3", homeId: "new", awayId: "avl", kickoff: iso(3, 17, 30), stadium: "St James' Park",     competition: "Premier League", status: "upcoming" },
  { id: "f-up-4", homeId: "bha", awayId: "whu", kickoff: iso(4, 15, 0),  stadium: "Amex Stadium",       competition: "Premier League", status: "upcoming" },
  { id: "f-up-5", homeId: "wol", awayId: "bur", kickoff: iso(4, 15, 0),  stadium: "Molineux",           competition: "Premier League", status: "upcoming" },
  { id: "f-up-6", homeId: "lee", awayId: "sun", kickoff: iso(5, 14, 0),  stadium: "Elland Road",        competition: "Premier League", status: "upcoming" },
  // Finished
  { id: "f-fin-1", homeId: "mci", awayId: "che", kickoff: iso(-3, 17, 30), stadium: "Etihad Stadium",     competition: "Premier League", status: "finished", homeScore: 2, awayScore: 1 },
  { id: "f-fin-2", homeId: "tot", awayId: "new", kickoff: iso(-4, 15, 0),  stadium: "Tottenham Hotspur",  competition: "Premier League", status: "finished", homeScore: 1, awayScore: 1 },
  { id: "f-fin-3", homeId: "liv", awayId: "bha", kickoff: iso(-5, 15, 0),  stadium: "Anfield",            competition: "Premier League", status: "finished", homeScore: 3, awayScore: 0 },
  { id: "f-fin-4", homeId: "mun", awayId: "ful", kickoff: iso(-6, 14, 0),  stadium: "Old Trafford",       competition: "Premier League", status: "finished", homeScore: 2, awayScore: 2 },
  { id: "f-fin-5", homeId: "avl", awayId: "bou", kickoff: iso(-7, 15, 0),  stadium: "Villa Park",         competition: "Premier League", status: "finished", homeScore: 1, awayScore: 0 },
];

export type MatchEvent = {
  minute: number;
  type: "goal" | "yellow" | "red" | "assist";
  teamId: string;
  player: string;
  assist?: string;
};

export const MATCH_EVENTS: Record<string, MatchEvent[]> = {
  "f-fin-1": [
    { minute: 12, type: "goal",   teamId: "mci", player: "Erling Haaland", assist: "Phil Foden" },
    { minute: 34, type: "yellow", teamId: "che", player: "Moisés Caicedo" },
    { minute: 58, type: "goal",   teamId: "che", player: "Cole Palmer" },
    { minute: 79, type: "goal",   teamId: "mci", player: "Phil Foden", assist: "Kevin De Bruyne" },
    { minute: 88, type: "red",    teamId: "che", player: "Levi Colwill" },
  ],
  "f-fin-2": [
    { minute: 22, type: "goal",   teamId: "tot", player: "Son Heung-min" },
    { minute: 71, type: "goal",   teamId: "new", player: "Alexander Isak", assist: "Anthony Gordon" },
    { minute: 80, type: "yellow", teamId: "tot", player: "Cristian Romero" },
  ],
  "f-fin-3": [
    { minute: 18, type: "goal",   teamId: "liv", player: "Mohamed Salah", assist: "Trent Alexander-Arnold" },
    { minute: 45, type: "goal",   teamId: "liv", player: "Darwin Núñez" },
    { minute: 67, type: "goal",   teamId: "liv", player: "Cody Gakpo", assist: "Mohamed Salah" },
  ],
  "f-fin-4": [
    { minute: 9,  type: "goal", teamId: "mun", player: "Bruno Fernandes" },
    { minute: 33, type: "goal", teamId: "ful", player: "Raúl Jiménez" },
    { minute: 61, type: "goal", teamId: "mun", player: "Marcus Rashford", assist: "Bruno Fernandes" },
    { minute: 89, type: "goal", teamId: "ful", player: "Andreas Pereira" },
  ],
  "f-fin-5": [
    { minute: 54, type: "goal", teamId: "avl", player: "Ollie Watkins", assist: "Morgan Rogers" },
  ],
};

export const computeStandings = () =>
  PL_STANDINGS
    .map(r => ({
      ...r,
      gd: r.gf - r.ga,
      points: r.won * 3 + r.drawn,
    }))
    .sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
