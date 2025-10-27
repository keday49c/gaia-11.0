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

function Router({
  isAuthenticated,
  isAdmin,
  onLogin,
  onLogout,
}: {
  isAuthenticated: boolean;
  isAdmin: boolean;
  onLogin: () => void;
  onLogout: () => void;
}) {
  if (!isAuthenticated) {
    return <Login onLoginSuccess={onLogin} />;
  }

  if (isAdmin) {
    return <AdminPanel onLogout={onLogout} />;
  }

  return (
    <Switch>
      <Route path="/" component={() => <Dashboard onLogout={onLogout} />} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is already logged in on mount
  useEffect(() => {
    const adminMode = localStorage.getItem('gaia_admin') === 'true';
    const passwordSet = localStorage.getItem('gaia_password') !== null;

    if (adminMode) {
      setIsAdmin(true);
      setIsAuthenticated(true);
    } else if (passwordSet) {
      // Password is set, but user needs to log in
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = () => {
    const adminMode = localStorage.getItem('gaia_admin') === 'true';
    setIsAdmin(adminMode);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('gaia_admin');
    setIsAdmin(false);
    setIsAuthenticated(false);
  };

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router
            isAuthenticated={isAuthenticated}
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
