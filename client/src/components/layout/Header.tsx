import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';

const ORBIA_MASCOT_URL = 'https://res.cloudinary.com/dz964kisp/image/upload/v1764954057/orbia_mascot_sz8nnb.png';

export function Header() {
  const [location, navigate] = useLocation();
  const { user, loading, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-2xl text-primary hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center overflow-hidden">
            <img src={ORBIA_MASCOT_URL} alt="ORBIA" className="w-8 h-8 object-contain" />
          </div>
          ORBIA
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/" 
            className={`text-sm font-medium hover:text-primary transition-colors ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            Inicio
          </Link>
          <Link 
            href="/clasificar" 
            className={`text-sm font-medium hover:text-primary transition-colors ${location === '/clasificar' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            Clasificar Marca
          </Link>
          <span className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">
            Precios
          </span>
          <span className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">
            Recursos
          </span>
        </nav>

        <div className="flex items-center gap-3">
          {!loading && user ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline" data-testid="text-user-email">
                {user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Cerrar sesion</span>
              </Button>
            </>
          ) : !loading ? (
            <Link href="/login">
              <Button variant="default" className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all" data-testid="button-goto-login">
                Iniciar Sesion
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
