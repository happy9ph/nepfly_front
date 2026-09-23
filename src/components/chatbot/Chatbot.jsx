import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, ArrowRight, ChevronLeft, Menu, Sparkles } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useUser } from "../../context/Usercontext.jsx";
import { CHATBOT, matchKeyword, askAvila } from "../../i18n/chatbot.js";

let msgId = 0;
const nextId = () => ++msgId;

export default function Chatbot() {
  const { lang } = useLanguage();
  const { user, isAuthenticated } = useUser();
  const dict = CHATBOT[lang] || CHATBOT.fr;
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [messages, setMessages] = useState(() => [{ id: nextId(), from: "bot", text: dict.greeting }]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    // Réinitialise la conversation si la langue change pendant l'usage.
    abortRef.current?.abort();
    setTyping(false);
    setMessages([{ id: nextId(), from: "bot", text: dict.greeting }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const addBot = (text, withCta = false) =>
    setMessages((m) => [...m, { id: nextId(), from: "bot", text, withCta }]);

  // Réponse locale instantanée (menu), avec un petit délai « en train d'écrire ».
  function pushLocalAnswer(key) {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      addBot(dict.answers[key], dict.ctaKeys.includes(key));
    }, 450);
  }

  function handleMenuClick(key) {
    if (typing) return;
    setMessages((m) => [...m, { id: nextId(), from: "user", text: dict.menu.find((i) => i.key === key)?.label }]);
    pushLocalAnswer(key);
    setMenuOpen(false);
  }

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || typing) return;

    const userMsg = { id: nextId(), from: "user", text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setTyping(true);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const { reply, showForm } = await askAvila(history, lang, { signal: controller.signal });
      addBot(reply, showForm);
    } catch (err) {
      if (err.name === "AbortError") return;
      if (err.status === 429) {
        addBot(dict.rateLimited);
      } else {
        // IA indisponible → secours par mots-clés, sinon message générique.
        const key = matchKeyword(text, lang);
        if (key) addBot(`${dict.error}\n\n${dict.answers[key]}`, dict.ctaKeys.includes(key));
        else addBot(dict.fallback, true);
      }
    } finally {
      if (abortRef.current === controller) {
        setTyping(false);
        abortRef.current = null;
      }
      inputRef.current?.focus();
    }
  }

  function restart() {
    abortRef.current?.abort();
    setTyping(false);
    setMessages([{ id: nextId(), from: "bot", text: dict.greeting }]);
    setMenuOpen(false);
  }

  const onlyGreeting = messages.length === 1;

  return (
    <>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-[190] w-14 h-14 rounded-full bg-ink-fixed text-cream-fixed shadow-2xl flex items-center justify-center"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        aria-label={open ? "Fermer le chat" : "Ouvrir le chat"}
      >
        {!open && (
          <motion.span
            className="absolute inset-0 rounded-full bg-latte/40"
            animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={{ duration: 0.2 }} className="relative">
              <MessageCircle size={22} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-5 z-[190] w-[370px] max-w-[calc(100vw-2.5rem)] h-[540px] max-h-[75vh] bg-surface rounded-3xl shadow-2xl border border-line overflow-hidden flex flex-col"
          >
            {/* En-tête */}
            <div className="relative bg-ink-fixed text-cream-fixed px-4 py-4 flex items-center gap-3 shrink-0">
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-latte to-coffee flex items-center justify-center font-display text-sm shrink-0">
                A
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-latte ring-2 ring-ink-fixed" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight truncate">Avila</p>
                <p className="text-[0.7rem] text-cream-fixed/60 truncate">
                  {typing ? dict.typing : lang === "fr" ? "Assistante H-Company · répond à tout" : "H-Company assistant · ask anything"}
                </p>
              </div>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Menu"
                aria-expanded={menuOpen}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
              >
                <Menu size={18} />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-4 mt-1.5 bg-surface border border-line rounded-2xl shadow-xl overflow-hidden z-10 min-w-[200px]"
                  >
                    {dict.menu.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => handleMenuClick(item.key)}
                        className="w-full text-left text-sm text-ink px-4 py-2.5 hover:bg-cream transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                    <button
                      onClick={restart}
                      className="w-full text-left text-sm text-ink-faint px-4 py-2.5 hover:bg-cream transition-colors border-t border-line"
                    >
                      {dict.restart}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-cream/40" aria-live="polite">
              {isAuthenticated && user && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-surface border border-line rounded-2xl px-4 py-3 text-sm space-y-1"
                >
                  <p className="text-ink">
                    <span className="text-ink-faint">{lang === "fr" ? "Nom" : "Name"} : </span>
                    {user.full_name || user.email}
                  </p>
                  <p className="text-ink truncate">
                    <span className="text-ink-faint">Email : </span>
                    <span className="text-coffee-dark underline underline-offset-2">{user.email}</span>
                  </p>
                </motion.div>
              )}

              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex items-end gap-2 max-w-[88%] ${m.from === "user" ? "ml-auto flex-row-reverse" : ""}`}
                >
                  {m.from === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-latte to-coffee flex items-center justify-center text-cream-fixed font-display text-xs shrink-0">
                      A
                    </div>
                  )}
                  <div className="min-w-0">
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line break-words ${
                        m.from === "user"
                          ? "bg-coffee text-cream-fixed rounded-br-md"
                          : "bg-surface border border-line text-ink rounded-bl-md"
                      }`}
                    >
                      {m.text}
                    </div>
                    {m.withCta && (
                      <a
                        href="#rejoindre"
                        onClick={() => setOpen(false)}
                        className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-coffee-dark hover:underline"
                      >
                        {dict.goToForm} <ArrowRight size={12} />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Suggestions rapides tant que la conversation n'a pas commencé */}
              {onlyGreeting && !typing && (
                <div className="flex flex-wrap gap-1.5 pl-9">
                  {dict.menu.slice(0, 4).map((item) => (
                    <button
                      key={item.key}
                      onClick={() => handleMenuClick(item.key)}
                      className="text-xs text-coffee-dark bg-surface border border-line hover:border-coffee-light hover:bg-latte-soft rounded-full px-3 py-1.5 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              {typing && (
                <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-surface border border-line w-fit ml-9">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-coffee-light"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="border-t border-line p-3 flex items-center gap-2 shrink-0">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={dict.inputPlaceholder}
                maxLength={2000}
                aria-label={dict.inputPlaceholder}
                className="flex-1 text-sm px-4 py-2.5 rounded-full border border-line outline-none focus:border-coffee-light bg-surface text-ink placeholder:text-ink-faint"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="w-10 h-10 rounded-full bg-coffee text-cream-fixed flex items-center justify-center shrink-0 hover:bg-coffee-dark disabled:opacity-40 transition-colors"
                aria-label={lang === "fr" ? "Envoyer" : "Send"}
              >
                <Send size={15} />
              </button>
            </form>
            <p className="flex items-center justify-center gap-1 text-[10px] text-ink-faint pb-2 -mt-1">
              <Sparkles size={10} />
              {lang === "fr" ? "Réponses générées par IA, vérifiez les infos importantes." : "AI-generated answers, double-check anything important."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}