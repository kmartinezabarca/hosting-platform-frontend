import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/react-query';
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { TicketChatProvider } from "./context/TicketChatContext.jsx";
import TicketChatDockPortal from "./components/tickets/TicketChatDockPortal.jsx";
import { ToastProvider } from "@/components/ToastProvider";
import { initializeCsrf } from './lib/bootstrap';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

initializeCsrf().then(() => {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AuthProvider>
              <TicketChatProvider>
                <ToastProvider>
                  <App />
                </ToastProvider>
                <TicketChatDockPortal />
              </TicketChatProvider>
            </AuthProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </GoogleOAuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  );
});