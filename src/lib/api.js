// Client API léger pour communiquer avec le backend FastAPI de H-Company.
// L'URL de base se configure via la variable d'environnement VITE_API_URL
// (voir .env.example). Aucune dépendance externe : fetch natif du navigateur.

// Exporté pour construire des URL absolues vers des fichiers servis par le
// backend (logos de services uploadés, etc.) — voir data/hServices.js.
export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
  // Un FormData (upload de fichier) ne doit pas être JSON.stringify()'d, et
  // le Content-Type multipart avec sa boundary doit être posé par le
  // navigateur lui-même, pas fixé ici en dur.
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
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
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
                      ...(token ? { Authorization: `Bearer ${token}` } : {}),
                      ...headers,
      },
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
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
    // Formulaire unique de candidature (KYC inclus) — multipart/form-data
    // car il embarque la pièce d'identité. `fields` = { company,
    // contactName, category, message, phone, address, id_document_type,
    // id_document_number }, `idDocumentFile` = objet File natif du <input type="file">.
    apply: (token, fields, idDocumentFile) => {
      const form = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined && value !== null) form.append(key, value);
      });
        form.append("id_document", idDocumentFile);
        return request("/api/v1/partners/apply", { method: "POST", token, body: form });
    },
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
    pendingSubscriptions: (token) => request("/api/v1/services/admin/pending", { token }),
    listSubscriptions: (token) => request("/api/v1/services/admin", { token }),
    updateSubscriptionStatus: (token, id, status, adminNote) =>
    request(`/api/v1/services/admin/${id}/status`, {
      method: "PATCH",
      token,
      body: { status, admin_note: adminNote || null },
    }),
    // Catalogue des services (libellés FR/EN, description, logo, activation)
    listServiceCatalog: (token) => request("/api/v1/services/admin/catalog", { token }),
    createServiceCatalogItem: (token, payload) =>
    request("/api/v1/services/admin/catalog", { method: "POST", token, body: payload }),
    updateServiceCatalogItem: (token, id, payload) =>
    request(`/api/v1/services/admin/catalog/${id}`, { method: "PATCH", token, body: payload }),
    deleteServiceCatalogItem: (token, id) =>
    request(`/api/v1/services/admin/catalog/${id}`, { method: "DELETE", token }),
    uploadServiceCatalogLogo: (token, id, file) => {
      const form = new FormData();
      form.append("file", file);
      return request(`/api/v1/services/admin/catalog/${id}/logo`, { method: "POST", token, body: form });
    },
    searchUsers: (token, q) =>
    request(`/api/v1/notifications/admin/users/search?q=${encodeURIComponent(q || "")}`, { token }),
    listAgents: (token) => request("/api/v1/partners/admin/agents", { token }),
    setUserRole: (token, userId, role) =>
    request(`/api/v1/partners/admin/users/${userId}/role`, { method: "PATCH", token, body: { role } }),
    sendNotification: (token, payload) =>
    request("/api/v1/notifications/admin/send", { method: "POST", token, body: payload }),
    listCompanyEnrollments: (token) => request("/api/v1/learning/admin/company-enrollments", { token }),
    updateCompanyEnrollmentStatus: (token, id, statusValue) =>
    request(`/api/v1/learning/admin/company-enrollments/${id}/status`, {
      method: "PATCH",
      token,
      body: { status: statusValue },
    }),
  },

  // Espace agent — revue KYC des candidatures partenaires avant confirmation admin
  agent: {
    queue: (token) => request("/api/v1/partners/agent/queue", { token }),
    history: (token) => request("/api/v1/partners/agent/history", { token }),
    getApplication: (token, id) => request(`/api/v1/partners/agent/${id}`, { token }),
    review: (token, id, decision, note) =>
    request(`/api/v1/partners/agent/${id}/review`, { method: "PATCH", token, body: { decision, note: note || null } }),
    // Le document ne peut pas être chargé via une simple balise <img src="">
    // (il exige un en-tête Authorization) — on le récupère en blob puis on
    // construit une URL objet locale pour l'afficher/télécharger.
    documentBlobUrl: async (token, id) => {
      const res = await fetch(`${BASE_URL}/api/v1/partners/agent/${id}/document`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new ApiError("Document introuvable.", res.status, null);
      const blob = await res.blob();
      return { url: URL.createObjectURL(blob), contentType: blob.type };
    },
  },

  // Notifications de l'utilisateur connecté (cloche navbar)
  notifications: {
    mine: (token) => request("/api/v1/notifications/me", { token }),
    markRead: (token, id) => request(`/api/v1/notifications/me/${id}/read`, { method: "POST", token }),
    markAllRead: (token) => request("/api/v1/notifications/me/read-all", { method: "POST", token }),
  },

  // Mes demandes (contact) — utilisateur connecté
  contactMessages: {
    mine: (token) => request("/api/v1/contact/me", { token }),
  },

  // H-Learning — formations et inscription d'équipe (entreprise)
  learning: {
    courses: () => request("/api/v1/learning/courses"),
    enrollCompany: (payload) =>
    request("/api/v1/learning/company-enrollment", { method: "POST", body: payload }),
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

  // Abonnements des clients aux services H-Company (H-Transport, H-Restaurant,
  // H-Learning, H-Money, H-Translate, H-Shopping...) — distinct de
  // `partners.myApps`, qui concerne les partenaires exploitant un service.
  services: {
    catalog: () => request("/api/v1/services/catalog"),
    mine: (token) => request("/api/v1/services/me", { token }),
    request: (token, serviceKey, message) =>
    request("/api/v1/services/me", {
      method: "POST",
      token,
      body: { service_key: serviceKey, message: message || null },
    }),
  },

  // Formulaire de contact / prise de contact générale
  contact: {
    send: (payload) =>
    request("/api/v1/contact", { method: "POST", body: payload }),
  },
};

export { ApiError, NetworkError };
