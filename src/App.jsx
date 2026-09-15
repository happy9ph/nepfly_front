import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Chatbot from "./components/chatbot/Chatbot.jsx";
import ScrollToTop from "./components/ui/ScrollToTop.jsx";

// Découpage du code par page : chaque page n'est téléchargée que lorsque
// l'utilisateur y accède, au lieu de tout charger d'un bloc au premier
// chargement du site — réduit sensiblement le poids initial.
const Home = lazy(() => import("./pages/Home.jsx"));
const PartnerDashboard = lazy(() => import("./pages/PartnerDashboard.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));
const Onboarding = lazy(() => import("./pages/Onboarding.jsx"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail.jsx"));
const CourseDetail = lazy(() => import("./pages/CourseDetail.jsx"));
const PartnerDetail = lazy(() => import("./pages/PartnerDetail.jsx"));
const SignIn = lazy(() => import("./pages/auth/SignIn.jsx"));
const Register = lazy(() => import("./pages/auth/Register.jsx"));
const VerifyOtp = lazy(() => import("./pages/auth/VerifyOtp.jsx"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword.jsx"));
const NewPassword = lazy(() => import("./pages/auth/NewPassword.jsx"));
const OAuthCallback = lazy(() => import("./pages/auth/OAuthCallback.jsx"));
const Payment = lazy(() => import("./pages/Payment.jsx"));
const TeamTraining = lazy(() => import("./pages/TeamTraining.jsx"));
const InterpretationDetail = lazy(() => import("./pages/InterpretationDetail.jsx"));
const ShoppingDetail = lazy(() => import("./pages/ShoppingDetail.jsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.jsx"));
const TermsOfService = lazy(() => import("./pages/TermsOfService.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

function RouteFallback() {
  // Écran neutre pendant le chargement du code de la page — très bref
  // (quelques dizaines de Ko), mais évite un flash de page blanche.
  return <div className="min-h-screen bg-cream" />;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[500] focus:bg-ink focus:text-cream focus:px-4 focus:py-2 focus:rounded-full focus:text-sm"
      >
        Aller au contenu principal
      </a>
      <Suspense fallback={<RouteFallback />}>
        <div id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<PartnerDashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/cours/:id" element={<CourseDetail />} />
          <Route path="/partenaires/:slug" element={<PartnerDetail />} />

          {/* Authentification : pages dédiées, plus de modals */}
          <Route path="/connexion" element={<SignIn />} />
          <Route path="/creer-un-compte" element={<Register />} />
          <Route path="/verifier" element={<VerifyOtp />} />
          <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
          <Route path="/nouveau-mot-de-passe" element={<NewPassword />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/paiement/:offerId" element={<Payment />} />
          <Route path="/formation-equipe" element={<TeamTraining />} />
          <Route path="/interpretation" element={<InterpretationDetail />} />
          <Route path="/shopping" element={<ShoppingDetail />} />
          <Route path="/bienvenue" element={<Onboarding />} />

          {/* Pages légales */}
          <Route path="/confidentialite" element={<PrivacyPolicy />} />
          <Route path="/conditions" element={<TermsOfService />} />

          {/* Toute route non reconnue */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </div>
      </Suspense>
      <Chatbot />
    </>
  );
}
