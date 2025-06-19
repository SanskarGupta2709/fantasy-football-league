
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
    <nav className="bg-white/80 backdrop-blur-sm border-b border-green-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="text-2xl">⚽</div>
            <h1 className="text-xl font-bold text-green-800">Fantasy Football League</h1>
          </div>
          
          <div className="flex space-x-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeTab === id ? "default" : "ghost"}
                size="sm"
                onClick={() => onTabChange(id)}
                className={`flex items-center space-x-2 ${
                  activeTab === id 
                    ? 'football-gradient text-white' 
                    : 'hover:bg-green-100'
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
