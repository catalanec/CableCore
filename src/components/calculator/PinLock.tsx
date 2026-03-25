"use client";

import { useState, useEffect } from "react";

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-gold">
    <circle cx="12" cy="16" r="1" />
    <rect x="3" y="10" width="18" height="12" rx="2" />
    <path d="M7 10V7a5 5 0 0 1 10 0v3" />
  </svg>
);

export default function PinLock({ children, locale }: { children: React.ReactNode, locale: string }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("cablecore_calc_unlocked");
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (saved === "0205") {
      setIsUnlocked(true);
    } else if (token === "cablecore_pro") {
      localStorage.setItem("cablecore_calc_unlocked", "0205");
      setIsUnlocked(true);
      // Clean up the URL so the token isn't visible
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "0205") {
      setIsUnlocked(true);
      localStorage.setItem("cablecore_calc_unlocked", "0205");
    } else {
      setError(true);
      setPin("");
    }
  };

  if (!isMounted) return null; // Prevent hydration mismatch

  if (isUnlocked) {
    return <>{children}</>;
  }

  // Basic localization for the lock screen
  const texts = {
    en: {
      title: "Restricted Access",
      desc: "This tool is exclusively for authorized CableCore installers.",
      placeholder: "Enter PIN",
      incorrect: "Incorrect PIN",
      btn: "Unlock"
    },
    ru: {
      title: "Доступ закрыт",
      desc: "Этот инструмент предназначен только для авторизованных монтажников CableCore.",
      placeholder: "Введите PIN-код",
      incorrect: "Неверный PIN-код",
      btn: "Разблокировать"
    },
    es: {
      title: "Acceso Restringido",
      desc: "Esta herramienta es de uso exclusivo para instaladores autorizados de CableCore.",
      placeholder: "Introduce el PIN",
      incorrect: "PIN incorrecto",
      btn: "Desbloquear"
    }
  };

  const t = texts[locale as keyof typeof texts] || texts.es;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="bg-brand-dark/50 backdrop-blur-md border border-white/5 rounded-2xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-brand-gold/20 flex items-center justify-center mx-auto mb-6">
          <LockIcon />
        </div>
        <h2 className="text-2xl font-bold font-heading mb-2 text-gradient-gold">{t.title}</h2>
        <p className="text-brand-gold-muted mb-8 text-sm leading-relaxed">
          {t.desc}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError(false);
            }}
            placeholder={t.placeholder}
            className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-center text-xl tracking-[0.5em] focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors outline-none"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm font-medium">{t.incorrect}</p>}
          <button
            type="submit"
            className="w-full bg-gradient-brand text-brand-dark font-bold py-3 px-6 rounded-lg hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all uppercase tracking-wider text-sm mt-4"
          >
            {t.btn}
          </button>
        </form>
      </div>
    </div>
  );
}
