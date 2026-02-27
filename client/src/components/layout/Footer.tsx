import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="bg-secondary border-t border-border py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl text-primary mb-4">
              ORBIA
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Tu asistente inteligente para el registro de marcas en Mexico. Rapido, seguro y confiable.
            </p>
            <p className="text-xs font-medium text-primary">
              Powered by NOMINUS
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-white">Plataforma</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/clasificar" className="hover:text-primary transition-colors">Clasificar Marca</Link></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer">Precios</span></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer">Como funciona</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="hover:text-primary transition-colors cursor-pointer">Terminos y Condiciones</span></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer">Politica de Privacidad</span></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer">Aviso Legal</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-white">Contacto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>soporte@orbia.mx</li>
              <li>CDMX, Mexico</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/50 mt-8 pt-8 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} ORBIA. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
