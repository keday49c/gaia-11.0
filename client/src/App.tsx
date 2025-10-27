import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import Campaigns from "./pages/Campaigns";
import Reports from "./pages/Reports";

function Router({
  isLoggedIn,
  isAdmin,
  onLogin,
  onLogout,
}: {
  isLoggedIn: boolean;
  isAdmin: boolean;
  onLogin: () => void;
  onLogout: () => void;
}) {
  if (!isLoggedIn) {
    return <Login onLoginSuccess={onLogin} />;
  }

  if (isAdmin) {
    return <AdminPanel onLogout={onLogout} />;
  }

  return (
    <Switch>
      <Route path="/" component={() => <Dashboard onLogout={onLogout} />} />
      <Route path="/campanhas" component={() => <Campaigns />} />
      <Route path="/relatorio/:id" component={({ id }: any) => <Reports campaignId={id} />} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminMode = localStorage.getItem("gaia_admin") === "true";
    const token = localStorage.getItem("gaia_token");

    if (adminMode) {
      setIsAdmin(true);
      setIsLoggedIn(true);
    } else if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    const adminMode = localStorage.getItem("gaia_admin") === "true";
    setIsAdmin(adminMode);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("gaia_admin");
    localStorage.removeItem("gaia_token");
    setIsAdmin(false);
    setIsLoggedIn(false);
  };

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router
            isLoggedIn={isLoggedIn}
            isAdmin={isAdmin}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
