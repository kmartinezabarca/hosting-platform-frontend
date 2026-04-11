import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/react-query';
import { ThemeProvider } from './context/ThemeContext.jsx'
import { TicketChatProvider } from "./context/TicketChatContext.jsx";
import TicketChatDockPortal from "./components/tickets/TicketChatDockPortal.jsx";
import { ToastProvider } from "@/components/ToastProvider";
import { initializeCsrf } from './lib/bootstrap';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import ErrorBoundary from '@/components/ErrorBoundary';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const renderApp = () => {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <ToastProvider>
                <Router>
                  <AuthProvider>
                    <NotificationProvider>
                      <TicketChatProvider>
                        <App />
                        <TicketChatDockPortal />
                      </TicketChatProvider>
                    </NotificationProvider>
                  </AuthProvider>
                </Router>
                <ReactQueryDevtools initialIsOpen={false} />
              </ToastProvider>
            </GoogleOAuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>
  );
};

initializeCsrf()
  .then(() => {
    console.log('CSRF inicializado correctamente');
    renderApp();
  })
  .catch((error) => {
    console.warn('No se pudo inicializar CSRF, pero continuando con la app:', error);
    renderApp();
  });


