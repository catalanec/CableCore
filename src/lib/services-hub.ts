/* ═══════════════════════════════════════════
   /servicios — el índice de servicios agrupado.
   Google dejó la página fuera del índice desde julio («rastreada, no
   indexada»): era una rejilla de tarjetas genéricas y una lista de 28 títulos
   sueltos. Aquí van los grupos y el texto propio de la página; la descripción
   de cada enlace sale de la metaDescription de su propia landing.
   ═══════════════════════════════════════════ */

import type { SEOPageConfig } from './seo-data/types';

export type HubLocale = 'es' | 'en' | 'ru';

export interface HubGroup {
    key: 'cabling' | 'fiber' | 'spaces' | 'zones';
    slugs: string[];
}

export const HUB_GROUPS: HubGroup[] = [
    {
        key: 'cabling',
        slugs: [
            'cableado-estructurado-barcelona',
            'instalacion-cable-red-barcelona',
            'instalacion-cat6-barcelona',
            'instalacion-cat6a-barcelona',
            'instalacion-cat7-barcelona',
            'instalador-rj45-barcelona',
            'instalacion-patch-panel-barcelona',
            'instalacion-rack-red-barcelona',
        ],
    },
    {
        key: 'fiber',
        slugs: [
            'instalacion-fibra-optica-barcelona',
            'instalacion-fibra-optica-empresas-barcelona',
            'cableado-fibra-optica-interior-barcelona',
            'fusion-fibra-optica-barcelona',
            'instalacion-ftth-edificios-barcelona',
        ],
    },
    {
        key: 'spaces',
        slugs: [
            'instalacion-red-casa-barcelona',
            'instalacion-red-oficina-barcelona',
            'cableado-estructurado-empresas',
            'instalador-red-barcelona',
        ],
    },
    {
        key: 'zones',
        slugs: [
            'instalacion-red-barcelona',
            'instalacion-red-hospitalet',
            'instalacion-red-badalona',
            'instalacion-red-sabadell',
            'instalacion-red-terrassa',
            'instalacion-red-sant-cugat',
            'instalacion-red-cornella',
            'instalacion-red-sant-boi',
            'instalacion-red-castelldefels',
            'instalacion-red-mataro',
            'instalacion-red-granollers',
        ],
    },
];

/** Cada tarjeta de servicio enlaza con la landing que la desarrolla. */
export const CARD_LINKS: Record<string, string> = {
    cabling: 'cableado-estructurado-barcelona',
    home: 'instalacion-red-casa-barcelona',
    office: 'instalacion-red-oficina-barcelona',
    retail: 'instalacion-cable-red-barcelona',
    business: 'cableado-estructurado-empresas',
    rj45: 'instalador-rj45-barcelona',
    rack: 'instalacion-rack-red-barcelona',
    network: 'instalacion-red-barcelona',
};

export interface HubCopy {
    catalogTitle: string;
    catalogIntro: string;
    groups: Record<HubGroup['key'], { title: string; text: string }>;
    guideTitle: string;
    guide: { h3: string; text: string }[];
    more: string;
}

export const HUB_COPY: Record<HubLocale, HubCopy> = {
    es: {
        catalogTitle: 'Catálogo de servicios y zonas',
        catalogIntro:
            'Cada servicio tiene su propia página con lo que incluye, cómo lo hacemos y preguntas frecuentes. Están agrupados por el tipo de trabajo, para que encuentres antes el que corresponde a tu instalación.',
        groups: {
            cabling: {
                title: 'Cableado de cobre y puntos de red',
                text: 'Tendido de cable Ethernet, tomas RJ45, armarios rack y patch panels. Es la base de cualquier red cableada, desde una vivienda hasta una planta de oficinas.',
            },
            fiber: {
                title: 'Fibra óptica',
                text: 'Para distancias que el cobre no cubre, enlaces entre plantas o edificios y conexiones de alta capacidad: tendido, fusión, conectorización y medición.',
            },
            spaces: {
                title: 'Según el tipo de espacio',
                text: 'Una vivienda, una oficina y una empresa con varias plantas no necesitan la misma red. Estas páginas explican qué cambia en cada caso.',
            },
            zones: {
                title: 'Zonas de trabajo en la provincia de Barcelona',
                text: 'Trabajamos en Barcelona y en su área metropolitana. Cada página de zona recoge lo particular de esa ciudad: tipo de edificios, polígonos industriales y sectores habituales.',
            },
        },
        guideTitle: 'Cómo elegir el servicio adecuado',
        guide: [
            {
                h3: 'Cat6, Cat6A o Cat7',
                text: 'Para una vivienda o una oficina pequeña, Cat6 cubre la gran mayoría de usos. Si la red debe soportar 10 Gbps en tiradas largas, o el edificio tiene mucha interferencia eléctrica, Cat6A es la opción más segura. Cat7 se reserva para entornos industriales o con requisitos de apantallamiento específicos. El precio orientativo por punto es de 95 € en Cat6, 115 € en Cat6A y 140 € en Cat7.',
            },
            {
                h3: 'Cuándo pasar a fibra óptica',
                text: 'Un enlace de cobre Ethernet tiene un límite de 100 metros. Cuando hay que unir plantas alejadas, naves o edificios distintos, o se necesita más capacidad entre el rack principal y los secundarios, la fibra es la solución. También es lo habitual en la distribución FTTH de edificios de viviendas.',
            },
            {
                h3: 'Qué incluye un punto de red',
                text: 'Cada punto incluye el cable, la toma RJ45 con su placa de pared y la conexión en el rack o patch panel. Al terminar, cada enlace se comprueba con equipo profesional y se etiqueta para que cualquier técnico pueda identificarlo después.',
            },
            {
                h3: 'Presupuesto',
                text: 'Con la calculadora de la web puedes obtener un precio aproximado en unos minutos. Para instalaciones grandes o con condiciones especiales, como falso techo, canalización exterior o trabajo en altura, lo mejor es contactarnos para valorar el lugar antes de cerrar el precio.',
            },
        ],
        more: 'Ver servicio',
    },
    en: {
        catalogTitle: 'Services & coverage catalog',
        catalogIntro:
            'Every service has its own page describing what it includes, how we carry it out and the most common questions. They are grouped by type of work so you can find the one that matches your installation faster.',
        groups: {
            cabling: {
                title: 'Copper cabling and network points',
                text: 'Ethernet cable runs, RJ45 outlets, rack cabinets and patch panels. The foundation of any wired network, from a flat to a full office floor.',
            },
            fiber: {
                title: 'Fiber optics',
                text: 'For distances copper cannot cover, links between floors or buildings and high-capacity connections: installation, splicing, termination and testing.',
            },
            spaces: {
                title: 'By type of space',
                text: 'A home, an office and a multi-floor company do not need the same network. These pages explain what changes in each case.',
            },
            zones: {
                title: 'Areas we cover in the province of Barcelona',
                text: 'We work in Barcelona and its metropolitan area. Each area page covers what is specific to that city: building types, industrial estates and common sectors.',
            },
        },
        guideTitle: 'How to choose the right service',
        guide: [
            {
                h3: 'Cat6, Cat6A or Cat7',
                text: 'For a home or a small office, Cat6 covers the vast majority of uses. If the network must carry 10 Gbps over long runs, or the building has heavy electrical interference, Cat6A is the safer choice. Cat7 is kept for industrial environments or specific shielding requirements. The guide price per point is €95 for Cat6, €115 for Cat6A and €140 for Cat7.',
            },
            {
                h3: 'When to move to fiber',
                text: 'A copper Ethernet link is limited to 100 metres. When distant floors, warehouses or separate buildings must be joined, or more capacity is needed between the main and secondary racks, fiber is the answer. It is also the norm for FTTH distribution in residential buildings.',
            },
            {
                h3: 'What a network point includes',
                text: 'Each point includes the cable, the RJ45 outlet with its wall plate and the termination in the rack or patch panel. Every link is tested with professional equipment and labelled, so any technician can identify it later.',
            },
            {
                h3: 'Getting a quote',
                text: 'The calculator on this site gives you an approximate price in a few minutes. For large installations or special conditions, such as suspended ceilings, outdoor conduits or work at height, it is best to contact us so the site can be assessed before the price is fixed.',
            },
        ],
        more: 'View service',
    },
    ru: {
        catalogTitle: 'Каталог услуг и зон работы',
        catalogIntro:
            'У каждой услуги есть своя страница: что в неё входит, как мы её выполняем и частые вопросы. Услуги сгруппированы по виду работ, чтобы быстрее найти ту, что подходит вашему объекту.',
        groups: {
            cabling: {
                title: 'Медный кабель и сетевые точки',
                text: 'Прокладка кабеля Ethernet, розетки RJ45, телекоммуникационные шкафы и патч-панели. Основа любой проводной сети — от квартиры до целого офисного этажа.',
            },
            fiber: {
                title: 'Оптоволокно',
                text: 'Для расстояний, которые медь не покрывает, связей между этажами или зданиями и каналов высокой ёмкости: прокладка, сварка, оконцовка и измерения.',
            },
            spaces: {
                title: 'По типу помещения',
                text: 'Квартире, офису и компании на нескольких этажах нужна разная сеть. На этих страницах — что меняется в каждом случае.',
            },
            zones: {
                title: 'Зоны работы в провинции Барселона',
                text: 'Работаем в Барселоне и её агломерации. На странице каждого города — его особенности: тип застройки, промзоны и типичные отрасли.',
            },
        },
        guideTitle: 'Как выбрать нужную услугу',
        guide: [
            {
                h3: 'Cat6, Cat6A или Cat7',
                text: 'Для квартиры или небольшого офиса Cat6 покрывает почти все задачи. Если сеть должна держать 10 Гбит/с на длинных линиях или в здании сильные электрические помехи, надёжнее Cat6A. Cat7 — для промышленных объектов и особых требований к экранированию. Ориентировочная цена точки: 95 € за Cat6, 115 € за Cat6A и 140 € за Cat7.',
            },
            {
                h3: 'Когда переходить на оптику',
                text: 'Медная линия Ethernet ограничена 100 метрами. Когда нужно связать удалённые этажи, склады или разные здания, или нужна большая пропускная способность между главным и вторичными шкафами, решение — оптоволокно. Оно же стандарт для разводки FTTH в жилых домах.',
            },
            {
                h3: 'Что входит в сетевую точку',
                text: 'Каждая точка — это кабель, розетка RJ45 с лицевой панелью и подключение в шкафу или на патч-панели. После монтажа каждая линия проверяется профессиональным оборудованием и маркируется, чтобы любой техник потом мог её найти.',
            },
            {
                h3: 'Смета',
                text: 'Калькулятор на сайте даёт примерную цену за несколько минут. Для больших объектов или особых условий — подвесной потолок, наружные кабель-каналы, работа на высоте — лучше связаться с нами, чтобы оценить объект до того, как фиксировать цену.',
            },
        ],
        more: 'Подробнее',
    },
};

export function hubCopy(locale: string): HubCopy {
    return HUB_COPY[(locale as HubLocale)] ?? HUB_COPY.es;
}

/**
 * Las landings de cada grupo, en el orden del grupo. Una landing nueva que aún
 * no esté en ningún grupo no desaparece: va al final del último.
 */
export function groupPages(pages: SEOPageConfig[]): { group: HubGroup; pages: SEOPageConfig[] }[] {
    const bySlug = new Map(pages.map((p) => [p.slug, p]));
    const grouped = new Set(HUB_GROUPS.flatMap((g) => g.slugs));
    const leftovers = pages.filter((p) => !grouped.has(p.slug));
    return HUB_GROUPS.map((group, i) => ({
        group,
        pages: [
            ...group.slugs.map((s) => bySlug.get(s)).filter((p): p is SEOPageConfig => !!p),
            ...(i === HUB_GROUPS.length - 1 ? leftovers : []),
        ],
    }));
}
