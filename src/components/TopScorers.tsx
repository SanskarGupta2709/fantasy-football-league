
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Award, Trophy } from "lucide-react";
import { Player } from "@/utils/storage";

interface TopScorersProps {
  topScorers: Array<Player & { teamName: string }>;
}

export const TopScorers = ({ topScorers }: TopScorersProps) => {
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500 trophy-shine" />;
      case 2:
        return <Award className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Target className="h-6 w-6 text-orange-500" />;
      default:
        return <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">{position}</div>;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getPositionBadge = (position: string) => {
    const colors = {
      'Goalkeeper': 'bg-purple-100 text-purple-800',
      'Defender': 'bg-blue-100 text-blue-800',
      'Midfielder': 'bg-green-100 text-green-800',
      'Forward': 'bg-red-100 text-red-800'
    };
    return colors[position as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-6 w-6 text-green-500" />
            <span>Top Goal Scorers</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topScorers.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No goals scored yet. Play some matches to see the top scorers!</p>
              </div>
            ) : (
              topScorers.map((player, index) => {
                const position = index + 1;
                
                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md ${getPositionColor(position)}`}
                  >
                    <div className="flex items-center space-x-4">
                      {getPositionIcon(position)}
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-800">
                          #{player.jerseyNumber}
                        </div>
                        
                        <div>
                          <p className="font-semibold text-lg">{player.name}</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-gray-600">{player.teamName}</p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPositionBadge(player.position)}`}>
                              {player.position}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="flex items-center space-x-1">
                          <span className="text-2xl">⚽</span>
                          <span className="text-2xl font-bold text-green-600 goal-bounce">{player.goals}</span>
                        </div>
                        <p className="text-sm text-gray-600">Goals</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center space-x-1">
                          <span className="text-xl">🅰️</span>
                          <span className="text-xl font-bold text-blue-600">{player.assists}</span>
                        </div>
                        <p className="text-sm text-gray-600">Assists</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center space-x-1">
                          <span className="text-xl">⭐</span>
                          <span className="text-xl font-bold text-purple-600">{player.goals + player.assists}</span>
                        </div>
                        <p className="text-sm text-gray-600">Total</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Player Statistics Summary */}
      {topScorers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Target className="h-8 w-8" />
                <div>
                  <p className="text-sm opacity-90">Top Scorer</p>
                  <p className="text-lg font-bold">{topScorers[0]?.name}</p>
                  <p className="text-sm opacity-90">{topScorers[0]?.goals} goals</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Award className="h-8 w-8" />
                <div>
                  <p className="text-sm opacity-90">Most Assists</p>
                  <p className="text-lg font-bold">
                    {[...topScorers].sort((a, b) => b.assists - a.assists)[0]?.name || 'N/A'}
                  </p>
                  <p className="text-sm opacity-90">
                    {[...topScorers].sort((a, b) => b.assists - a.assists)[0]?.assists || 0} assists
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Trophy className="h-8 w-8" />
                <div>
                  <p className="text-sm opacity-90">Total Goals</p>
                  <p className="text-2xl font-bold">
                    {topScorers.reduce((sum, player) => sum + player.goals, 0)}
                  </p>
                  <p className="text-sm opacity-90">in league</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
