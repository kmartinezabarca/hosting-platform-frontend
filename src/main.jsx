import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/react-query';
import { AuthProvider } from './context/AuthContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { TicketChatProvider } from "./context/TicketChatContext.jsx";
import TicketChatDockPortal from "./components/tickets/TicketChatDockPortal.jsx";
import { ToastProvider } from "@/components/ToastProvider";
import NotificationToast, { useToast } from "./components/NotificationToast.jsx";
import { initializeCsrf } from './lib/bootstrap';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Componente para mostrar los toasts de notificaciones
function NotificationToastContainer() {
  const { toasts, removeToast } = useToast();
  
  return (
    <NotificationToast 
      toasts={toasts} 
      onRemoveToast={removeToast}
      onToastClick={(toast) => console.log('Toast clicked:', toast)}
    />
  );
}

initializeCsrf().then(() => {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AuthProvider>
              <NotificationProvider>
                <TicketChatProvider>
                  <ToastProvider>
                    <App />
                    <NotificationToastContainer />
                  </ToastProvider>
                  <TicketChatDockPortal />
                </TicketChatProvider>
              </NotificationProvider>
            </AuthProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </GoogleOAuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  );
});

