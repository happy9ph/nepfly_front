// Client API léger pour communiquer avec le backend FastAPI de H-Company.
// L'URL de base se configure via la variable d'environnement VITE_API_URL
// (voir .env.example). Aucune dépendance externe : fetch natif du navigateur.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Les navigateurs modernes bloquent de plus en plus les cookies tiers dès
// que le site et l'API vivent sur deux domaines différents (Vercel +
// Render, notamment) — même correctement réglés en SameSite=None; Secure,
// confirmé en production. Le jeton de rafraîchissement est donc stocké ici
// et renvoyé explicitement, plutôt que de compter sur le cookie httpOnly
// (qui reste posé par le serveur, mais n'est plus la source fiable).
const REFRESH_TOKEN_KEY = "hc_refresh_token";

function saveRefreshToken(token) {
  if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function clearRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

class NetworkError extends Error {
  constructor() {
    super("Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.");
    this.name = "NetworkError";
  }
}

async function request(path, { method = "GET", body, token, headers = {} } = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      // Indispensable pour que le cookie httpOnly `refresh_token` posé par
      // /auth/login et /auth/otp/verify soit envoyé sur les appels suivants
      // (ex: /auth/refresh) — le backend est sur une origine différente du site
      // en dev (ports 8000 vs 5173), donc `credentials` doit être explicite.
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Le fetch lui-même a échoué (serveur injoignable, coupure réseau,
    // CORS bloqué) — distinct d'une réponse HTTP d'erreur, où le serveur a
    // au moins répondu. On le signale spécifiquement pour que l'interface
    // puisse afficher "impossible de contacter le serveur" plutôt qu'un
    // message d'erreur métier trompeur.
    throw new NetworkError();
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new ApiError(data?.detail || res.statusText, res.status, data);
  }

  return data;
}

export const api = {
  // Authentification par e-mail + mot de passe
  auth: {
    signIn: (email, password) =>
      request("/api/v1/auth/login", { method: "POST", body: { email, password } }).then((data) => {
        saveRefreshToken(data?.refresh_token);
        return data;
      }),
    signUp: (name, email, password) =>
      request("/api/v1/auth/register", { method: "POST", body: { full_name: name, email, password } }),
    me: (token) => request("/api/v1/auth/me", { token }),
    // Renouvelle l'access_token à partir du jeton de rafraîchissement
    // stocké localement — le cookie httpOnly est envoyé aussi (au cas où),
    // mais ce corps JSON est la source réellement fiable désormais (voir
    // commentaire sur REFRESH_TOKEN_KEY plus haut).
    refresh: () =>
      request("/api/v1/auth/refresh", { method: "POST", body: { refresh_token: getRefreshToken() } }).then(
        (data) => {
          saveRefreshToken(data?.refresh_token);
          return data;
        }
      ),
    logout: () => {
      clearRefreshToken();
      return request("/api/v1/auth/logout", { method: "POST" });
    },

    // Connexion par code à usage unique (email ou WhatsApp) — utilisée
    // notamment par les partenaires lors de leur première connexion.
    requestOtp: (identifier, channel, purpose = "login") =>
      request("/api/v1/auth/otp/request", { method: "POST", body: { identifier, channel, purpose } }),
    verifyOtp: (identifier, channel, code, purpose = "login") =>
      request("/api/v1/auth/otp/verify", { method: "POST", body: { identifier, channel, purpose, code } }).then(
        (data) => {
          saveRefreshToken(data?.refresh_token);
          return data;
        }
      ),
    changePassword: (token, currentPassword, newPassword) =>
      request("/api/v1/auth/change-password", {
        method: "POST",
        token,
        body: { current_password: currentPassword, new_password: newPassword },
      }),
    resetPassword: (token, newPassword) =>
      request("/api/v1/auth/reset-password", {
        method: "POST",
        token,
        body: { new_password: newPassword },
      }),
    googleLoginUrl: () => request("/api/v1/auth/google/login"),
    oauthComplete: (accessToken, refreshToken) =>
      request("/api/v1/auth/oauth/complete", {
        method: "POST",
        body: { access_token: accessToken, refresh_token: refreshToken },
      }).then((data) => {
        saveRefreshToken(data?.refresh_token);
        return data;
      }),
  },

  // Candidatures / espace partenaires
  partners: {
    apply: (token, payload) =>
      request("/api/v1/partners/apply", { method: "POST", token, body: payload }),
    // Ma candidature (utilisateur connecté)
    me: (token) => request("/api/v1/partners/me", { token }),
    contract: (token) => request("/api/v1/partners/me/contract", { token }),
    signContract: (token, signedByName) =>
      request("/api/v1/partners/me/contract/sign", {
        method: "POST",
        token,
        body: { signed_by_name: signedByName },
      }),
    activities: (token) => request("/api/v1/partners/me/activities", { token }),
    stats: (token) => request("/api/v1/partners/me/stats", { token }),
    myOffers: (token) => request("/api/v1/partners/me/offers", { token }),
    acceptOffer: (token, offerId) =>
      request(`/api/v1/partners/me/offers/${offerId}/accept`, { method: "POST", token }),
    createPayment: (token, offerId, method, phoneNumber) =>
      request("/api/v1/partners/me/payments", {
        method: "POST",
        token,
        body: { offer_id: offerId, method, phone_number: phoneNumber || null },
      }),
    myPayments: (token) => request("/api/v1/partners/me/payments", { token }),
    accountStatus: (token) => request("/api/v1/partners/me/account", { token }),
    myApps: (token) => request("/api/v1/partners/me/apps", { token }),
    requestApp: (token, name, description) =>
      request("/api/v1/partners/me/apps", { method: "POST", token, body: { name, description } }),
    billing: (token) => request("/api/v1/partners/me/billing", { token }),
  },

  // Plateforme e-learning H-learning
  learning: {
    courses: () => request("/api/v1/learning/courses"),
  },

  // Espace admin — gestion des candidatures partenaires et de leurs contrats
  admin: {
    listApplications: (token) => request("/api/v1/partners/admin", { token }),
    getApplication: (token, id) => request(`/api/v1/partners/admin/${id}`, { token }),
    updateStatus: (token, id, status) =>
      request(`/api/v1/partners/admin/${id}/status`, { method: "PATCH", token, body: { status } }),
    updateAccountStatus: (token, id, status) =>
      request(`/api/v1/partners/admin/${id}/account-status`, { method: "PATCH", token, body: { status } }),
    getContract: (token, id) => request(`/api/v1/partners/admin/${id}/contract`, { token }),
    updateContract: (token, id, content) =>
      request(`/api/v1/partners/admin/${id}/contract`, { method: "PATCH", token, body: { content } }),
    listOffers: (token, id) => request(`/api/v1/partners/admin/${id}/offers`, { token }),
    createOffer: (token, id, payload) =>
      request(`/api/v1/partners/admin/${id}/offers`, { method: "POST", token, body: payload }),
    pendingApps: (token) => request("/api/v1/partners/admin/apps/pending", { token }),
    listPartnerApps: (token, applicationId) =>
      request(`/api/v1/partners/admin/${applicationId}/apps`, { token }),
    updateAppStatus: (token, appId, appStatus) =>
      request(`/api/v1/partners/admin/apps/${appId}/status`, { method: "PATCH", token, body: { status: appStatus } }),
    addRevenue: (token, appId, payload) =>
      request(`/api/v1/partners/admin/apps/${appId}/revenue`, { method: "POST", token, body: payload }),
    listPayments: (token) => request("/api/v1/partners/admin/payments", { token }),
    listContactMessages: (token) => request("/api/v1/contact/admin", { token }),
    replyToContact: (token, id, admin_reply) =>
      request(`/api/v1/contact/admin/${id}`, { method: "PATCH", token, body: { admin_reply } }),
  },

  // Mes demandes (contact) — utilisateur connecté
  contactMessages: {
    mine: (token) => request("/api/v1/contact/me", { token }),
  },

  // Onboarding après première connexion
  onboarding: {
    get: (token) => request("/api/v1/onboarding/me", { token }),
    submit: (token, payload) => request("/api/v1/onboarding/me", { method: "POST", token, body: payload }),
  },

  // Produits/services proposés sur la marketplace
  products: {
    list: () => request("/api/v1/products"),
  },

  // Formulaire de contact / prise de contact générale
  contact: {
    send: (payload) =>
      request("/api/v1/contact", { method: "POST", body: payload }),
  },
};

export { ApiError, NetworkError };
