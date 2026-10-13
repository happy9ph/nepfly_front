import { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, Navigate, useParams, useLocation, useNavigationType } from "react-router-dom";
import Chatbot from "./components/chatbot/Chatbot.jsx";
import ScrollToTop from "./components/ui/ScrollToTop.jsx";
import BrandLoader from "./components/ui/BrandLoader.jsx";
import { HeadManager } from "./components/ui/HeadManager.jsx";

// Découpage du code par page : chaque page n'est téléchargée que lorsque
// l'utilisateur y accède, au lieu de tout charger d'un bloc au premier
// chargement du site — réduit sensiblement le poids initial.
const Home = lazy(() => import("./pages/Home.jsx"));
const PartnerDashboard = lazy(() => import("./pages/PartnerDashboard.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));
const AgentDashboard = lazy(() => import("./pages/AgentDashboard.jsx"));
const Onboarding = lazy(() => import("./pages/Onboarding.jsx"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail.jsx"));
const HServicePage = lazy(() => import("./pages/HServicePage.jsx"));
const LearningHub = lazy(() => import("./pages/learning/LearningHub.jsx"));
const LearningCourse = lazy(() => import("./pages/learning/CourseDetail.jsx"));
const CoursePlayer = lazy(() => import("./pages/learning/CoursePlayer.jsx"));
const InPersonRegistration = lazy(() => import("./pages/learning/InPersonRegistration.jsx"));
const PlansPage = lazy(() => import("./pages/learning/PlansPage.jsx"));
const Checkout = lazy(() => import("./pages/learning/Checkout.jsx"));
const MySubscription = lazy(() => import("./pages/learning/MySubscription.jsx"));
const UstudyPage = lazy(() => import("./pages/learning/UstudyPage.jsx"));
const PartnerDetail = lazy(() => import("./pages/PartnerDetail.jsx"));
const SignIn = lazy(() => import("./pages/auth/SignIn.jsx"));
const Register = lazy(() => import("./pages/auth/Register.jsx"));
const VerifyOtp = lazy(() => import("./pages/auth/VerifyOtp.jsx"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword.jsx"));
const NewPassword = lazy(() => import("./pages/auth/NewPassword.jsx"));
const OAuthCallback = lazy(() => import("./pages/auth/OAuthCallback.jsx"));
const Payment = lazy(() => import("./pages/Payment.jsx"));
const InterpretationDetail = lazy(() => import("./pages/InterpretationDetail.jsx"));
const ShoppingDetail = lazy(() => import("./pages/ShoppingDetail.jsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.jsx"));
const TermsOfService = lazy(() => import("./pages/TermsOfService.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

function RouteFallback() {
  // Écran neutre pendant le chargement du code de la page — très bref
  // (quelques dizaines de Ko), mais évite un flash de page blanche. Le
  // véritable écran de marque (BrandLoader) est géré séparément, à chaque
  // changement de route, pour rester visible assez longtemps pour être vu.
  return <div className="min-h-screen bg-cream" />;
}

// Rejoue le petit "ta-dum" de marque (lettre H animée, façon écran de
// chargement Netflix) à chaque redirection vers une nouvelle page — pas
// seulement quand le code doit vraiment être téléchargé. On force un temps
// d'affichage minimum (900ms) pour que l'animation se joue vraiment, plutôt
// que de dépendre du temps de chargement réel (souvent quasi instantané une
// fois les fichiers en cache). Le tout premier chargement de la home gère
// son propre écran (voir Home.jsx), donc on l'ignore ici.
function RouteTransitionLoader() {
  const location = useLocation();
  const navType = useNavigationType();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Ignore le tout premier montage (chargement initial de la home, qui a
    // son propre écran de marque) — seuls les changements de route suivants
    // rejouent cette animation.
    if (!window.__hcRouteSeen) {
      window.__hcRouteSeen = true;
      return;
    }
    // Retour / avance dans l'historique : pas d'animation. La personne veut
    // retrouver sa page tout de suite, exactement là où elle l'a laissée.
    if (navType === "POP") return;
    setShow(true);
    const timer = setTimeout(() => setShow(false), 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return <BrandLoader visible={show} />;
}

// Anciens liens /cours/:id (e-mails, favoris) → nouvelle fiche cours.
function OldCourseRedirect() {
  const { id } = useParams();
  return <Navigate to={`/formations/${id}`} replace />;
}

export default function App() {
  return (
    <HeadManager>
      <RouteTransitionLoader />
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
          <Route path="/agent" element={<AgentDashboard />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          {/* Pages des services H- (Transport, Logement, Restaurant, Learning,
              Money, Translate, Shopping/Commerce...) */}
          <Route path="/h/:slug" element={<HServicePage />} />
          {/* H-Learning : vidéos YouTube gratuites + inscription au présentiel.
              Remplace les anciennes pages détail H-Learning et U-Study. */}
          <Route path="/formations" element={<LearningHub />} />
          <Route path="/formations/inscription" element={<InPersonRegistration />} />
          <Route path="/formations/bouquets" element={<PlansPage />} />
          <Route path="/formations/bouquets/:code/paiement" element={<Checkout />} />
          <Route path="/formations/mon-bouquet" element={<MySubscription />} />
          <Route path="/formations/:id" element={<LearningCourse />} />
          <Route path="/formations/:id/regarder/:lessonId" element={<CoursePlayer />} />
          <Route path="/cours/:id" element={<OldCourseRedirect />} />
          <Route path="/partenaires/h-learning" element={<LearningHub />} />
          <Route path="/partenaires/u-study" element={<UstudyPage />} />
          <Route path="/partenaires/:slug" element={<PartnerDetail />} />

          {/* Authentification : pages dédiées, plus de modals */}
          <Route path="/connexion" element={<SignIn />} />
          <Route path="/creer-un-compte" element={<Register />} />
          <Route path="/verifier" element={<VerifyOtp />} />
          <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
          <Route path="/nouveau-mot-de-passe" element={<NewPassword />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/paiement/:offerId" element={<Payment />} />
          {/* La formation d'équipe est désormais le bouquet « Équipe » de H-Learning. */}
          <Route path="/formation-equipe" element={<Navigate to="/formations/bouquets?plan=equipe#equipe" replace />} />
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
    </HeadManager>
  );
}
