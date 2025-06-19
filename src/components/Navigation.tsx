
import React from 'react';
import { Button } from "@/components/ui/button";
import { BarChart3, Users, UserPlus, Calendar, Trophy, Target, LogOut, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { signOut } = useAuth();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'players', label: 'Players', icon: UserPlus },
    { id: 'tournament', label: 'Tournament Mode', icon: Zap },
    { id: 'fixtures', label: 'Fixtures', icon: Calendar },
    { id: 'matches', label: 'Matches', icon: Target },
    { id: 'bracket', label: 'Playoffs', icon: Trophy },
    { id: 'scorers', label: 'Top Scorers', icon: Target },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center space-x-2">
              <span className="text-2xl animate-bounce">⚽</span>
              <span className="animate-pulse">Fantasy Football League</span>
            </h1>
            <div className="flex space-x-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    onClick={() => onTabChange(tab.id)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={() => signOut()}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};
