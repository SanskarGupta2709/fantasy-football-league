
import { Button } from "@/components/ui/button";
import { Trophy, Users, Calendar, Target } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Trophy },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'matches', label: 'Matches', icon: Calendar },
    { id: 'scorers', label: 'Top Scorers', icon: Target },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-green-200 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="text-3xl animate-bounce">⚽</div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-xl font-bold fancy-logo">
              🏆 Fantasy Football League 🏆
            </h1>
          </div>
          
          <div className="flex space-x-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeTab === id ? "default" : "ghost"}
                size="sm"
                onClick={() => onTabChange(id)}
                className={`flex items-center space-x-2 transition-all duration-300 ${
                  activeTab === id 
                    ? 'football-gradient text-white shadow-lg transform scale-105' 
                    : 'hover:bg-green-100 hover:shadow-md'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
