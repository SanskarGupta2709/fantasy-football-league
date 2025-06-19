
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
          <div className="text-3xl animate-bounce mb-4">⚽</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="text-3xl animate-bounce">⚽</div>
            <div className="text-2xl">🏆</div>
          </div>
          <CardTitle className="text-2xl fancy-logo">Fantasy Football League</CardTitle>
          <CardDescription>
            Sign in to manage your fantasy football teams and track matches
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center space-x-2 football-gradient"
            size="lg"
          >
            <Chrome className="h-5 w-5" />
            <span>Continue with Google</span>
          </Button>
          
          <div className="text-center text-sm text-gray-600">
            Create and manage your fantasy football league with friends
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
