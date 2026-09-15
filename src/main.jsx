import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import * as Sentry from "@sentry/react";
import App from "./App.jsx";
import "./index.css";
import { UserProvider } from "./context/Usercontext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { ProgressProvider } from "./context/ProgressContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import ErrorBoundary from "./components/ui/ErrorBoundary.jsx";
import NetworkStatusBanner from "./components/ui/NetworkStatusBanner.jsx";

// Supervision des erreurs — n'a aucun effet tant que VITE_SENTRY_DSN n'est
// pas renseigné dans .env (comportement par défaut, pas besoin de compte
// pour développer). Créez un projet gratuit sur sentry.io quand vous serez
// prêt à surveiller les erreurs en production.
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              <ProgressProvider>
                <UserProvider>
                  <NetworkStatusBanner />
                  <App />
                </UserProvider>
              </ProgressProvider>
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
