import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'wouter';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  component: React.ComponentType;
}

export function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center" data-testid="loading-auth">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}
