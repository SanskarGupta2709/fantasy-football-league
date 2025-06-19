
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Chrome } from 'lucide-react';

const Auth = () => {
  const { user, signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center space-x-2 mb-4">
            <span className="text-4xl animate-bounce filter drop-shadow-lg">⚽</span>
            <span className="text-2xl font-bold animate-pulse filter drop-shadow-lg">Fantasy Football League</span>
          </div>
          <p className="text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="w-full max-w-md mx-4 shadow-xl border-2 border-white/20">
        <CardHeader className="text-center bg-white/90 rounded-t-lg">
          <div className="flex items-center justify-center space-x-3 mb-6 p-6 bg-gradient-to-br from-green-400/20 via-blue-500/20 to-purple-600/20 rounded-lg border-2 border-gradient-to-r from-green-400 to-purple-600 relative overflow-hidden">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-blue-500/10 to-purple-600/10 animate-pulse"></div>
            
            {/* Football with enhanced animation */}
            <span 
              className="text-5xl relative z-10"
              style={{ 
                animation: 'footballBounce 2s ease-in-out infinite, footballGlow 3s ease-in-out infinite',
                filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.8)) drop-shadow(0 0 20px rgba(59, 130, 246, 0.6)) drop-shadow(0 0 30px rgba(147, 51, 234, 0.4))',
                textShadow: '0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(59, 130, 246, 0.6)'
              }}
            >
              ⚽
            </span>
            
            {/* Enhanced title with multiple gradients */}
            <span 
              className="text-2xl font-black relative z-10"
              style={{ 
                background: 'linear-gradient(45deg, #22c55e, #3b82f6, #8b5cf6, #f59e0b, #ef4444)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradientShift 4s ease-in-out infinite, textGlow 2s ease-in-out infinite',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                textShadow: '0 0 30px rgba(34, 197, 94, 0.5)'
              }}
            >
              Fantasy Football League
            </span>
            
            {/* Floating particles effect */}
            <div className="absolute top-2 left-4 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
            <div className="absolute bottom-3 right-6 w-1 h-1 bg-blue-500 rounded-full animate-pulse opacity-60"></div>
            <div className="absolute top-6 right-8 w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce opacity-70"></div>
          </div>
          <CardTitle className="text-2xl text-gray-800">Welcome Back!</CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to manage your fantasy football teams and track matches
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 bg-white/95 rounded-b-lg">
          <Button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            <Chrome className="h-5 w-5" />
            <span>Continue with Google</span>
          </Button>
          
          <div className="text-center text-sm text-gray-600 bg-gray-50/50 p-3 rounded-lg">
            Create and manage your fantasy football league with friends
          </div>
        </CardContent>
      </Card>
      
      <style jsx>{`
        @keyframes footballBounce {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-15px) rotate(90deg); }
          50% { transform: translateY(-25px) rotate(180deg); }
          75% { transform: translateY(-15px) rotate(270deg); }
        }
        
        @keyframes footballGlow {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(34, 197, 94, 0.8)) drop-shadow(0 0 20px rgba(59, 130, 246, 0.6)); }
          50% { filter: drop-shadow(0 0 20px rgba(34, 197, 94, 1)) drop-shadow(0 0 40px rgba(59, 130, 246, 0.8)) drop-shadow(0 0 60px rgba(147, 51, 234, 0.6)); }
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes textGlow {
          0%, 100% { text-shadow: 0 0 20px rgba(34, 197, 94, 0.5); }
          50% { text-shadow: 0 0 30px rgba(34, 197, 94, 0.8), 0 0 40px rgba(59, 130, 246, 0.6); }
        }
      `}</style>
    </div>
  );
};

export default Auth;
