import React, { useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './router/AppRouter';
import { ThemeProvider } from './components/layout/ThemeProvider';
import { authService } from '@/services/auth.service';

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const initAuth = async () => {
      if (authService.getToken()) {
        await authService.getProfile();
      }
    };
    initAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Toaster />
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;