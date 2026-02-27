import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { MASCOT_URL } from '@/components/mascot/OrbiaMascot';

export function Header() {
  const [location, navigate] = useLocation();
  const { user, loading, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-secondary/90 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-2xl text-white hover:text-primary transition-colors">
          <div className="w-9 h-9 rounded-full bg-background/50 flex items-center justify-center overflow-hidden">
            <img src={MASCOT_URL} alt="ORBIA" className="w-8 h-8 object-contain" />
          </div>
          ORBIA
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/" 
            className={`text-sm font-medium hover:text-primary transition-colors ${location === '/' ? 'text-primary' : 'text-white/70'}`}
          >
            Inicio
          </Link>
          <Link 
            href="/clasificar" 
            className={`text-sm font-medium hover:text-primary transition-colors ${location === '/clasificar' ? 'text-primary' : 'text-white/70'}`}
          >
            Clasificar Marca
          </Link>
          <Link 
            href="/dashboard" 
            className={`text-sm font-medium hover:text-primary transition-colors ${location === '/dashboard' ? 'text-primary' : 'text-white/70'}`}
          >
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {!loading && user ? (
            <>
              <span className="text-sm text-white/60 hidden sm:inline" data-testid="text-user-email">
                {user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white/60 hover:text-red-400 hover:bg-white/5"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Cerrar sesion</span>
              </Button>
            </>
          ) : !loading ? (
            <Link href="/login">
              <Button variant="default" className="bg-primary hover:bg-primary/90 text-background font-semibold shadow-lg shadow-primary/25" data-testid="button-goto-login">
                Iniciar Sesion
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
