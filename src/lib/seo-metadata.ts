import { Metadata } from 'next';

const BASE_URL = 'https://cablecore.es';
const SITE_NAME = 'CableCore';
const PHONE = '+34 605 974 605';
const PHONE_LANDLINE = '+34 93 016 68 68';
const EMAIL = 'info@cablecore.es';
const ADDRESS = {
    street: 'Carrer Vitor Balaguer 33',
    city: 'Badalona',
    postalCode: '08914',
    region: 'Barcelona',
    country: 'ES',
};

const LOCALES = ['es', 'en', 'ru'];
const HREFLANG_MAP: Record<string, string> = {
    es: 'es-ES',
    en: 'en-US',
    ru: 'ru-RU',
};

/* ═════════════════════════════════════
   PAGE-LEVEL METADATA
   ═════════════════════════════════════ */

interface PageSEO {
    title: Record<string, string>;
    description: Record<string, string>;
}

const PAGE_SEO: Record<string, PageSEO> = {
    home: {
        title: {
            es: 'Instalación de Cable de Red Barcelona | CableCore — Cableado Cat6/Cat7',
            en: 'Network Cable Installation Barcelona | CableCore — Cat6/Cat7 Cabling',
            ru: 'Монтаж сетевого кабеля Барселона | CableCore — Cat6/Cat7',
        },
        description: {
            es: 'Instalación profesional de cableado estructurado Cat6, Cat6A y Cat7 en Barcelona. Puntos de red, racks y WiFi para oficinas y hogares. Presupuesto gratis en 24h ☎ +34 605 974 605.',
            en: 'Professional Cat6, Cat6A and Cat7 structured cabling installation in Barcelona. Network points, racks and WiFi for offices and homes. Free quote in 24h ☎ +34 605 974 605.',
            ru: 'Профессиональный монтаж кабеля Cat6, Cat6A и Cat7 в Барселоне. Розетки, шкафы, WiFi. Бесплатная смета за 24ч ☎ +34 605 974 605.',
        },
    },
    servicios: {
        title: {
            es: 'Servicios de Instalación de Red en Barcelona | Cableado Estructurado Cat6/Cat7',
            en: 'Network Installation Services Barcelona | Cat6/Cat7 Structured Cabling',
            ru: 'Услуги монтажа сети Барселона | Cat6/Cat7 кабельная система',
        },
        description: {
            es: 'Instalamos cableado estructurado Cat6, Cat6A y Cat7, puntos de red RJ45, racks y WiFi para oficinas y hogares en Barcelona y Badalona. Garantía 5 años ☎ +34 605 974 605.',
            en: 'We install Cat6, Cat6A and Cat7 structured cabling, RJ45 network points, racks and WiFi for offices and homes in Barcelona. 5-year warranty ☎ +34 605 974 605.',
            ru: 'Монтаж Cat6, Cat6A и Cat7, розетки RJ45, шкафы и WiFi в Барселоне. Гарантия 5 лет ☎ +34 605 974 605.',
        },
    },
    contacto: {
        title: {
            es: 'Contacto — CableCore Barcelona | Presupuesto Gratis',
            en: 'Contact — CableCore Barcelona | Free Quote',
            ru: 'Контакты — CableCore Барселона | Бесплатная смета',
        },
        description: {
            es: 'Contacta con CableCore para tu presupuesto gratis de instalación de red. Teléfono, WhatsApp, email. Servicio rápido en Barcelona.',
            en: 'Contact CableCore for your free network installation quote. Phone, WhatsApp, email. Fast service in Barcelona.',
            ru: 'Свяжитесь с CableCore для бесплатной сметы на установку сети. Телефон, WhatsApp, email. Быстрый сервис в Барселоне.',
        },
    },
    nosotros: {
        title: {
            es: 'Sobre Nosotros — CableCore | Instaladores de Red en Barcelona',
            en: 'About Us — CableCore | Network Installers in Barcelona',
            ru: 'О нас — CableCore | Монтажники сетей в Барселоне',
        },
        description: {
            es: 'Más de 10 años de experiencia en instalación de redes en Barcelona. Técnicos certificados, garantía de 5 años.',
            en: 'Over 10 years of network installation experience in Barcelona. Certified technicians, 5-year warranty.',
            ru: 'Более 10 лет опыта установки сетей в Барселоне. Сертифицированные техники, гарантия 5 лет.',
        },
    },
    proceso: {
        title: {
            es: 'Nuestro Proceso — CableCore | Cómo Trabajamos',
            en: 'Our Process — CableCore | How We Work',
            ru: 'Наш процесс — CableCore | Как мы работаем',
        },
        description: {
            es: 'Conoce nuestro proceso de instalación de red: consulta gratuita, diseño, instalación profesional y certificación.',
            en: 'Learn about our network installation process: free consultation, design, professional installation and certification.',
            ru: 'Узнайте наш процесс установки сетей: бесплатная консультация, проектирование, профессиональный монтаж и сертификация.',
        },
    },
    proyectos: {
        title: {
            es: 'Proyectos — CableCore | Instalaciones Realizadas en Barcelona',
            en: 'Projects — CableCore | Completed Installations in Barcelona',
            ru: 'Проекты — CableCore | Выполненные установки в Барселоне',
        },
        description: {
            es: 'Mira nuestros proyectos de instalación de red completados. Oficinas, hogares, naves industriales en Barcelona.',
            en: 'See our completed network installation projects. Offices, homes, industrial spaces in Barcelona.',
            ru: 'Посмотрите наши завершённые проекты по установке сетей. Офисы, дома, промышленные помещения в Барселоне.',
        },
    },
    calculator: {
        title: {
            es: 'Calculadora Precio Cableado Estructurado Barcelona — CableCore',
            en: 'Structured Cabling Price Calculator Barcelona — CableCore',
            ru: 'Калькулятор цены кабельной системы Барселона — CableCore',
        },
        description: {
            es: 'Calcula el precio de tu instalación de red en segundos. Cat6 desde 95€/punto, Cat7 desde 140€/punto. Presupuesto gratis sin compromiso ☎ +34 605 974 605.',
            en: 'Calculate your network installation price in seconds. Cat6 from €95/point, Cat7 from €140/point. Free quote with no obligation ☎ +34 605 974 605.',
            ru: 'Рассчитайте стоимость монтажа сети за секунды. Cat6 от 95€/точка, Cat7 от 140€/точка. Бесплатная смета ☎ +34 605 974 605.',
        },
    },
    precios: {
        title: {
            es: 'Precio Instalación Cable de Red Barcelona 2025 | CableCore',
            en: 'Network Cable Installation Prices Barcelona 2025 | CableCore',
            ru: 'Цены монтаж сетевого кабеля Барселона 2025 | CableCore',
        },
        description: {
            es: '¿Cuánto cuesta instalar cable de red en Barcelona? Cat6 desde 95€/punto, Cat7 desde 140€/punto. Precios transparentes con IVA incluido ☎ +34 605 974 605.',
            en: 'How much does network cable installation cost in Barcelona? Cat6 from €95/point, Cat7 from €140/point. Transparent prices including VAT ☎ +34 605 974 605.',
            ru: 'Сколько стоит монтаж сетевого кабеля в Барселоне? Cat6 от 95€/точка. Прозрачные цены с НДС ☎ +34 605 974 605.',
        },
    },
    blog: {
        title: {
            es: 'Blog — CableCore | Guías de Cableado y Redes',
            en: 'Blog — CableCore | Cabling & Network Guides',
            ru: 'Блог — CableCore | Руководства по кабельным сетям',
        },
        description: {
            es: 'Artículos y guías sobre instalación de cable de red, cableado estructurado, WiFi y redes en Barcelona.',
            en: 'Articles and guides about network cable installation, structured cabling, WiFi and networks in Barcelona.',
            ru: 'Статьи и руководства по установке сетевого кабеля, структурированной кабельной системе, WiFi в Барселоне.',
        },
    },
};

/* ═════════════════════════════════════
   METADATA GENERATOR
   ═════════════════════════════════════ */

export function generatePageMetadata(pageKey: string, locale: string, path: string = ''): Metadata {
    const seo = PAGE_SEO[pageKey];
    if (!seo) return {};

    const lang = locale || 'es';
    const title = seo.title[lang] || seo.title.es;
    const description = seo.description[lang] || seo.description.es;
    const url = `${BASE_URL}/${lang}${path}`;

    const alternates: Record<string, string> = {};
    LOCALES.forEach(loc => {
        alternates[HREFLANG_MAP[loc]] = `${BASE_URL}/${loc}${path}`;
    });
    // x-default apunta a la versión en español
    alternates['x-default'] = `${BASE_URL}/es${path}`;

    return {
        title,
        description,
        alternates: {
            canonical: url,
            languages: alternates,
        },
        openGraph: {
            title,
            description,
            url,
            siteName: SITE_NAME,
            locale: HREFLANG_MAP[lang] || 'es_ES',
            type: 'website',
            images: [{
                url: `${BASE_URL}/images/og-image.png`,
                width: 1200,
                height: 630,
                alt: 'CableCore — Instalación de Redes en Barcelona',
            }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [`${BASE_URL}/images/og-image.png`],
        },
    };
}

/* ═════════════════════════════════════
   JSON-LD STRUCTURED DATA
   ═════════════════════════════════════ */

export function getLocalBusinessJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        additionalType: 'https://schema.org/ElectricalContractor',
        '@id': `${BASE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: 'CableCore Barcelona',
        description: 'Especialistas en instalación de cable de red, cableado estructurado Cat6/Cat6A/Cat7 y redes para empresas y hogares en Barcelona.',
        url: BASE_URL,
        logo: `${BASE_URL}/logocablecore.png`,
        image: `${BASE_URL}/images/og-image.png`,
        telephone: PHONE,
        email: EMAIL,
        address: {
            '@type': 'PostalAddress',
            streetAddress: ADDRESS.street,
            addressLocality: ADDRESS.city,
            postalCode: ADDRESS.postalCode,
            addressRegion: ADDRESS.region,
            addressCountry: ADDRESS.country,
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: 41.4476,
            longitude: 2.2374,
        },
        areaServed: [
            { '@type': 'City', name: 'Barcelona' },
            { '@type': 'City', name: 'Badalona' },
            { '@type': 'City', name: 'Hospitalet de Llobregat' },
            { '@type': 'City', name: 'Sabadell' },
            { '@type': 'City', name: 'Terrassa' },
            { '@type': 'City', name: 'Mataró' },
            { '@type': 'City', name: 'Granollers' },
            { '@type': 'City', name: 'Cornellà de Llobregat' },
            { '@type': 'City', name: 'Sant Cugat del Vallès' },
            { '@type': 'City', name: 'Castelldefels' },
        ],
        openingHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '08:00',
                closes: '20:00',
            },
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: 'Saturday',
                opens: '09:00',
                closes: '14:00',
            },
        ],
        priceRange: '€€',
        currenciesAccepted: 'EUR',
        paymentAccepted: 'Cash, Credit Card, Bank Transfer',
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Servicios de Cableado y Red',
            itemListElement: [
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Service',
                        name: 'Instalación de Cable de Red Cat6',
                        description: 'Instalación profesional de cable Ethernet Cat6 para hogares y oficinas.',
                    },
                },
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Service',
                        name: 'Cableado Estructurado Cat6A/Cat7',
                        description: 'Instalación de cableado estructurado de alto rendimiento Cat6A y Cat7.',
                    },
                },
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Service',
                        name: 'Instalación de Rack de Red',
                        description: 'Montaje de racks de pared y suelo con organización de cableado.',
                    },
                },
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Service',
                        name: 'Puntos de Red y RJ45',
                        description: 'Instalación de rosetas de red, crimpado RJ45 y testeo.',
                    },
                },
            ],
        },
        sameAs: [],
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            reviewCount: '47',
            bestRating: '5',
            worstRating: '1',
        },
        review: [
            {
                '@type': 'Review',
                author: { '@type': 'Person', name: 'Carlos M.' },
                datePublished: '2025-03-15',
                reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
                reviewBody: 'Excelente servicio. Instalaron 12 puntos de red en nuestra oficina en un día. Cableado perfectamente organizado y certificado.',
            },
            {
                '@type': 'Review',
                author: { '@type': 'Person', name: 'Ana L.' },
                datePublished: '2025-02-20',
                reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
                reviewBody: 'Muy profesionales. Instalaron Cat6A en toda nuestra nave industrial. Trabajo limpio, puntual y a buen precio.',
            },
            {
                '@type': 'Review',
                author: { '@type': 'Person', name: 'David R.' },
                datePublished: '2025-01-10',
                reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
                reviewBody: 'Rapidez y calidad. Necesitaba instalar red en mi piso nuevo. Lo hicieron en unas horas, todo perfecto y con garantía.',
            },
            {
                '@type': 'Review',
                author: { '@type': 'Person', name: 'Marta G.' },
                datePublished: '2024-12-05',
                reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
                reviewBody: 'Contraté CableCore para cableado estructurado en nuestras oficinas. Resultado impecable, sin cables a la vista y red estable.',
            },
            {
                '@type': 'Review',
                author: { '@type': 'Person', name: 'Jordi P.' },
                datePublished: '2024-11-18',
                reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
                reviewBody: 'Increíble trabajo. Instalaron rack 12U, patch panel y 8 puntos de red. Muy atentos y profesionales en todo momento.',
            },
        ],

    };
}

export function getWebSiteJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        name: SITE_NAME,
        url: BASE_URL,
        description: 'Instalación profesional de redes y cableado estructurado en Barcelona',
        publisher: {
            '@id': `${BASE_URL}/#organization`,
        },
        inLanguage: ['es', 'en', 'ru'],
    };
}

export function getBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

export function getFAQJsonLd(faqs: Array<{ question: string; answer: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}

export { BASE_URL, SITE_NAME, PHONE, PHONE_LANDLINE, EMAIL, ADDRESS, LOCALES, HREFLANG_MAP };
