import React from 'react';
import { Button } from "@/components/ui/button";
import { BarChart3, Users, UserPlus, Calendar, Trophy, Target, LogOut, Zap, Table, Newspaper, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  // Extract user's display name from Google auth
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Friend';
  const firstName = userName.split(' ')[0];

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'leaderboard', label: 'League Table', icon: Table },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'players', label: 'Players', icon: UserPlus },
    { id: 'tournament', label: 'Tournament Mode', icon: Zap },
    { id: 'matches', label: 'Matches', icon: Target },
    { id: 'news', label: 'Football News', icon: Newspaper },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 sm:space-x-8 overflow-hidden">
            <div className="flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-green-100 to-blue-100 px-2 sm:px-4 py-2 rounded-lg border-2 border-gradient-to-r from-green-300 to-blue-300 shadow-lg shrink-0">
              <span 
                className="text-2xl sm:text-3xl relative"
                style={{ 
                  animation: 'bounce 2s ease-in-out infinite',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3)) drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))',
                  textShadow: '0 0 10px rgba(34, 197, 94, 0.8)'
                }}
              >
                ⚽
              </span>
              <h1 
                className="text-sm sm:text-xl font-black relative"
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
            <div className="hidden lg:flex space-x-1 overflow-x-auto">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    onClick={() => onTabChange(tab.id)}
                    className="flex items-center space-x-2 whitespace-nowrap"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{tab.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            <div className="text-xs sm:text-sm font-semibold text-gray-700 bg-gradient-to-r from-green-50 to-blue-50 px-2 sm:px-3 py-2 rounded-lg border border-green-200 max-w-[100px] sm:max-w-[120px] md:max-w-none overflow-hidden">
              <span className="truncate block sm:hidden">Hi, {firstName}! 👋</span>
              <span className="hidden sm:block truncate">Hi, {userName}! 👋</span>
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
        
        {/* Mobile navigation tabs */}
        <div className="lg:hidden pb-3 overflow-x-auto">
          <div className="flex space-x-1 min-w-max">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => onTabChange(tab.id)}
                  className="flex items-center space-x-2 whitespace-nowrap text-xs"
                >
                  <Icon className="h-3 w-3" />
                  <span>{tab.label}</span>
                </Button>
              );
            })}
          </div>
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
