import { Switch, Route } from "wouter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Home from "@/pages/Home";
import Classify from "@/pages/Classify";
import Results from "@/pages/Results";
import NotFound from "@/pages/not-found";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col bg-background font-sans">
          <Header />
          <main className="flex-grow">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/clasificar" component={Classify} />
              <Route path="/resultados" component={Results} />
              <Route component={NotFound} />
            </Switch>
          </main>
          <Footer />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
