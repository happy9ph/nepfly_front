import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout.jsx";
import LockoutNotice from "../../components/auth/LockoutNotice.jsx";
import GoogleButton from "../../components/auth/GoogleButton.jsx";
import { useUser } from "../../context/Usercontext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { api, ApiError } from "../../lib/api.js";

export default function SignIn() {
  const { t } = useLanguage();
  const { signIn } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.redirectTo || "/";

  const [mode, setMode] = useState("otp"); // "otp" | "password"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);

  async function handleOtpSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.auth.requestOtp(email, "email", "login");
      navigate("/verifier", { state: { email, purpose: "login", redirectTo } });
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) setLocked(true);
      else setError(err?.data?.detail || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(redirectTo);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) setLocked(true);
      else setError(err?.data?.detail || "E-mail ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      visual={
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="text-[#C89A3D]" size={28} />
          </div>
          <h2 className="font-display italic text-2xl text-cream-fixed mb-3">
            {t("hero.titleEm")}
          </h2>
          <p className="text-cream-fixed/60 text-sm leading-relaxed">{t("hero.lead")}</p>
        </div>
      }
    >
      {locked ? (
        <LockoutNotice onExpire={() => setLocked(false)} />
      ) : (
        <>
          <h1 className="font-display text-2xl text-ink mb-2">{t("auth.signinTitle")}</h1>
          <p className="text-sm text-stone mb-8">{t("auth.noAccount")}{" "}
            <Link to="/creer-un-compte" className="text-coffee-dark font-medium hover:underline">
              {t("auth.joinNetwork")}
            </Link>
          </p>

          <GoogleButton />
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-line" />
            <span className="text-xs text-ink-faint">{t("auth.orDivider")}</span>
            <div className="flex-1 h-px bg-line" />
          </div>

          <AnimatePresence mode="wait">
            {mode === "otp" ? (
              <motion.form
                key="otp"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleOtpSubmit}
                className="space-y-4"
              >
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder={t("auth.emailPh")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-line rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-coffee-light transition-colors"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-ink text-cream text-sm font-medium py-3.5 hover:bg-coffee-dark transition-colors disabled:opacity-60"
                >
                  {loading ? t("auth.sending") : t("auth.receiveCode")}
                  {!loading && <ArrowRight size={15} />}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("password")}
                  className="w-full text-center text-xs text-ink-soft hover:text-ink transition-colors pt-1"
                >
                  {t("auth.preferPassword")}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="password"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handlePasswordSubmit}
                className="space-y-4"
              >
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder={t("auth.emailPh")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-line rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-coffee-light transition-colors"
                  />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                  <input
                    type="password"
                    required
                    placeholder={t("auth.passwordPh")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-line rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-coffee-light transition-colors"
                  />
                </div>
                <div className="flex justify-end -mt-2">
                  <Link to="/mot-de-passe-oublie" className="text-xs text-ink-soft hover:text-ink transition-colors">
                    {t("auth.forgotPassword")}
                  </Link>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-ink text-cream text-sm font-medium py-3.5 hover:bg-coffee-dark transition-colors disabled:opacity-60"
                >
                  {loading ? t("auth.connecting") : t("auth.signin")}
                  {!loading && <ArrowRight size={15} />}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("otp")}
                  className="w-full text-center text-xs text-ink-soft hover:text-ink transition-colors pt-1"
                >
                  {t("auth.otpToggle")}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </>
      )}
    </AuthLayout>
  );
}
