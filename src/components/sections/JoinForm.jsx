import { useState } from "react";
import { Link } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import { api } from "../../lib/api.js";
import Reveal from "../ui/Reveal.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useProgressAction } from "../../context/ProgressContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useUser } from "../../context/Usercontext.jsx";

const FIELDS_INITIAL = {
  company: "",
  contactName: "",
  category: "Développement web & mobile",
  message: "",
};

const CATEGORIES = [
  "Cybersécurité",
  "Développement web & mobile",
  "Design",
  "Conseil & infrastructure IT",
  "Maintenance",
  "Formation (H-learning)",
  "Autre",
];

/** Invite à se connecter avant de candidater — affiché à la place du
 * formulaire tant que l'utilisateur n'a pas de session active. */
function SignInPrompt({ t }) {
  return (
    <div className="rounded-2xl border border-line bg-cream p-8 text-center">
      <p className="text-stone leading-relaxed mb-6 max-w-sm mx-auto">
        {t("joinForm.authRequired")}
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/connexion"
          state={{ redirectTo: "/#rejoindre" }}
          className="inline-flex items-center gap-2 rounded-full bg-ink text-cream text-sm font-medium px-6 py-3 hover:bg-coffee-dark transition-colors"
        >
          <LogIn size={15} />
          {t("joinForm.signIn")}
        </Link>
        <Link
          to="/creer-un-compte"
          state={{ redirectTo: "/#rejoindre" }}
          className="inline-flex items-center gap-2 rounded-full border border-line text-ink text-sm font-medium px-6 py-3 hover:border-coffee-light transition-colors"
        >
          <UserPlus size={15} />
          {t("joinForm.createAccount")}
        </Link>
      </div>
    </div>
  );
}

export default function JoinForm() {
  const { t } = useLanguage();
  const { isAuthenticated, withAuth, user } = useUser();
  const [fields, setFields] = useState(FIELDS_INITIAL);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const toast = useToast();
  const withProgress = useProgressAction();

  function update(key, value) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      await withProgress(() => withAuth((token) => api.partners.apply(token, fields)));
      setStatus("success");
      setFields(FIELDS_INITIAL);
      toast.success("Candidature envoyée — vous la retrouverez depuis votre tableau de bord.");
    } catch (err) {
      setStatus("error");
      const msg =
        err?.data?.detail ||
        "Impossible d'envoyer votre candidature pour le moment. Réessayez un peu plus tard.";
      setErrorMsg(msg);
      toast.error(msg);
    }
  }

  return (
    <section id="rejoindre" className="px-6 py-28 border-t border-line bg-surface">
      <div className="max-w-content mx-auto grid md:grid-cols-[0.9fr_1.1fr] gap-16">
        <Reveal>
          <p className="text-sm font-medium text-coffee mb-4">{t("joinForm.eyebrow")}</p>
          <h2 className="font-display text-3xl sm:text-4xl leading-tight text-ink max-w-md">
            {t("joinForm.heading")}
          </h2>
          <p className="mt-6 text-stone leading-relaxed max-w-sm">
            {t("joinForm.lead")}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          {!isAuthenticated ? (
            <SignInPrompt t={t} />
          ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-sm text-ink-soft">
            {t("joinForm.connectedAs")} <span className="font-medium text-ink">{user?.email}</span>
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field
              id="company"
              label={t("joinForm.company")}
              value={fields.company}
              onChange={(v) => update("company", v)}
              required
            />
            <Field
              id="contactName"
              label={t("joinForm.contactName")}
              value={fields.contactName}
              onChange={(v) => update("contactName", v)}
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm text-stone mb-1.5">
              {t("joinForm.category")}
            </label>
            <select
              id="category"
              value={fields.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-ink focus:border-coffee outline-none transition-colors"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm text-stone mb-1.5">
              {t("joinForm.message")}
            </label>
            <textarea
              id="message"
              rows={4}
              value={fields.message}
              onChange={(e) => update("message", e.target.value)}
              className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-ink placeholder:text-stone/60 focus:border-coffee outline-none transition-colors resize-none"
              placeholder={t("joinForm.messagePlaceholder")}
            />
          </div>

          {status === "success" && (
            <p className="text-sm text-coffee-dark bg-coffee-light/15 border border-coffee-light/40 rounded-lg px-4 py-3">
              {t("joinForm.success")}
            </p>
          )}
          {status === "error" && <p className="text-sm text-red-700">{errorMsg}</p>}

          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-ink text-cream rounded-full px-8 py-3.5 font-medium transition-transform duration-300 hover:scale-[1.02] disabled:opacity-60"
          >
            {status === "loading" ? t("joinForm.submitting") : t("joinForm.submit")}
          </button>
        </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}

function Field({ id, label, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-stone mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-ink placeholder:text-stone/60 focus:border-coffee outline-none transition-colors"
      />
    </div>
  );
}
