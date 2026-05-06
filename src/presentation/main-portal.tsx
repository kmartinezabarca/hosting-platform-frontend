import '@shared/utils/i18n';

import { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppPortal from '@presentation/components/features/AppPortal'
import { initSentry } from '@shared/utils/sentry';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@shared/utils/react-query';
import { ThemeProvider } from '@presentation/components/features/context/ThemeContext'
import { TicketChatProvider } from '@application/context/TicketChatContext';
import TicketChatDockPortal from '@presentation/components/features/tickets/TicketChatDockPortal';
import { ToastProvider } from "@presentation/components/features/ToastProvider";
import { initializeCsrf } from '@presentation/components/features/lib/bootstrap';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@application/context/AuthContext';
import { NotificationProvider } from '@application/context/NotificationContext';
import ErrorBoundary from '@presentation/components/features/ErrorBoundary';
import { initWebVitals } from '@shared/utils/webVitals';

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