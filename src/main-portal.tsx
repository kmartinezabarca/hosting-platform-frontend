import '@/lib/i18n';

import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppPortal from './AppPortal'
import { initSentry } from '@/lib/sentry';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/react-query';
import { ThemeProvider } from './context/ThemeContext'
import { TicketChatProvider } from "./context/TicketChatContext";
import TicketChatDockPortal from "./components/tickets/TicketChatDockPortal";
import { ToastProvider } from "@/components/ToastProvider";
import { initializeCsrf } from './lib/bootstrap';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { initWebVitals } from '@/lib/webVitals';

initSentry();

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const renderApp = () => {
  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
      <Suspense fallback={null}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <ToastProvider>
                <Router>
                  <AuthProvider>
                    <NotificationProvider>
                      <TicketChatProvider>
                        <AppPortal />
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
      </Suspense>
    </ErrorBoundary>
  );
};

initializeCsrf()
  .then(() => renderApp())
  .catch(() => renderApp());

initWebVitals();