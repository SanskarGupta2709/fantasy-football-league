
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
          <div className="flex items-center justify-center space-x-2 mb-4 p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg border border-blue-200">
            <span 
              className="text-4xl animate-bounce filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" 
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
            >
              ⚽
            </span>
            <span 
              className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse filter drop-shadow-lg"
              style={{ 
                WebkitTextStroke: '1px rgba(0,0,0,0.1)',
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
              }}
            >
              Fantasy Football League
            </span>
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
    </div>
  );
};

export default Auth;
