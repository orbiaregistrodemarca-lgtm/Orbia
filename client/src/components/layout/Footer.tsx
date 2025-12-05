import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="bg-white border-t py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/">
              <a className="flex items-center gap-2 font-display font-bold text-xl text-primary mb-4">
                ORBIA
              </a>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Tu asistente inteligente para el registro de marcas en México. Rápido, seguro y confiable.
            </p>
            <p className="text-xs font-medium text-secondary">
              Powered by NOMINUS
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-primary">Plataforma</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/clasificar"><a className="hover:text-primary">Clasificar Marca</a></Link></li>
              <li><a href="#" className="hover:text-primary">Precios</a></li>
              <li><a href="#" className="hover:text-primary">Cómo funciona</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-primary">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Términos y Condiciones</a></li>
              <li><a href="#" className="hover:text-primary">Política de Privacidad</a></li>
              <li><a href="#" className="hover:text-primary">Aviso Legal</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-primary">Contacto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>soporte@orbia.mx</li>
              <li>CDMX, México</li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} ORBIA. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
