
import React from 'react';
import { Button } from "@/components/ui/button";
import { BarChart3, Users, UserPlus, Calendar, Trophy, Target, LogOut, Zap, Table } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { signOut } = useAuth();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'leaderboard', label: 'League Table', icon: Table },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'players', label: 'Players', icon: UserPlus },
    { id: 'tournament', label: 'Tournament Mode', icon: Zap },
    { id: 'matches', label: 'Matches', icon: Target },
    { id: 'scorers', label: 'Top Scorers', icon: Target },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3 bg-gradient-to-r from-green-100 to-blue-100 px-4 py-2 rounded-lg border-2 border-gradient-to-r from-green-300 to-blue-300 shadow-lg">
              <span 
                className="text-3xl relative"
                style={{ 
                  animation: 'bounce 2s ease-in-out infinite',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3)) drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))',
                  textShadow: '0 0 10px rgba(34, 197, 94, 0.8)'
                }}
              >
                ⚽
              </span>
              <h1 
                className="text-xl font-black relative"
                style={{ 
                  background: 'linear-gradient(45deg, #22c55e, #3b82f6, #8b5cf6)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'gradient-shift 3s ease-in-out infinite',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
                  textShadow: '0 0 20px rgba(34, 197, 94, 0.4)'
                }}
              >
                Fantasy Football League
              </h1>
            </div>
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

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `
      }} />
    </nav>
  );
};
