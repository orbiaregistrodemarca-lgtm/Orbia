import { Switch, Route } from "wouter";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Registro from "@/pages/Registro";
import Classify from "@/pages/Classify";
import Results from "@/pages/Results";
import BusquedaIMPI from "@/pages/BusquedaIMPI";
import Logo from "@/pages/Logo";
import Titular from "@/pages/Titular";
import Solicitud from "@/pages/Solicitud";
import Dashboard from "@/pages/Dashboard";
import EstudioDetalle from "@/pages/EstudioDetalle";
import NotFound from "@/pages/not-found";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-background font-sans">
            <Header />
            <main className="flex-grow">
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/login" component={Login} />
                <Route path="/registro" component={Registro} />
                <Route path="/dashboard">
                  {() => <ProtectedRoute component={Dashboard} />}
                </Route>
                <Route path="/tramite/:id">
                  {(params) => <ProtectedRoute component={() => <EstudioDetalle id={params.id} />} />}
                </Route>
                <Route path="/clasificar">
                  {() => <ProtectedRoute component={Classify} />}
                </Route>
                <Route path="/resultados">
                  {() => <ProtectedRoute component={Results} />}
                </Route>
                <Route path="/busqueda-impi">
                  {() => <ProtectedRoute component={BusquedaIMPI} />}
                </Route>
                <Route path="/logo">
                  {() => <ProtectedRoute component={Logo} />}
                </Route>
                <Route path="/titular">
                  {() => <ProtectedRoute component={Titular} />}
                </Route>
                <Route path="/solicitud">
                  {() => <ProtectedRoute component={Solicitud} />}
                </Route>
                <Route component={NotFound} />
              </Switch>
            </main>
            <Footer />
            <Toaster />
          </div>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
