'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter, Link } from '@/i18n/routing';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const localeNames: Record<string, string> = {
    es: 'ES',
    en: 'EN',
    ru: 'RU',
};

export default function Header() {
    const t = useTranslations('nav');
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const navItems = [
        { href: '/servicios', label: t('services') },
        { href: '/proceso', label: t('process') },
        { href: '/proyectos', label: t('projects') },
        { href: '/nosotros', label: t('about') },
        { href: '/contacto', label: t('contact') },
        { href: '/blog', label: 'Blog' },
        { href: '/calculator', label: t('calculator') },
    ];

    const switchLocale = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale as any });
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-[rgba(9,9,11,0.92)] backdrop-blur-xl border-b border-border-subtle shadow-lg'
                    : 'bg-transparent'
                }`}
        >
            <div className="container-custom flex items-center justify-between h-16 lg:h-20">
                {/* Logo */}
                <Link href="/" className="flex items-center group">
                    <Image
                        src="/logocablecore.png"
                        alt="CableCore"
                        width={96}
                        height={92}
                        className="w-20 h-auto lg:w-24 object-contain"
                    />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                pathname === item.href
                                    ? 'text-brand-gold bg-white/[0.05]'
                                    : 'text-gray-300 hover:text-brand-gold hover:bg-white/[0.03]'
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                    {/* Language Switcher */}
                    <div className="flex items-center bg-white/[0.04] border border-border-subtle rounded-full p-0.5">
                        {Object.entries(localeNames).map(([loc, name]) => (
                            <button
                                key={loc}
                                onClick={() => switchLocale(loc)}
                                className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 ${locale === loc
                                        ? 'bg-brand-gold text-black'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <Link
                        href="/contacto"
                        className="hidden sm:inline-flex btn-gold text-sm px-5 py-2.5"
                    >
                        {t('quote')}
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="lg:hidden p-2 text-gray-400 hover:text-white"
                        aria-label="Menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-[rgba(9,9,11,0.98)] backdrop-blur-xl border-t border-border-subtle"
                    >
                        <div className="container-custom py-4 flex flex-col gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`px-4 py-3 rounded-lg transition-colors ${
                                        pathname === item.href
                                            ? 'text-brand-gold bg-white/[0.05]'
                                            : 'text-gray-300 hover:text-brand-gold hover:bg-white/[0.03]'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <Link href="/contacto" className="btn-gold text-center mt-2">
                                {t('quote')}
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
