// Real Football Club Logos and Auto-Assignment System

interface FootballClub {
  name: string;
  logo: string;
  aliases?: string[];
}

// Real football club logos (using logo URLs)
export const REAL_FOOTBALL_CLUBS: FootballClub[] = [
  // Premier League
  { name: "Arsenal", logo: "/src/assets/logos/arsenal.png", aliases: ["arsenal fc", "the gunners"] },
  { name: "Chelsea", logo: "/src/assets/logos/chelsea.png", aliases: ["chelsea fc", "the blues"] },
  { name: "Liverpool", logo: "/src/assets/logos/liverpool.png", aliases: ["liverpool fc", "the reds"] },
  { name: "Manchester City", logo: "/src/assets/logos/manchester-city.png", aliases: ["man city", "city"] },
  { name: "Manchester United", logo: "/src/assets/logos/manchester-united.png", aliases: ["man united", "united", "red devils"] },
  { name: "Tottenham", logo: "/src/assets/logos/tottenham.png", aliases: ["tottenham hotspur", "spurs"] },
  
  // La Liga
  { name: "Real Madrid", logo: "/src/assets/logos/real-madrid.png", aliases: ["real", "los blancos"] },
  { name: "Barcelona", logo: "/src/assets/logos/barcelona.png", aliases: ["barca", "fcb"] },
  { name: "Atletico Madrid", logo: "/src/assets/logos/atletico-madrid.png", aliases: ["atletico", "atleti"] },
  
  // Serie A
  { name: "Juventus", logo: "/src/assets/logos/juventus.png", aliases: ["juve"] },
  { name: "AC Milan", logo: "/src/assets/logos/ac-milan.png", aliases: ["milan", "ac milano"] },
  { name: "Inter Milan", logo: "/src/assets/logos/inter-milan.png", aliases: ["inter", "internazionale"] },
  
  // Bundesliga
  { name: "Bayern Munich", logo: "/src/assets/logos/bayern.png", aliases: ["bayern", "fc bayern"] },
  { name: "Borussia Dortmund", logo: "/src/assets/logos/dortmund.png", aliases: ["dortmund", "bvb"] },
  
  // Ligue 1
  { name: "Paris Saint-Germain", logo: "/src/assets/logos/psg.png", aliases: ["psg", "paris"] },
  
  // Custom Fantasy Logos
  { name: "Dragons FC", logo: "/src/assets/logos/dragons-fc.png" },
  { name: "Lions United", logo: "/src/assets/logos/lions-united.png" },
  { name: "Eagles FC", logo: "/src/assets/logos/eagles-fc.png" },
  { name: "Lightning FC", logo: "/src/assets/logos/lightning-fc.png" },
  { name: "Knights FC", logo: "/src/assets/logos/knights-fc.png" },
  { name: "Wolves FC", logo: "/src/assets/logos/wolves-fc.png" },
  { name: "Stars FC", logo: "/src/assets/logos/stars-fc.png" },
  { name: "Phoenix FC", logo: "/src/assets/logos/phoenix-fc.png" },
];

/**
 * Auto-assign real club logo based on team name
 */
export const getClubLogo = (teamName: string): string | null => {
  const normalizedName = teamName.toLowerCase().trim();
  
  const club = REAL_FOOTBALL_CLUBS.find(club => {
    const clubName = club.name.toLowerCase();
    const aliases = club.aliases || [];
    
    // Exact match
    if (clubName === normalizedName) return true;
    
    // Check aliases
    if (aliases.some(alias => alias === normalizedName)) return true;
    
    // Partial match (club name contains team name or vice versa)
    if (clubName.includes(normalizedName) || normalizedName.includes(clubName)) return true;
    
    return false;
  });
  
  return club ? club.logo : null;
};

/**
 * Get all available club options for dropdown
 */
export const getClubOptions = () => {
  return REAL_FOOTBALL_CLUBS.map(club => ({
    name: club.name,
    logo: club.logo,
  }));
};

/**
 * Check if a logo URL is a real club logo
 */
export const isRealClubLogo = (logoUrl: string): boolean => {
  return REAL_FOOTBALL_CLUBS.some(club => club.logo === logoUrl);
};

/**
 * Get club name from logo URL
 */
export const getClubNameFromLogo = (logoUrl: string): string | null => {
  const club = REAL_FOOTBALL_CLUBS.find(club => club.logo === logoUrl);
  return club ? club.name : null;
};