import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

export function Header() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-2xl text-primary hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white text-xs">
            O
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

        <div className="flex items-center gap-4">
          <Link href="/clasificar">
            <Button variant="default" className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all">
              Analizar mi marca
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
