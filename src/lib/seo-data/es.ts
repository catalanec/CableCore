/* ═══════════════════════════════════════════
   SEO Landing Pages Data
   Keyword-targeted pages for Barcelona
   ═══════════════════════════════════════════ */

import { SEOPageConfig } from "./types";

export const SEO_PAGES_ES: SEOPageConfig[] = [
    {
        slug: 'instalacion-cable-red-barcelona',
        title: 'Instalación Cable de Red Barcelona',
        h1: 'Instalación profesional de cable de red en Barcelona',
        h2s: ['Proceso de instalación paso a paso', 'Materiales y herramientas profesionales', 'Preguntas frecuentes'],
        intro: 'Instalamos cable de red Ethernet en Barcelona con proceso totalmente controlado: visita técnica, trazado de recorridos, tendido de cable, crimpado RJ45, etiquetado y testeo con certificadora. Cat5e, Cat6, Cat6A y Cat7. Sin sorpresas en el presupuesto.',
        metaDescription: 'Instalación de cable de red en Barcelona. Proceso profesional completo: trazado, tendido, crimpado RJ45 y testeo certificado. Cat5e a Cat7. ☎ +34 605 974 605',
        cta: '¿Necesitas instalar cable de red en Barcelona?',
        features: [
            { icon: '📐', title: 'Visita técnica previa', text: 'Medimos el espacio, planificamos los recorridos y calculamos los metros de cable exactos antes de darte precio.' },
            { icon: '🔧', title: 'Tendido limpio', text: 'Pasamos el cable por canaleta, falso techo o empotrado según el acabado que necesitas. Sin cables a la vista.' },
            { icon: '🔌', title: 'Crimpado RJ45 certificado', text: 'Terminamos cada punto con conectores RJ45 de categoría correcta y roseta de superficie o empotrada.' },
            { icon: '🏷️', title: 'Etiquetado profesional', text: 'Cada cable y roseta etiquetados con código para fácil identificación futura.' },
            { icon: '📊', title: 'Testeo con certificadora', text: 'Comprobamos cada par de cables con analizador profesional: continuidad, mapa de pares, NEXT y pérdida de inserción.' },
            { icon: '📋', title: 'Informe de instalación', text: 'Entregamos documentación con el esquema de la instalación y los resultados del testeo de cada punto.' },
        ],
        faq: [
            { q: '¿Cuánto cuesta instalar cable de red en Barcelona?', a: 'Un punto Cat6 completamente instalado (cable + roseta + comprobación) cuesta desde 110€ IVA incluido. Un punto Cat6A U/FTP desde 130€ IVA incluido. El precio final depende del número de puntos, metros de cable y tipo de acabado. Pide presupuesto sin compromiso.' },
            { q: '¿Cuánto tarda la instalación?', a: 'Una instalación doméstica de 4-8 puntos se realiza en 1 día laborable. Proyectos empresariales de 20-30 puntos en 2-3 días. Trabajamos con mínimas molestias.' },
            { q: '¿Es mejor canaleta o empotrado?', a: 'La canaleta es más rápida y económica, ideal para instalaciones en locales ya construidos. El empotrado queda invisible pero requiere obra. En reformas recomendamos siempre empotrado.' },
            { q: '¿Qué categoría de cable necesito?', a: 'Cat6 para uso doméstico (1 Gbps). Cat6A para oficinas que necesiten 10 Gbps. Cat7 para entornos industriales o data centers con muchas interferencias.' },
            { q: '¿Necesito cortar el suministro durante la instalación?', a: 'No. La instalación de cable de red no requiere cortar la electricidad. Trabajamos en paralelo a la actividad del local u hogar. Solo interrumpimos brevemente el switch si ya existe red, para conectar los nuevos puntos.' },
            { q: '¿Ofrecéis garantía en la instalación?', a: 'Sí. Todas nuestras instalaciones tienen 5 años de garantía en materiales y mano de obra. Si un punto falla en ese periodo, lo reparamos sin coste.' },
            { q: '¿Podéis instalar cable de red en un piso de alquiler?', a: 'Sí, usando canaleta adhesiva que no daña paredes ni requiere permiso del propietario. Al finalizar el contrato, la canaleta se retira sin dejar rastro.' },
        ],
        richSections: [
            {
                h2: "Qué determina el precio de un punto de red",
                paragraphs: [
                    "El precio por punto no depende del cable, que es la parte barata. Depende del recorrido: si hay canalización libre, si hay que abrir regata, si el falso techo es registrable, cuántos codos hay que salvar y a qué altura se trabaja. Un mismo punto puede variar al doble entre una oficina moderna y una finca antigua.",
                    "Por eso no damos precio por teléfono sin ver el sitio. La visita técnica es gratuita y sirve exactamente para esto: medir recorridos reales, comprobar registros y decir un número que se va a sostener, en lugar de un precio orientativo que después sube durante la obra.",
                ],
            },
            {
                h2: "Cómo tendemos sin destrozar el acabado",
                paragraphs: [
                    "En vivienda y oficina acabada el objetivo es que la instalación se note lo menos posible. El orden que seguimos es: aprovechar canalización existente si está libre, después falso techo y suelo técnico, después canaleta de perfil bajo siguiendo líneas de la carpintería, y solo como última opción abrir regata.",
                    "Cuando hay que pasar por zonas comunes o fachada, lo consultamos antes con la propiedad, porque es donde más problemas surgen después. Y dejamos siempre hilo guía en la canalización que usamos, para que la siguiente ampliación no obligue a repetir el trabajo de acceso.",
                ],
            },
        ],
        updated: '2026-09-09T00:00:00.000Z',
    },
    {
        slug: 'cableado-estructurado-barcelona',
        title: 'Cableado Estructurado Barcelona',
        h1: 'Cableado estructurado profesional en Barcelona',
        h2s: ['¿Qué incluye un proyecto de cableado estructurado?', 'Normativa y estándares', 'Preguntas frecuentes'],
        intro: 'Diseño e instalación de infraestructuras de cableado estructurado para empresas en Barcelona. Cumplimos la normativa ISO/IEC 11801 y ANSI/TIA-568. Entregamos proyecto técnico completo, etiquetado y documentación AS-BUILT. Garantía extendida de 5 años en materiales y mano de obra.',
        metaDescription: 'Cableado estructurado Barcelona. Diseño bajo norma ISO/IEC 11801, instalación, testeo y documentación AS-BUILT para empresas. ☎ +34 605 974 605',
        cta: '¿Necesitas cableado estructurado en Barcelona?',
        features: [
            { icon: '📐', title: 'Proyecto técnico', text: 'Elaboramos un proyecto con planos de distribución, recorridos de cable, ubicación de racks y número de puntos.' },
            { icon: '🏗️', title: 'Normativa ISO/IEC 11801', text: 'Diseñamos según los estándares internacionales de cableado estructurado para categorías 6, 6A y 7.' },
            { icon: '📈', title: 'Red escalable', text: 'Planificamos la instalación para que puedas ampliar puestos sin rehacer el cableado principal.' },
            { icon: '🗄️', title: 'Rack y patch panel', text: 'Instalamos armario de telecomunicaciones con patch panel etiquetado, organizador de cables y alimentación rack.' },
            { icon: '📊', title: 'Testeo y certificación', text: 'Medimos cada par con certificadora Fluke para verificar que cumple la categoría contratada. Informe por escrito.' },
            { icon: '📁', title: 'Documentación AS-BUILT', text: 'Entregamos planos finales con los recorridos reales, etiquetado completo y resultados de testeo de todos los puntos.' },
        ],
        faq: [
            { q: '¿Qué es el cableado estructurado?', a: 'Es una infraestructura de cableado organizada y estandarizada que permite transmitir voz, datos y vídeo dentro de un edificio. La clave es que sigue una normativa (ISO/IEC 11801) que garantiza el rendimiento y la compatibilidad a largo plazo.' },
            { q: '¿Cuánto cuesta el cableado estructurado en Barcelona?', a: 'Un proyecto completo para una oficina de 10 puestos está entre 2.000€ y 3.500€ (rack + patch panel + 10 puntos Cat6A + testeo + documentación). Para 20 puestos entre 3.500€ y 6.000€. El precio varía según categoría de cable y complejidad del espacio.' },
            { q: '¿Cuánto se tarda en instalar cableado estructurado?', a: 'Una oficina de 10-15 puestos requiere 2-3 días de instalación más 1 día de testeo y documentación. Proyectos más grandes se planifican por fases para no interrumpir la actividad.' },
            { q: '¿Se puede hacer en un local ya construido?', a: 'Sí, trabajamos con canaleta cable, falso techo técnico y empotrado para adaptar la instalación a cualquier espacio. Previo a la instalación hacemos una visita técnica para evaluar las posibilidades.' },
            { q: '¿Qué diferencia hay entre Cat6 y Cat6A en cableado estructurado?', a: 'Cat6A soporta 10 Gbps hasta 100m y es el estándar recomendado para nuevas instalaciones empresariales. Cat6 soporta 1 Gbps y es suficiente para oficinas pequeñas con menos de 20 puestos.' },
        ],
        richSections: [
            {
                h2: "Qué convierte un cableado en estructurado",
                paragraphs: [
                    "Cableado estructurado no significa cable ordenado. Es un sistema definido por la norma ISO/IEC 11801 y su equivalente europea EN 50173, que fija los subsistemas, las distancias máximas y los parámetros que cada enlace debe cumplir. Si una instalación no se puede certificar contra esos valores, no es cableado estructurado por mucho que esté bien peinado.",
                    "En la práctica eso significa tres cosas concretas: topología en estrella desde un repartidor, 90 metros máximos de cable horizontal más 10 de latiguillos, y componentes de la misma categoría en todo el enlace. Un solo latiguillo Cat5e en un enlace Cat6A degrada el conjunto a Cat5e, y es el fallo más común que encontramos.",
                ],
            },
            {
                h2: "La certificación es lo que distingue el trabajo",
                paragraphs: [
                    "Certificar no es comprobar que el cable da enlace. Es medir con equipo homologado el mapa de hilos, la longitud, la atenuación, la diafonía en ambos extremos, la pérdida de retorno y el retardo, y contrastar cada valor contra el límite normativo de la categoría instalada.",
                    "El informe resultante es lo que permite reclamar la garantía extendida del fabricante del sistema, y lo que demuestra ante un tercero que la instalación cumple. Sin él, el día que la red falle no hay forma de distinguir entre un problema de cableado y un problema de electrónica, y se acaba sustituyendo equipo que estaba sano.",
                ],
            },
        ],
        updated: '2026-09-09T00:00:00.000Z',
    },
    {
        slug: 'instalacion-cat6-barcelona',
        title: 'Instalación Cat6 Barcelona',
        h1: 'Instalación de cable Cat6 en Barcelona',
        h2s: ['Ventajas del Cat6', 'Proceso de instalación', 'Preguntas frecuentes'],
        intro: 'Instalación profesional de cableado Cat6 en Barcelona. Velocidad hasta 1 Gbps, ideal para hogares y oficinas. Presupuesto gratis y sin compromiso.',
        metaDescription: 'Instalación Cat6 en Barcelona. Cable Ethernet 1Gbps para hogar y oficina. Instalador profesional. Presupuesto gratis. ☎ +34 605 974 605',
        cta: '¿Necesitas Cat6 en Barcelona?',
        features: [
            { icon: '⚡', title: 'Hasta 1 Gbps', text: 'Velocidad sobrada para navegación, streaming 4K y trabajo remoto.' },
            { icon: '💰', title: 'Mejor relación calidad-precio', text: 'Cable Cat6 al mejor precio con instalación profesional incluida.' },
            { icon: '🏠', title: 'Ideal para hogar', text: 'Perfecto para domicilios que quieren conexión estable y rápida.' },
            { icon: '📡', title: 'Compatible WiFi 6', text: 'Base perfecta para routers WiFi 6 y puntos de acceso.' },
            { icon: '🔌', title: 'RJ45 testeo', text: 'Todos los puntos verificados y testeados por nuestros técnicos.' },
            { icon: '🛠️', title: 'Instalación limpia', text: 'Canaleta, falso techo o empotrado según tu preferencia.' },
        ],
        faq: [
            { q: '¿Cuál es la diferencia entre Cat5e y Cat6?', a: 'Cat6 soporta velocidades de hasta 1 Gbps a 100m vs 100 Mbps del Cat5e, con mejor blindaje contra interferencias.' },
            { q: '¿Cat6 es suficiente para mi oficina?', a: 'Para oficinas pequeñas con hasta 10 empleados, Cat6 es una excelente opción. Si necesitas más de 1 Gbps, considera Cat6A.' },
        ],
        richSections: [
            {
                h2: "Hasta dónde llega Cat6 de verdad",
                paragraphs: [
                    "Cat6 transporta 1 Gbps a 100 metros sin discusión, y 10 Gbps solo hasta 37-55 metros según el nivel de interferencia del entorno. Ese matiz es el que decide la mayoría de instalaciones: si el rack está en el centro de la planta y ningún puesto queda a más de 40 metros de cable real, Cat6 da 10 Gbps y no hace falta pagar Cat6A.",
                    "El error habitual es medir la distancia en línea recta sobre el plano. El cable sube al falso techo, recorre el pasillo, baja por el tabique y todavía necesita metro y medio de holgura en cada extremo. Un puesto que en plano está a 25 metros suele consumir 40 de cable. Por eso medimos el recorrido real antes de decidir la categoría.",
                ],
            },
            {
                h2: "Cuándo Cat6 es la elección correcta y cuándo no",
                paragraphs: [
                    "Cat6 es la opción sensata para oficinas de tamaño medio, comercio, vivienda y cualquier instalación donde el tráfico real sea trabajo de despacho, videollamada y acceso a servidor local. Sale más barato que Cat6A, es más delgado, se maneja mejor en canalizaciones estrechas y admite radios de curvatura más cerrados.",
                    "No lo recomendamos en naves con maquinaria pesada ni donde el cliente ya sabe que va a mover vídeo sin comprimir, copias masivas o almacenamiento en red a 10 Gbps sobre distancias largas. Ahí el ahorro inicial se paga dos veces, porque la reforma implica volver a abrir las mismas canalizaciones.",
                ],
            },
        ],
        updated: '2026-09-09T00:00:00.000Z',
    },
    {
        slug: 'instalacion-cat6a-barcelona',
        title: 'Instalación Cat6A Barcelona',
        h1: 'Instalación de cable Cat6A en Barcelona',
        h2s: ['Ventajas del Cat6A', 'Proceso de instalación', 'Preguntas frecuentes'],
        intro: 'Instalación profesional de cableado Cat6A en Barcelona. Velocidad de 10 Gbps, apantallado, ideal para empresas que exigen alto rendimiento de red.',
        metaDescription: 'Instalación Cat6A en Barcelona. Cable 10Gbps apantallado para empresas. Instalador profesional. ☎ +34 605 974 605',
        cta: '¿Necesitas Cat6A para tu empresa?',
        features: [
            { icon: '🚀', title: 'Hasta 10 Gbps', text: '10 veces más rápido que Cat6 estándar para grandes transferencias de datos.' },
            { icon: '🛡️', title: 'Apantallado (FTP)', text: 'Mayor protección contra interferencias electromagnéticas.' },
            { icon: '🏢', title: 'Ideal para empresas', text: 'La elección preferida para oficinas medianas y grandes.' },
            { icon: '📊', title: 'Futuro-proof', text: 'Preparado para tecnologías como WiFi 6E, PoE++ y 10GbE.' },
            { icon: '🏥', title: 'Sectores exigentes', text: 'Perfecto para clínicas, estudios de diseño y empresas tech.' },
            { icon: '✅', title: 'Testeo', text: 'Comprobamos cada punto hasta 500 MHz con equipos profesionales.' },
        ],
        faq: [
            { q: '¿Merece la pena Cat6A frente a Cat6?', a: 'Si tu empresa maneja grandes volúmenes de datos o planeas crecer en los próximos 5-10 años, Cat6A es una inversión inteligente.' },
            { q: '¿Cat6A funciona con mis equipos actuales?', a: 'Sí, Cat6A es retrocompatible con Cat6 y Cat5e. Puedes actualizarte sin cambiar switches ni routers.' },
        ],
        richSections: [
            {
                h2: "Lo que Cat6A resuelve y Cat6 no",
                paragraphs: [
                    "La diferencia real de Cat6A no son los 10 Gbps a 100 metros, sino el alien crosstalk: la diafonía entre cables distintos que van juntos en el mismo mazo. En un tendido de treinta cables por bandeja, es lo que degrada el enlace cuando todos transmiten a la vez, y es exactamente el escenario que Cat6 no está diseñado para cubrir.",
                    "Por eso Cat6A tiene sentido en instalaciones densas: plantas de oficinas con muchos puestos, centros de datos pequeños, edificios donde el backbone comparte recorrido con decenas de enlaces. En un chalet con seis puntos repartidos, la ventaja es marginal y el sobrecoste no se justifica.",
                ],
            },
            {
                h2: "Es más grueso, y eso cambia la obra",
                paragraphs: [
                    "Un Cat6A U/FTP tiene bastante más diámetro que un Cat6 y admite mucho menos radio de curvatura. Eso condiciona el llenado de tubo, los codos y las cajas de registro: una canalización que traga seis Cat6 puede aceptar solo tres o cuatro Cat6A, y forzarlo deforma el cable y arruina las prestaciones por las que se pagó.",
                    "Lo comprobamos antes de presupuestar, porque es la diferencia entre pasar por la canalización existente y tener que abrir una nueva. También pesa en el rack: los latiguillos Cat6A ocupan más y exigen más profundidad en el armario y una gestión de cable más disciplinada para que las puertas cierren.",
                ],
            },
        ],
        updated: '2026-09-09T00:00:00.000Z',
    },
    {
        slug: 'instalacion-cat7-barcelona',
        title: 'Instalación Cat7 Barcelona',
        h1: 'Instalación de cable Cat7 en Barcelona',
        h2s: ['Ventajas del Cat7', 'Proceso de instalación', 'Preguntas frecuentes'],
        intro: 'Instalación de cableado Cat7 en Barcelona para los entornos más exigentes. Blindaje S/FTP, hasta 10 Gbps y frecuencia de 600 MHz.',
        metaDescription: 'Instalación Cat7 en Barcelona. Cable S/FTP 10Gbps 600MHz para entornos industriales y data centers. ☎ +34 605 974 605',
        cta: '¿Necesitas Cat7 para tu proyecto?',
        features: [
            { icon: '⚡', title: '10 Gbps / 600 MHz', text: 'Máximo rendimiento para entornos industriales y data centers.' },
            { icon: '🛡️', title: 'Doble blindaje S/FTP', text: 'Cada par blindado individualmente más blindaje global.' },
            { icon: '🏭', title: 'Industrial', text: 'Ideal para fábricas, naves y entornos con interferencias electromagnéticas.' },
            { icon: '📡', title: 'PoE++', text: 'Soporta Power over Ethernet para cámaras, APs y dispositivos IoT.' },
            { icon: '🔒', title: 'Máxima fiabilidad', text: 'Conectores GG45 o TERA para conexiones a prueba de errores.' },
            { icon: '📐', title: 'Normativa completa', text: 'Cumple con las normas más estrictas: ISO/IEC 11801 Class F.' },
        ],
        faq: [
            { q: '¿Cuándo necesito Cat7?', a: 'Cuando el entorno tiene muchas interferencias electromagnéticas (fábricas, CPDs) o necesitas la máxima calidad de señal.' },
            { q: '¿Es compatible Cat7 con mis equipos?', a: 'Sí, Cat7 con conectores RJ45 es compatible con todo el equipo estándar.' },
        ],
        richSections: [
            {
                h2: "Cat7 y el problema del conector",
                paragraphs: [
                    "Cat7 es una norma de cable, no de conector. Sus especificaciones se definen con conectores GG45 o TERA, que casi nadie instala: el equipamiento de red del mercado lleva RJ45. En la práctica, la inmensa mayoría de instalaciones llamadas Cat7 terminan en un RJ45, y en ese momento el enlace ya no cumple Cat7 en sentido estricto.",
                    "Lo decimos abiertamente porque es donde el cliente suele estar mal informado. Si lo que se busca es 10 Gbps certificados con conectividad estándar, la respuesta correcta hoy es Cat6A. Si lo que se busca es blindaje máximo frente a interferencia, Cat7 S/FTP aporta valor real: cada par apantallado individualmente más pantalla general.",
                ],
            },
            {
                h2: "Dónde el blindaje de Cat7 se paga solo",
                paragraphs: [
                    "El apantallamiento individual por par tiene sentido en entornos electromagnéticamente hostiles: salas con variadores de frecuencia, líneas de producción, proximidad forzada a canalizaciones de potencia, ascensores, equipos de soldadura. Ahí la inmunidad de Cat7 no es marketing, se mide en errores que dejan de aparecer.",
                    "El blindaje solo funciona si está bien puesto a tierra. Un cable S/FTP con la pantalla sin continuidad o conectada en un solo extremo puede comportarse peor que un buen cable sin pantalla, porque la pantalla actúa como antena. Es la parte que más se descuida en instalaciones baratas y la que revisamos primero cuando nos llaman a diagnosticar una red apantallada que falla.",
                ],
            },
        ],
        updated: '2026-09-09T00:00:00.000Z',
    },
    {
        slug: 'instalador-rj45-barcelona',
        title: 'Instalador RJ45 Barcelona',
        h1: 'Instalador de conectores RJ45 en Barcelona',
        h2s: ['Servicio profesional RJ45', 'Proceso', 'FAQ'],
        intro: 'Instalación y comprobación de conectores RJ45 en Barcelona. Crimpado profesional, colocación de rosetas y testeo de cada punto de red.',
        metaDescription: 'Instalador RJ45 en Barcelona. Crimpado profesional, rosetas y testeo. Servicio rápido y garantizado. ☎ +34 605 974 605',
        cta: '¿Necesitas un instalador RJ45?',
        features: [
            { icon: '🔌', title: 'Crimpado profesional', text: 'Terminación de conectores RJ45 con herramientas de precisión.' },
            { icon: '🔍', title: 'Testeo individual', text: 'Cada conector se verifica con tester profesional.' },
            { icon: '📐', title: 'Cat5e a Cat7', text: 'Trabajamos con todas las categorías de cable Ethernet.' },
            { icon: '🏠', title: 'Domicilio y empresa', text: 'Servicio a domicilio para hogares, oficinas y naves.' },
            { icon: '⚡', title: 'Servicio rápido', text: 'Instalación de puntos RJ45 en el día en Barcelona.' },
            { icon: '✅', title: 'Garantía', text: 'Garantía en cada punto instalado y comprobado.' },
        ],
        faq: [
            { q: '¿Cuánto cuesta instalar un punto RJ45?', a: 'Un punto RJ45 instalado y comprobado cuesta desde 15€ (solo conector) hasta 45-85€ (punto completo con cable y roseta).' },
        ],
        richSections: [
            {
                h2: "Conector macho o roseta: no son intercambiables",
                paragraphs: [
                    "La norma de cableado estructurado no contempla terminar un cable rígido en un conector macho dentro de la pared. El cable de instalación es de hilo rígido y está pensado para conectarse por desplazamiento de aislante en una roseta o un patch panel; los latiguillos flexibles son los que llevan RJ45 macho, porque su hilo multifilar aguanta ser movido.",
                    "Cuando alguien crimpa un RJ45 directamente en un cable rígido y lo deja colgando de la pared, el enlace funciona el primer día y falla meses después, cuando alguien tira del cable al mover una mesa. La reparación exige rehacer el punto entero. Por eso instalamos siempre roseta o patch panel y dejamos el latiguillo como pieza sacrificable.",
                ],
            },
            {
                h2: "T568A o T568B: elegir uno y no mezclarlo",
                paragraphs: [
                    "Las dos secuencias de colores funcionan igual de bien y ninguna es técnicamente superior. Lo que provoca averías es mezclarlas dentro de la misma instalación: si un extremo se remata en A y el otro en B, sale un cable cruzado que en gigabit puede incluso enlazar gracias al auto-MDIX y dejar un fallo latente muy difícil de localizar.",
                    "Cuando entramos a ampliar una red existente, lo primero que hacemos es abrir una roseta y ver qué norma se usó, para continuar con la misma. Y al terminar certificamos cada punto con equipo de medida: mapa de hilos, longitud, atenuación y diafonía, con informe entregado. Un punto sin certificar es una avería aplazada.",
                ],
            },
        ],
        updated: '2026-09-09T00:00:00.000Z',
    },
    {
        slug: 'instalacion-rack-red-barcelona',
        title: 'Instalación Rack de Red Barcelona',
        h1: 'Instalación de rack de red en Barcelona',
        h2s: ['Tipos de rack que instalamos', 'Proceso', 'FAQ'],
        intro: 'Instalación profesional de racks de red en Barcelona. Racks de pared, de suelo y armarios de telecomunicaciones con patch panel y organización de cableado.',
        metaDescription: 'Instalación de rack de red en Barcelona. Racks de pared y suelo, patch panel, organización de cableado. ☎ +34 605 974 605',
        cta: '¿Necesitas instalar un rack de red?',
        features: [
            { icon: '🗄️', title: 'Rack de pared', text: 'Desde 6U hasta 18U para oficinas y PYMES. Instalación limpia en pared.' },
            { icon: '🏗️', title: 'Rack de suelo', text: 'Desde 22U hasta 42U para grandes instalaciones y CPDs.' },
            { icon: '🔗', title: 'Patch panel', text: 'Organización de conexiones con patch panel Cat6/Cat6A/Cat7.' },
            { icon: '🔄', title: 'Organización', text: 'Pasacables, paneles ciegos y gestión de cables profesional.' },
            { icon: '🔌', title: 'Alimentación', text: 'Regletas rack con protección contra sobretensiones.' },
            { icon: '❄️', title: 'Ventilación', text: 'Bandejas de ventilación y termos para racks cerrados.' },
        ],
        faq: [
            { q: '¿Qué tamaño de rack necesito?', a: 'Para una oficina pequeña, un rack de pared 12U es suficiente. Para más de 20 puntos, recomendamos rack de suelo desde 22U.' },
            { q: '¿Incluye el patch panel?', a: 'Ofrecemos instalación de rack con y sin patch panel. El rack con patch panel integrado incluye organización completa.' },
        ],
        richSections: [
            {
                h2: "Elegir el rack por la profundidad, no por las U",
                paragraphs: [
                    "Casi todo el mundo dimensiona un rack contando alturas y se olvida de la profundidad, que es lo que de verdad arruina una instalación. Un switch moderno con fuente redundante puede pasar de 40 cm, y detrás necesita espacio para los latiguillos sin forzar el radio de curvatura. Un armario mural de 45 cm de fondo obliga a doblar el cable contra la puerta.",
                    "Como referencia práctica: mural de 60 cm para un armario de comunicaciones con switch y patch panel; armario de pie de 80 cm o más si va a albergar SAI, servidor o equipamiento con salida trasera. Y siempre dos U libres por encima del equipo activo, porque el aire caliente sale por arriba.",
                ],
            },
            {
                h2: "Ventilación, alimentación y orden de montaje",
                paragraphs: [
                    "El orden dentro del armario no es estético, es térmico y operativo. Patch panels arriba, equipo activo debajo con su panel pasahilos entre medias, y el SAI abajo del todo por peso. Si el armario está en un cuarto cerrado sin renovación de aire, hace falta ventilación forzada con termostato, no un ventilador permanente que solo mete polvo.",
                    "En alimentación entregamos siempre regleta con protección y, cuando el cliente lo aprueba, SAI dimensionado para sostener el switch y el router el tiempo suficiente para un corte breve. Un rack sin respaldo deja la red muerta ante un microcorte que ni siquiera apaga los ordenadores portátiles.",
                ],
            },
        ],
        updated: '2026-09-09T00:00:00.000Z',
    },
    {
        slug: 'instalacion-red-oficina-barcelona',
        title: 'Instalación Red Oficina Barcelona',
        h1: 'Instalación de red para oficinas en Barcelona',
        h2s: ['Soluciones para oficinas', 'Proceso', 'FAQ'],
        intro: 'Instalación completa de red para oficinas en Barcelona. Diseño, cableado estructurado, rack, WiFi empresarial y configuración de red. Todo llave en mano.',
        metaDescription: 'Instalación de red para oficinas en Barcelona. Cableado + rack + WiFi + configuración. Llave en mano. ☎ +34 605 974 605',
        cta: '¿Necesitas montar la red de tu oficina?',
        features: [
            { icon: '🏢', title: 'Solución completa', text: 'Diseño, cableado, rack, WiFi y configuración en un solo servicio.' },
            { icon: '📐', title: 'Diseño personalizado', text: 'Analizamos tu oficina para optimizar la distribución de puntos de red.' },
            { icon: '📡', title: 'WiFi empresarial', text: 'Puntos de acceso profesionales para cobertura total sin zonas muertas.' },
            { icon: '⚙️', title: 'Configuración', text: 'Configuración de switches, VLANs y segmentación de red.' },
            { icon: '🔒', title: 'Seguridad', text: 'Red segmentada con acceso seguro para empleados e invitados.' },
            { icon: '📋', title: 'Documentación', text: 'Planos de red, etiquetado y documentación técnica completa.' },
        ],
        faq: [
            { q: '¿Cuánto cuesta montar la red de una oficina?', a: 'Depende del tamaño: una oficina de 10 puestos desde 2.200€ IVA incluido, de 20 puestos desde 3.500€ IVA incluido, y de 50 puestos desde 7.000€ IVA incluido. Incluye cableado Cat6A, rack, patch panel y switch.' },
            { q: '¿Podéis trabajar fuera de horario?', a: 'Sí, instalamos en horario nocturno o fines de semana para no interrumpir tu actividad.' },
        ],
        richSections: [
            {
                h2: "Cuántos puntos por puesto, y por qué dos",
                paragraphs: [
                    "La regla que aplicamos es dos puntos de red por puesto de trabajo, no uno. El segundo no es lujo: absorbe el teléfono IP, la impresora compartida, la dockstation o el segundo equipo, y evita que aparezca un switch doméstico de cinco puertos debajo de la mesa, que es el origen de una parte importante de las averías que nos llaman a resolver.",
                    "A eso se suman los puntos que no van a ningún puesto y siempre se olvidan en el plano: puntos de acceso WiFi en techo, cámaras, control de accesos, pantalla de sala de reuniones, impresora de planta. Contarlos al principio cuesta una conversación; añadirlos después cuesta abrir el falso techo otra vez.",
                ],
            },
            {
                h2: "Instalar sin parar la oficina",
                paragraphs: [
                    "La mayoría de nuestras instalaciones de oficina en Barcelona se hacen sobre una empresa en funcionamiento, no sobre un local vacío. El tendido y el montaje del rack se pueden hacer en horario laboral con molestia moderada; lo que exige ventana fuera de horario es el cambio de electrónica y la migración de puestos.",
                    "Trabajamos dejando la red antigua operativa mientras se monta la nueva en paralelo, y migramos por zonas. Así, si algo no responde como se esperaba, se vuelve atrás en minutos en lugar de dejar a toda la plantilla sin red a las nueve de la mañana.",
                ],
            },
        ],
        updated: '2026-09-09T00:00:00.000Z',
    },
    {
        slug: 'instalacion-red-casa-barcelona',
        title: 'Instalación Red Casa Barcelona',
        h1: 'Instalación de red doméstica en Barcelona',
        h2s: ['Ventajas del cable en casa', 'Proceso', 'FAQ'],
        intro: 'Instalación de red Ethernet en casa en Barcelona. Mejora tu WiFi, elimina zonas muertas y disfruta de conexión estable en cada habitación.',
        metaDescription: 'Instalación de red en casa en Barcelona. Cable Ethernet + WiFi profesional. Elimina zonas muertas. ☎ +34 605 974 605',
        cta: '¿Quieres mejorar la red de tu casa?',
        features: [
            { icon: '🏠', title: 'Red en toda la casa', text: 'Puntos Ethernet en salón, despacho, dormitorios y zonas comunes.' },
            { icon: '📡', title: 'WiFi sin zonas muertas', text: 'Puntos de acceso conectados por cable para WiFi perfecto en toda la vivienda.' },
            { icon: '🎮', title: 'Gaming y streaming', text: 'Latencia mínima para juegos online y streaming 4K sin buffering.' },
            { icon: '💼', title: 'Teletrabajo', text: 'Conexión estable para videoconferencias y trabajo remoto sin cortes.' },
            { icon: '🔧', title: 'Instalación discreta', text: 'Canaleta decorativa o empotrado para una instalación invisible.' },
            { icon: '💰', title: 'Precio competitivo', text: 'Desde 180€ para 2 puntos de red y desde 350€ para 4 puntos.' },
        ],
        faq: [
            { q: '¿Se puede instalar red Ethernet en un piso ya construido?', a: 'Sí, usamos canaleta decorativa o aprovechamos tubos existentes. En reformas, podemos empotrar el cable.' },
            { q: '¿Cuántos puntos de red necesito en casa?', a: 'Recomendamos mínimo 2 puntos (salón y despacho). Ideal: 4 puntos (añadiendo dormitorios).' },
        ],
        richSections: [
            {
                h2: "El piso del Eixample y sus tubos",
                paragraphs: [
                    "En vivienda de Barcelona la variable que decide el presupuesto es si existe canalización utilizable. En obra reciente casi siempre hay tubo desde el recibidor a las estancias y el trabajo es limpio. En finca antigua del Eixample o Gràcia, con techos altos y molduras, muchas veces no lo hay, y la elección es entre canaleta vista o pasar por el patio de luces.",
                    "Antes de dar precio abrimos una caja y comprobamos si el tubo existente está libre o lo ocupa ya la instalación eléctrica. Compartir tubo con potencia no es solo mala práctica: es la causa más frecuente de una red doméstica que va bien de día y mal cuando arranca el aire acondicionado.",
                ],
            },
            {
                h2: "WiFi que funciona en toda la casa",
                paragraphs: [
                    "Un piso alargado con pasillo largo y paredes de ladrillo macizo no se cubre con un router en el recibidor, por potente que sea. La solución que damos es un punto de acceso cableado en el centro de la vivienda, y en pisos grandes o dúplex, dos unidades alimentadas por PoE trabajando con el mismo nombre de red.",
                    "La diferencia con un repetidor comprado en una tienda es que cada punto de acceso tiene su propio cable de datos hasta el router, sin repetir la señal por el aire. Un repetidor divide el ancho de banda disponible; un punto de acceso cableado no.",
                ],
            },
        ],
        updated: '2026-09-09T00:00:00.000Z',
    },
    {
        slug: 'instalacion-patch-panel-barcelona',
        title: 'Instalación Patch Panel Barcelona',
        h1: 'Instalación de patch panel en Barcelona',
        h2s: ['Por qué necesitas un patch panel', 'Tipos y configuraciones', 'Preguntas frecuentes'],
        intro: 'Instalación y configuración de patch panels en Barcelona para empresas que necesitan gestionar su red de forma profesional. Reducimos el tiempo de reconfiguración de horas a minutos y evitamos errores en la sala de servidores. Panel Cat6, Cat6A o Cat7 de 12, 24 y 48 puertos.',
        metaDescription: 'Instalación patch panel Barcelona. Organización centralizada de red Cat6/Cat6A/Cat7, 12-48 puertos. Etiquetado y testeo incluidos. ☎ +34 605 974 605',
        cta: '¿Necesitas organizar tu sala de servidores?',
        features: [
            { icon: '🔗', title: 'Gestión centralizada', text: 'Todos los cables del edificio terminan en el patch panel. Cambios de configuración en segundos con un latiguillo.' },
            { icon: '🔄', title: 'Reconfiguración sin obra', text: 'Cambiar qué puesto se conecta a qué switch sin tocar el cableado permanente de paredes y techos.' },
            { icon: '📐', title: '12, 24 o 48 puertos', text: 'Patch panels Cat6 y Cat6A de 12, 24 y 48 puertos para adaptarse al tamaño de tu red.' },
            { icon: '🏷️', title: 'Sistema de etiquetado', text: 'Etiquetamos cada puerto con código de color y número para localizar cualquier punto en segundos.' },
            { icon: '🗄️', title: 'Integración con rack', text: 'Montaje en rack estándar 19" con organizador de latiguillos para un acabado impecable.' },
            { icon: '✅', title: 'Testeo puerto a puerto', text: 'Verificamos cada terminación IDC con tester profesional antes de la entrega.' },
        ],
        faq: [
            { q: '¿Qué es un patch panel y para qué sirve?', a: 'Un patch panel es un módulo de conexiones donde terminan todos los cables del edificio. Permite conectar cualquier punto de red a cualquier puerto del switch usando latiguillos cortos, sin tocar el cableado permanente.' },
            { q: '¿Es imprescindible el patch panel?', a: 'Para instalaciones de más de 8-10 puntos sí es muy recomendable. Sin patch panel, los cables van directamente al switch y cualquier cambio requiere mover cables del techo o paredes.' },
            { q: '¿Cuánto cuesta instalar un patch panel en Barcelona?', a: 'Un patch panel de 24 puertos instalado y etiquetado cuesta desde 180€ (sin rack). Con rack de pared 12U incluye desde 350€. Pide presupuesto según tus necesidades.' },
            { q: '¿Puedo añadir un patch panel a una instalación existente?', a: 'Sí, siempre que los cables existentes lleguen al punto donde instalar el rack. Si los cables ya están en un armario, añadir el patch panel es una instalación de medio día.' },
        ],
        richSections: [
            {
                h2: "El patch panel es lo que hace mantenible la red",
                paragraphs: [
                    "Sin patch panel, cada cable de la instalación llega directo al switch. Eso significa que mover un puesto, sustituir un switch o diagnosticar un fallo implica manipular el cable rígido de la instalación, que no está hecho para eso y se degrada con cada tirón. Con panel, todo lo que se toca a diario son latiguillos sustituibles.",
                    "Instalamos el panel con peine ordenador delante y el cable de instalación entrando por detrás con su holgura de servicio, de modo que se pueda reterminar un puerto en el futuro sin quedarse corto de cable. Un panel montado sin esa holgura condena cualquier reparación posterior.",
                ],
            },
            {
                h2: "Etiquetado: la mitad del valor del trabajo",
                paragraphs: [
                    "Un patch panel sin etiquetar sirve exactamente igual que no tenerlo el día que hay una avería. Etiquetamos por puerto con la referencia de la sala y el número de punto, la misma referencia va impresa en la roseta del otro extremo, y entregamos plano y tabla de correspondencias.",
                    "Esta es la parte que se recorta primero cuando se busca precio, y la que más cuesta después: identificar a ciegas qué puerto corresponde a qué sala en una instalación de cuarenta puntos son horas de trabajo que superan lo que costaba etiquetar bien desde el principio.",
                ],
            },
        ],
        updated: '2026-09-09T00:00:00.000Z',
    },

    /* ═══════════════════════════════════════════
       Location-Targeted Pages
       ═══════════════════════════════════════════ */

    {
        slug: 'instalacion-red-barcelona',
        title: 'Instalación de Red en Barcelona — Expertos en Redes',
        h1: 'Instalación de red en Barcelona',
        h2s: ['Todos nuestros servicios de red en Barcelona', 'Zonas y barrios que cubrimos', 'Preguntas frecuentes'],
        intro: 'CableCore es tu empresa de instalación de redes en Barcelona con sede en Badalona. Más de 500 instalaciones completadas en Barcelona ciudad y área metropolitana. Cableado estructurado Cat6/Cat6A/Cat7, fibra óptica, racks, WiFi empresarial y redes domésticas. Técnicos propios, sin subcontratas. Presupuesto en 24h.',
        metaDescription: 'Instalación de red en Barcelona. +500 proyectos completados. Cableado Cat6/Cat6A/Cat7, fibra óptica, racks y WiFi. Técnicos propios. Presupuesto gratis ☎ +34 605 974 605',
        cta: '¿Necesitas instalar red en Barcelona?',
        features: [
            { icon: '🌐', title: 'Servicio integral de red', text: 'Cableado Cat6/Cat6A/Cat7, fibra óptica, racks, patch panels, WiFi empresarial y configuración de switches. Todo en una empresa.' },
            { icon: '🏢', title: 'Empresas y oficinas', text: 'Redes llave en mano para oficinas en el 22@, Diagonal, Eixample y Zona Franca. Diseño, instalación y documentación.' },
            { icon: '🏠', title: 'Hogares y pisos', text: 'Red Ethernet para teletrabajo, gaming y streaming en pisos del Gràcia, Sarrià, Les Corts y Sant Andreu.' },
            { icon: '🏭', title: 'Naves industriales', text: 'Cableado industrial resistente para empresas en Zona Franca, Polígon Pratenc, Polígon Mas Blau y zonas industriales de Barcelona.' },
            { icon: '📍', title: 'Toda el área metropolitana', text: 'Cubrimos Barcelona ciudad, Badalona (sede central), L\'Hospitalet, Cornellà, Sant Cugat, Sabadell, Terrassa y toda el área metropolitana.' },
            { icon: '✅', title: 'Garantía 5 años', text: 'Todas las instalaciones con testeo profesional, documentación y garantía de 5 años en materiales y mano de obra.' },
        ],
        faq: [
            { q: '¿Cuánto cuesta instalar red en Barcelona?', a: 'Punto Cat6 instalado desde 110€ IVA incluido. Punto Cat6A U/FTP desde 130€ IVA incluido. Oficina de 10 puestos (cableado Cat6A + rack + patch panel) desde 2.200€ IVA incluido. Instalación doméstica de 4 puntos Cat6 desde 500€ IVA incluido. Pide presupuesto gratis sin compromiso.' },
            { q: '¿Cuánto tarda una instalación de red en Barcelona?', a: 'Un hogar de 4-8 puntos en 1 día. Oficina de 15-20 puntos en 2-3 días. Proyecto industrial de 50+ puntos en 1-2 semanas. Trabajamos fines de semana para no parar tu negocio.' },
            { q: '¿Trabajáis en toda Barcelona ciudad?', a: 'Sí, cubrimos todos los distritos: Eixample, Gràcia, Sant Martí (22@), Sants-Montjuïc, Zona Franca, Horta-Guinardó, Nou Barris, Sant Andreu, Sarrià-Sant Gervasi y Les Corts.' },
            { q: '¿Usáis subcontratas?', a: 'No. Todos los trabajos los realiza personal propio de CableCore. Sin intermediarios, sin sorpresas. El técnico que hace la visita técnica es el mismo que realiza la instalación.' },
            { q: '¿Podéis instalar red WiFi además del cableado?', a: 'Sí. Complementamos el cableado Ethernet con puntos de acceso WiFi empresarial (Ubiquiti, TP-Link EAP) para cobertura total. El cable es la columna vertebral y el WiFi complementa las zonas móviles.' },
            { q: '¿Sois empresa local o subcontratas el trabajo?', a: 'Somos empresa local con sede en Badalona. No subcontratamos. Los técnicos que hacen la visita son los mismos que instalan, lo que garantiza continuidad y responsabilidad.' },
            { q: '¿Qué cable Cat6, Cat6A o Cat7 recomendáis para una oficina en Barcelona?', a: 'Para oficinas nuevas siempre recomendamos Cat6A U/FTP. Soporta 10 Gbps hasta 100 metros y está preparado para el futuro. Cat6 es adecuado para remodelaciones y hogares. Cat7 no añade ventajas reales sobre Cat6A y es más caro e inflexible.' },
            { q: '¿Podéis hacer instalación de red fuera de horario laboral en Barcelona?', a: 'Sí. Para oficinas en el 22@, Eixample y otras zonas empresariales ofrecemos instalación nocturna y en fines de semana para no interrumpir la actividad de tu empresa.' },
            { q: '¿Instaláis fibra óptica de interior (FTTO) en Barcelona?', a: 'Sí. Para proyectos que requieren ancho de banda superior a 10 Gbps o distancias largas dentro del edificio instalamos fibra óptica interior con conectores LC o SC y latiguillos certificados.' },
        ],
        richSections: [
            {
                h2: 'Tipos de instalación de red que realizamos en Barcelona',
                paragraphs: [
                    'En CableCore realizamos todo tipo de instalaciones de red en Barcelona, adaptadas a las necesidades de cada cliente. Para oficinas en el 22@, el Eixample o la Diagonal, instalamos cableado Cat6A estructurado con rack, patch panel y switch gestionable, siguiendo el estándar TIA-568-C.2. El resultado es una red profesional con documentación completa, testeo canal por canal y garantía de 5 años.',
                    'Para hogares y pisos en Gràcia, Sarrià o Sant Andreu, utilizamos cableado Cat6 con canaleta decorativa o empotrado. En una jornada instalamos entre 4 y 8 puntos de red, preparando el hogar para teletrabajo, streaming 4K y dispositivos NAS.',
                    'Para naves industriales en Zona Franca, Polígon Pratenc o Badalona Sud, trabajamos con cableado Cat6A o Cat7 en bandeja metálica o tubo rígido, resistente a interferencias electromagnéticas y vibraciones. Configuramos redes VLAN para separar producción, administración y videovigilancia.',
                ],
            },
            {
                h2: 'Cableado Cat6A: el estándar recomendado para Barcelona en 2025',
                paragraphs: [
                    'El cable Cat6A (Categoría 6 Aumentada) es el estándar profesional para instalaciones en Barcelona en 2025. Soporta velocidades de 10 Gbps hasta 100 metros, reduce la diafonía alienada (AXT) y es compatible con PoE++ para alimentar cámaras 4K, puntos de acceso WiFi 6E y teléfonos IP de alta potencia.',
                    'Frente al Cat6 estándar, el Cat6A tiene un diámetro mayor (6-8 mm vs 5-6 mm) y requiere cajas de registro más profundas. En proyectos con muchos puntos de red es importante planificar el espacio en la canalización. En CableCore trabajamos exclusivamente con cable Cat6A U/FTP de marcas certificadas como Belden, Nexans o Prysmian para garantizar el rendimiento a lo largo de toda la instalación.',
                    'Si tu empresa en Barcelona planea adoptar tecnología 10 Gbps en los próximos 5-10 años, invertir hoy en Cat6A es más rentable que rehacer la instalación más adelante. El coste adicional de Cat6A frente a Cat6 es de aproximadamente 10-15€ por punto instalado.',
                ],
            },
            {
                h2: 'Precios de instalación de red en Barcelona (2025)',
                paragraphs: [
                    'Los precios de instalación de red en Barcelona varían según el tipo de proyecto, el cableado elegido y el acceso al inmueble. Como referencia orientativa: un punto de red Cat6 instalado con roseta, canaleta y prueba de certificación cuesta desde 110€ IVA incluido. Un punto Cat6A U/FTP (el estándar para oficinas) cuesta desde 130€ IVA incluido. Cat6A S/FTP para entornos industriales, desde 155€ IVA incluido.',
                    'Una instalación básica para oficina de 10 puestos (cableado Cat6A U/FTP + rack de 12U + patch panel + switch 24 puertos) tiene un coste orientativo de 2.200-3.000€ IVA incluido, dependiendo del tipo de acabado y la complejidad. Para hogares, una red de 4 puntos Cat6 en canaleta decorativa parte de 500€ IVA incluido.',
                    'Todos los presupuestos incluyen visita técnica gratuita, materiales certificados, prueba de certificación canal por canal y garantía de 5 años. Solicitá presupuesto sin compromiso: te respondemos en menos de 24 horas.',
                ],
            },
            {
                h2: 'Barrios y zonas de Barcelona donde instalamos red',
                paragraphs: [
                    'Cubrimos todos los distritos de Barcelona ciudad: Eixample (oficinas y hoteles), Gràcia (pisos y estudios), Sant Martí y el 22@ (startups y tech companies), Sants-Montjuïc y Zona Franca (industria y logística), Horta-Guinardó, Nou Barris, Sant Andreu, Sarrià-Sant Gervasi y Les Corts.',
                    'También operamos en toda el área metropolitana de Barcelona: Badalona (sede central, tiempo de respuesta <20 min), L\'Hospitalet de Llobregat, Cornellà, Esplugues, Sant Joan Despí, Gavà, Castelldefels, Viladecans, Sant Boi, Molins de Rei, Martorell, Sant Cugat del Vallès, Cerdanyola, Sabadell, Terrassa, Mataró y Granollers.',
                ],
            },
        ],
    },

    {
        slug: 'instalacion-red-hospitalet',
        title: "Instalación Red L'Hospitalet de Llobregat | CableCore",
        h1: "Instalación de red en L'Hospitalet de Llobregat",
        h2s: ["Servicios de red en L'Hospitalet", "Zonas que cubrimos en L'Hospitalet", 'Preguntas frecuentes'],
        intro: "Instalación de redes en L'Hospitalet de Llobregat, la segunda ciudad más poblada de Cataluña. Cubrimos todas las zonas empresariales de L'Hospitalet: Gran Via, Fira de Barcelona, Zona Franca y el polígono industrial de la Torrassa. Cableado Cat6/Cat6A para oficinas, locales comerciales y viviendas. Presupuesto en el día.",
        metaDescription: "Instalación de red en L'Hospitalet de Llobregat. Cobertura en Gran Via, Fira, Zona Franca y Torrassa. Cat6/Cat6A/Cat7. Presupuesto gratis. ☎ +34 605 974 605",
        cta: "¿Necesitas instalación de red en L'Hospitalet?",
        features: [
            { icon: '🏢', title: "Gran Via y Fira de Barcelona", text: "Instalamos redes en las torres de oficinas de Gran Via y en los recintos y hoteles de la Fira de Barcelona en L'Hospitalet." },
            { icon: '🏭', title: 'Zona Franca y polígonos', text: "Cableado industrial para naves y almacenes en la Zona Franca y el polígono industrial de la Torrassa, frecuentemente visitado desde L'Hospitalet." },
            { icon: '🏠', title: "Barrios residenciales", text: "Red Ethernet en pisos de Collblanc, La Torrassa, Santa Eulàlia, Les Planes y el Centre de L'Hospitalet para teletrabajo y streaming." },
            { icon: '🛍️', title: 'Locales comerciales', text: "Cableado para tiendas, clínicas y consultorios en el eje comercial de L'Hospitalet y el centro comercial L'Illa Diagonal." },
            { icon: '⚡', title: 'Respuesta rápida', text: "Desde Badalona llegamos a L'Hospitalet en menos de 30 minutos. Visitas técnicas el mismo día si hay disponibilidad." },
            { icon: '📋', title: 'Presupuesto gratis', text: "Visita técnica en L'Hospitalet sin coste. Presupuesto detallado en 24 horas." },
        ],
        faq: [
            { q: "¿Cuánto cuesta instalar red en L'Hospitalet?", a: "Aplicamos los mismos precios que en Barcelona ciudad. Un punto Cat6 instalado desde 110€ IVA incluido, sin recargo por desplazamiento a L'Hospitalet. Cat6A U/FTP desde 130€ IVA incluido." },
            { q: "¿Instaláis en las oficinas de Gran Via L'Hospitalet?", a: "Sí, tenemos experiencia en los edificios de oficinas del área de Gran Via, incluyendo torres y plantas diáfanas. Trabajamos fuera de horario laboral si es necesario." },
            { q: "¿Podéis instalar red en un piso en La Torrassa o Collblanc?", a: "Sí, cubrimos todos los barrios de L'Hospitalet. Para pisos usamos canaleta decorativa o aprovechamos la canalización existente para no hacer obra." },
            { q: "¿Cuánto tardáis en llegar a L'Hospitalet?", a: "Nuestra sede está en Badalona, pero L'Hospitalet está a menos de 30 minutos. Podemos hacer visita técnica el mismo día si contactas antes de las 14h." },
            { q: "¿Qué tipo de cableado instaláis en L'Hospitalet?", a: "Instalamos Cat6, Cat6A y fibra óptica interior. Para oficinas nuevas recomendamos Cat6A U/FTP que soporta 10 Gbps y es compatible con PoE++ para cámaras y WiFi 6. Para remodelaciones y hogares, Cat6 es más que suficiente." },
            { q: "¿Cuánto cuesta una red completa para una oficina en L'Hospitalet?", a: "Una oficina de 10 puestos con cableado Cat6A, rack de 12U, patch panel 24 puertos y switch gestionable tiene un coste orientativo de 2.000-2.600€ en L'Hospitalet, sin recargo de desplazamiento." },
        ],
        richSections: [
            {
                h2: "Instalación de red en L'Hospitalet: sectores y zonas",
                paragraphs: [
                    "L'Hospitalet de Llobregat es la segunda ciudad más poblada de Cataluña y alberga uno de los corredores empresariales más activos de España. Gran Via Sud, con sus torres de oficinas y hoteles, concentra gran parte de nuestra actividad: instalamos redes Cat6A estructuradas para empresas que necesitan alta disponibilidad y ancho de banda garantizado.",
                    "La Zona Franca, gestionada desde L'Hospitalet, es otro polo clave donde realizamos instalaciones industriales. Diseñamos redes segregadas mediante VLAN para separar producción, cámaras IP y administración, utilizando cableado Cat6A en bandeja metálica o tubo rígido según las condiciones del entorno.",
                    "En los barrios residenciales de Collblanc, La Torrassa y Santa Eulàlia atendemos a particulares que trabajan desde casa y necesitan una conexión Ethernet fiable para teletrabajo y streaming. Trabajamos con canaleta decorativa o aprovechamos la canalización existente para minimizar el impacto en el piso.",
                ],
            },
            {
                h2: "Precios de instalación de red en L'Hospitalet de Llobregat",
                paragraphs: [
                    "Aplicamos los mismos precios que en Barcelona ciudad, sin recargo por desplazamiento a L'Hospitalet. Un punto de red Cat6 instalado con roseta y prueba de certificación parte desde 110€ IVA incluido. Cat6A U/FTP desde 130€ por punto IVA incluido. Cat6A S/FTP desde 155€ IVA incluido. No cobramos por la visita técnica previa.",
                    "Para proyectos de oficina en L'Hospitalet de 10-20 puestos, el presupuesto orientativo oscila entre 2.200€ y 4.000€ IVA incluido según la complejidad (cableado Cat6A, rack, patch panel, switch y configuración básica de red). Pide presupuesto online y te respondemos en menos de 24 horas.",
                ],
            },
        ],
    },
    {
        slug: 'instalacion-red-badalona',
        title: 'Instalación Red Badalona — Tu Empresa Local',
        h1: 'Instalación de red en Badalona',
        h2s: ['CableCore: empresa local de Badalona', 'Barrios y zonas que cubrimos', 'Preguntas frecuentes'],
        intro: 'CableCore tiene su sede en Carrer Vitor Balaguer 33, Badalona. Somos tu empresa de instalación de redes en Badalona: conocemos la ciudad, sus polígonos industriales (Badalona Sud, Mas Rampinyo) y sus barrios. Tiempo de respuesta mínimo — llegamos a cualquier punto de Badalona en menos de 20 minutos.',
        metaDescription: 'Instalación de red en Badalona. Empresa local con sede en Badalona. Polígonos, oficinas, hogares. Respuesta en el día. Presupuesto gratis. ☎ +34 605 974 605',
        cta: '¿Necesitas red en Badalona?',
        features: [
            { icon: '📍', title: 'Sede en Badalona', text: 'Nuestra oficina está en Carrer Vitor Balaguer 33, Badalona. Somos tu instalador de red local, no una empresa de Barcelona que viene a Badalona.' },
            { icon: '🏭', title: 'Polígonos industriales', text: 'Experiencia en los polígonos de Badalona Sud, Mas Rampinyo, Montigalà y las naves junto a la C-31.' },
            { icon: '🏠', title: 'Todos los barrios', text: 'Instalamos en el Centre, Llefià, La Salut, Gorg, Sant Roc, Artigues, Bufalà, Sistrells y todas las zonas residenciales de Badalona.' },
            { icon: '🏢', title: 'Oficinas y comercios', text: 'Cableado para despachos, clínicas, academias y locales comerciales en el eje de la Av. Martí Pujol y el Mercat Municipal.' },
            { icon: '⚡', title: 'Respuesta en menos de 20 min', text: 'Al estar en Badalona, podemos hacer visita técnica urgente con tiempo de llegada inferior a 20 minutos en la mayoría de casos.' },
            { icon: '🛡️', title: 'Garantía y confianza local', text: 'Empresa conocida en Badalona con más de 10 años de actividad. Garantía 5 años en todas las instalaciones.' },
        ],
        faq: [
            { q: '¿Dónde está vuestra oficina en Badalona?', a: 'Estamos en Carrer Vitor Balaguer 33, 08914 Badalona. Puedes venir a visitarnos o llamar al +34 605 974 605 para concertar una visita técnica.' },
            { q: '¿Cubrís todos los barrios de Badalona?', a: 'Sí, cubrimos toda Badalona: Centre, Llefià, La Salut, Gorg, Sant Roc, Artigues, Bufalà, Sistrells, Pomar, Montigalà y el área industrial.' },
            { q: '¿Hacéis instalaciones en los polígonos de Badalona?', a: 'Sí, tenemos amplia experiencia en los polígonos Badalona Sud y Mas Rampinyo. Instalamos redes industriales Cat6A y Cat7 con canalización IP.' },
            { q: '¿Cuánto cuesta instalar red en Badalona?', a: 'Un punto Cat6 instalado desde 110€ IVA incluido, sin ningún recargo por estar en Badalona. Al ser empresa local, nuestros desplazamientos internos son gratuitos.' },
        ],
        richSections: [
            {
                h2: "Badalona: del polígono de Les Guixeres al casco antiguo",
                paragraphs: [
                    "Tenemos la sede en Carrer Vitor Balaguer 33, así que Badalona no es para nosotros una zona de cobertura más: es el sitio donde recogemos el material por la mañana. Eso cambia el tipo de trabajo que podemos aceptar aquí — averías con desplazamiento en el mismo día, segundas visitas para rematar un detalle, o dejar un tramo tirado y volver al día siguiente sin cargar el presupuesto.",
                    "En Les Guixeres y Badalona Sud trabajamos sobre todo con naves de techo alto, donde el problema no es el cable sino la bandeja: hay que salvar puentes grúa, luminarias y estructura metálica sin dejar el par trenzado pegado a las líneas de fuerza. Ahí tiramos Cat6A apantallado en bandeja de rejilla y separamos siempre la canalización de datos de la de potencia.",
                    "El casco antiguo, Dalt de la Vila y Casagemes son el caso contrario: fincas antiguas, techos de bóveda catalana y regletas de teléfono que nadie ha tocado en treinta años. Aquí casi nunca se puede empotrar, así que trabajamos con canaleta de perfil bajo siguiendo rodapié y marcos de puerta, y cuando el propietario no quiere ver cable proponemos fibra fina por la fachada interior del patio de luces.",
                ],
            },
            {
                h2: "El eje sanitario de Can Ruti y la zona de Montigalà",
                paragraphs: [
                    "La ladera de Can Ruti concentra actividad sanitaria y de investigación alrededor del Hospital Germans Trias i Pujol. En este tipo de instalación lo que nos piden no es velocidad bruta sino trazabilidad: certificación de cada punto con equipo homologado, etiquetado por sala y plano final actualizado, porque un punto sin identificar en un entorno clínico es un punto que nadie se atreve a usar.",
                    "En Montigalà, entre el centro comercial y los edificios de oficinas que lo rodean, la instalación típica es reforma sobre red existente: el cliente ya tiene cableado Cat5e de hace años y quiere subir a Cat6A sin cerrar el local. Solemos hacerlo por fases nocturnas, dejando la red antigua viva mientras montamos el rack nuevo en paralelo y migrando puesto a puesto.",
                ],
            },
        ],
        updated: '2026-09-08T00:00:00.000Z',
    },
    {
        slug: 'instalacion-red-sabadell',
        title: 'Instalación Red Sabadell',
        h1: 'Instalación de red en Sabadell',
        h2s: ['Servicios en Sabadell y el Vallès Occidental', 'Zonas empresariales y residenciales', 'Preguntas frecuentes'],
        intro: 'Instalación de redes en Sabadell para empresas del Vallès Occidental. Cubrimos los polígonos industriales de Can Roqueta, Can Llong, Polígon Nord y la zona empresarial del Eix Macià. Cableado estructurado Cat6, Cat6A y Cat7 para fábricas, oficinas y hogares en Sabadell.',
        metaDescription: 'Instalación de red en Sabadell. Cobertura en Can Roqueta, Eix Macià, polígonos industriales y zona residencial. Cat6/Cat6A/Cat7. ☎ +34 605 974 605',
        cta: '¿Necesitas instalación de red en Sabadell?',
        features: [
            { icon: '🏭', title: 'Polígonos industriales', text: 'Cableado para naves y empresas en Can Roqueta, Can Llong, Polígon Nord y las zonas industriales del sur de Sabadell.' },
            { icon: '🏢', title: 'Eix Macià y centro', text: 'Redes estructuradas para oficinas y despachos en el Eix Macià, Plaça Catalunya y el centro comercial de Sabadell.' },
            { icon: '🏠', title: 'Barrios residenciales', text: 'Red Ethernet en pisos de Can Puiggener, La Creu Alta, Gràcia, Torre-Romeu y todos los barrios de Sabadell.' },
            { icon: '📡', title: 'WiFi en naves', text: 'Instalación de puntos de acceso industriales con cableado Cat6A para cobertura WiFi total en almacenes y naves.' },
            { icon: '📋', title: 'Presupuesto en 24h', text: 'Contacta hoy y recibe presupuesto detallado con desglose de materiales en 24 horas.' },
            { icon: '✅', title: 'Mismos precios que Barcelona', text: 'No aplicamos recargo por desplazamiento a Sabadell. Los precios son idénticos a Barcelona ciudad.' },
        ],
        faq: [
            { q: '¿Hacéis instalaciones en los polígonos de Sabadell?', a: 'Sí, cubrimos Can Roqueta, Can Llong, Polígon Nord y las zonas industriales de Sabadell. Instalamos Cat7 con canalización IP para entornos con polvo o humedad.' },
            { q: '¿Cuánto tardáis en llegar a Sabadell?', a: 'Desde nuestra sede en Badalona, llegamos a Sabadell en 30-40 minutos por la B-23. Podemos hacer visita técnica en el mismo día si contactas antes del mediodía.' },
            { q: '¿Instaláis en chalets de Sabadell?', a: 'Sí, hacemos instalaciones en viviendas unifamiliares. Usamos canaleta decorativa o empotrado según el tipo de construcción y la preferencia del cliente.' },
        ],
        richSections: [
            {
                h2: "Sabadell: naves del Vallès y oficinas del Eix Macià",
                paragraphs: [
                    "Sabadell tiene dos redes distintas conviviendo en la misma ciudad. Por un lado los polígonos — Can Roqueta, Sant Pau de Riu-sec, Els Sagraments — donde predominan la metalurgia, la logística y los talleres, con maquinaria que mete ruido eléctrico en cualquier par sin apantallar. Por otro, el Eix Macià y el centro financiero, con oficinas de banca y servicios que necesitan puestos densos y silenciosos.",
                    "En polígono la decisión técnica casi siempre es la misma y la explicamos antes de presupuestar: Cat6A S/FTP con drenaje de pantalla en ambos extremos. Cuesta más que un Cat6 U/UTP y hay clientes a los que no les compensa, pero en una nave con variadores de frecuencia y soldadura el cable sin pantalla acaba dando errores de CRC que nadie sabe atribuir.",
                    "En el centro el problema es otro: fincas de los años sesenta y setenta con patinillos saturados de instalaciones antiguas. Antes de dar precio subimos a mirar el registro, porque la diferencia entre pasar por un tubo libre y tener que abrir una canalización nueva son varios cientos de euros que preferimos decir el primer día.",
                ],
            },
            {
                h2: "Herencia textil: rehabilitar un vapor sin romperlo",
                paragraphs: [
                    "Buena parte del suelo terciario de Sabadell son antiguas fábricas textiles rehabilitadas. Son edificios agradecidos para una red — naves diáfanas, mucha altura, pocas particiones — pero con dos condicionantes: forjados de vigueta que no siempre admiten taladro donde nos conviene, y protección patrimonial en fachadas y elementos estructurales.",
                    "Nuestra forma de trabajar en estos espacios es no tocar el edificio más de lo imprescindible: bandeja vista bien alineada con la estructura existente, bajadas por columnas técnicas y racks murales cerrados en lugar de armarios de pie cuando el suelo no puede cargarse. El resultado se ve, pero se ve ordenado, que es lo que suele pedir el arquitecto de la reforma.",
                ],
            },
        ],
        updated: '2026-09-08T00:00:00.000Z',
    },
    {
        slug: 'instalacion-red-terrassa',
        title: 'Instalación Red Terrassa',
        h1: 'Instalación de red en Terrassa',
        h2s: ['Servicios en Terrassa', 'Zonas industriales y empresariales', 'Preguntas frecuentes'],
        intro: 'Instalación de redes en Terrassa para empresas y hogares del Vallès Occidental. Experiencia en los polígonos industriales de Ca n\'Aurell, Can Parellada y Vallès Parc Empresarial. Cableado Cat6A y Cat7 para el sector textil e industrial de Terrassa, así como instalaciones domésticas en el centro y zona residencial.',
        metaDescription: 'Instalación de red en Terrassa. Polígonos Ca n\'Aurell, Can Parellada, Vallès Parc. Cat6/Cat6A/Cat7 para industria y hogares. ☎ +34 605 974 605',
        cta: '¿Necesitas red en Terrassa?',
        features: [
            { icon: '🏭', title: 'Industria de Terrassa', text: 'Cableado Cat7 blindado para el sector textil, metalúrgico y empresas del polígono Ca n\'Aurell y Can Parellada.' },
            { icon: '🏢', title: 'Vallès Parc Empresarial', text: 'Redes estructuradas para oficinas en el Vallès Parc Empresarial y la zona de negocios del Passeig de les Lletres.' },
            { icon: '🏗️', title: 'Obra nueva y reforma', text: 'Cableado en edificios nuevos con empotrado o adaptación en locales existentes con canaleta.' },
            { icon: '📡', title: 'WiFi empresarial', text: 'Puntos de acceso WiFi 6 con cableado backbone Cat6A para cobertura total sin zonas muertas.' },
            { icon: '🗄️', title: 'Racks y armarios', text: 'Instalación de armarios de telecomunicaciones para empresas de Terrassa con gestión centralizada.' },
            { icon: '📋', title: 'Sin compromiso', text: 'Visita técnica gratuita y presupuesto detallado. Sin coste de desplazamiento a Terrassa.' },
        ],
        faq: [
            { q: '¿Cubrís Terrassa y alrededores?', a: 'Sí, realizamos instalaciones en Terrassa, Rubí, Matadepera, Ullastrell y municipios del Vallès Occidental. Sin recargo por desplazamiento.' },
            { q: '¿Tenéis experiencia en fábricas de Terrassa?', a: 'Sí, hemos instalado redes en naves industriales del sector textil y metalúrgico. Usamos Cat7 S/FTP para entornos con interferencias electromagnéticas.' },
            { q: '¿Qué tipo de cable recomendáis para una oficina en Terrassa?', a: 'Para oficinas en Terrassa recomendamos Cat6A (10 Gbps). Es el estándar actual para nuevas instalaciones empresariales y la mejor inversión a medio plazo.' },
        ],
        richSections: [
            {
                h2: "Terrassa: parque tecnológico, universidad y polígonos",
                paragraphs: [
                    "Terrassa concentra un tipo de cliente que en otras ciudades del Vallès aparece menos: ingeniería y empresa técnica ligada a la ESEIAAT y al entorno universitario. Son clientes que llegan con el plano hecho y una idea clara de lo que quieren, y lo que esperan de nosotros es ejecución limpia y certificación entregada en formato digital, no una propuesta de diseño.",
                    "En los polígonos — Can Petit, Els Bellots, Santa Margarida, Can Parellada — el trabajo se parece más al de Sabadell: naves, ruido eléctrico y necesidad de segmentar. Donde sí cambia el planteamiento es en las empresas con laboratorio o banco de pruebas, porque conviven equipos de medida sensibles con maquinaria de potencia y hay que separar físicamente los recorridos, no solo por VLAN.",
                ],
            },
            {
                h2: "Cuándo la fibra sale más barata que el cobre",
                paragraphs: [
                    "En Terrassa nos encontramos a menudo con recintos separados: nave y oficina en parcelas distintas, o un edificio con dos alas unidas por un patio. En cuanto la distancia entre racks supera los 90 metros el cobre deja de ser una opción y hay que ir a fibra, y conviene saberlo antes de firmar, no cuando el instalador ya está en obra.",
                    "Para estos enlaces montamos fibra multimodo OM4 si el tramo es interior y corto, o monomodo G.652D si hay que cruzar exterior o dejar margen para crecer. Fusionamos con arco, medimos con OTDR y entregamos el informe de pérdidas de cada empalme. Un enlace bien hecho de este tipo dura toda la vida útil del edificio y evita repetir la obra dentro de cinco años.",
                ],
            },
        ],
        updated: '2026-09-08T00:00:00.000Z',
    },
    {
        slug: 'instalacion-red-sant-cugat',
        title: 'Instalación Red Sant Cugat del Vallès',
        h1: 'Instalación de red en Sant Cugat del Vallès',
        h2s: ['Servicios en Sant Cugat', 'Parques empresariales y urbanizaciones', 'Preguntas frecuentes'],
        intro: 'Instalación de red profesional en Sant Cugat del Vallès para empresas y viviendas de alto standing. Cubrimos el Parc Empresarial Can Sant Joan, el Polígon Industrial Les Planes y las urbanizaciones de Can Baró, Volpelleres y La Floresta. Instalaciones premium con materiales de primera calidad y acabados discretos.',
        metaDescription: 'Instalación de red en Sant Cugat del Vallès. Cobertura en Can Sant Joan, Les Planes y urbanizaciones. Instalaciones premium para hogares y empresas. ☎ +34 605 974 605',
        cta: '¿Necesitas red en Sant Cugat?',
        features: [
            { icon: '🏢', title: 'Parc Empresarial Can Sant Joan', text: 'Cableado estructurado para sedes corporativas y oficinas en el Parc Empresarial Can Sant Joan y el Polígon Les Planes.' },
            { icon: '🏠', title: 'Urbanizaciones exclusivas', text: 'Red Ethernet premium en viviendas de Can Baró, Volpelleres, La Floresta y las urbanizaciones residenciales de Sant Cugat.' },
            { icon: '📐', title: 'Diseño a medida', text: 'Para viviendas grandes de Sant Cugat diseñamos la red optimizando puntos por planta, minimizando el cable visible.' },
            { icon: '🔒', title: 'Redes seguras para empresas', text: 'VLAN, segmentación y acceso WiFi controlado para empresas del parque empresarial. Cumplimiento GDPR.' },
            { icon: '📡', title: 'WiFi mesh para chalets', text: 'Sistemas WiFi mesh con puntos de acceso cableados para cobertura total en chalets de 3 plantas con jardín.' },
            { icon: '✅', title: 'Acabados premium', text: 'Rosetas empotradas, cableado invisible y acabados que respetan la estética de las viviendas de Sant Cugat.' },
        ],
        faq: [
            { q: '¿Hacéis instalaciones en chalets de Sant Cugat?', a: 'Sí, tenemos amplia experiencia en viviendas unifamiliares de Sant Cugat. Instalamos red en todas las plantas con empotrado de cable para un acabado completamente invisible.' },
            { q: '¿Cuánto cuesta cablear un chalet en Sant Cugat?', a: 'Un chalet de 3 plantas con 8-12 puntos de red y WiFi mesh está entre 2.200€ y 4.000€ IVA incluido, dependiendo del tamaño y acabado. Incluye todos los puntos empotrados Cat6A y sistema WiFi profesional.' },
            { q: '¿Instaláis en las empresas del Parc Empresarial Can Sant Joan?', a: 'Sí, tenemos experiencia en el parque empresarial. Instalamos fuera de horario laboral para no interrumpir la actividad y entregamos documentación completa.' },
            { q: '¿Podéis hacer la instalación empotrada sin hacer mucha obra?', a: 'Sí, usamos técnicas de canalización por falso techo técnico o empotrado mínimo por las tabiques. En viviendas de nueva construcción siempre recomendamos empotrado completo.' },
        ],
        richSections: [
            {
                h2: "Sant Cugat: sedes corporativas y casas de gran superficie",
                paragraphs: [
                    "Sant Cugat del Vallès reúne dos encargos que en otras ciudades rara vez coinciden. En Can Sant Joan y el parque empresarial trabajamos con sedes corporativas que traen su propio departamento de sistemas: allí no decidimos la arquitectura, ejecutamos un pliego y lo que se valora es cumplir plazos de obra y entregar certificación completa sin una sola incidencia pendiente.",
                    "En Mira-sol, Valldoreix y La Floresta el cliente es una vivienda unifamiliar de dos o tres plantas con jardín, y el problema técnico es la distancia. Una casa de 400 m² repartida en altura no se resuelve con un router en el salón: hace falta un punto de acceso por planta, alimentado por PoE desde un pequeño rack en el sótano o el garaje, con cableado Cat6A tirado antes de cerrar los falsos techos si la obra lo permite.",
                    "Cuando la casa ya está acabada y no se puede abrir pared, el recorrido suele ir por el exterior. Usamos cable con cubierta resistente a UV grapado bajo el alero y entramos por el punto más discreto de cada estancia. No es la solución más elegante, pero es reversible y no obliga a repicar tabiques.",
                ],
            },
            {
                h2: "Cobertura de jardín, piscina y edificaciones anexas",
                paragraphs: [
                    "Una petición habitual en Sant Cugat es llevar red a un anexo: estudio en el jardín, casa de invitados, caseta de piscina o garaje separado. Si hay menos de 90 metros de recorrido real, incluido lo que sube y baja por muros, va cobre directo enterrado en tubo corrugado. Por encima de esa distancia, o si hay que cruzar una zona con acometida eléctrica, pasamos a fibra para evitar diferencias de potencial entre edificios.",
                    "El punto que más se olvida en estas instalaciones es la protección: un cable de datos que sale al exterior y entra en otro edificio necesita protector de sobretensiones en ambos extremos. Es una pieza barata que evita perder un switch entero en la primera tormenta seria del otoño.",
                ],
            },
        ],
        updated: '2026-09-08T00:00:00.000Z',
    },
    {
        slug: 'instalacion-red-cornella',
        title: 'Instalación Red Cornellà de Llobregat',
        h1: 'Instalación de red en Cornellà de Llobregat',
        h2s: ['Servicios en Cornellà y el Baix Llobregat', 'Polígonos y zonas empresariales', 'Preguntas frecuentes'],
        intro: 'Instalación de redes en Cornellà de Llobregat y el Baix Llobregat. Cubrimos el Polígon Industrial Gran Via Sud, la Zona Industrial de la Almeda y el Parc Empresarial de Cornellà. También instalamos en los barrios residenciales de Sant Ildefons, Gavarra y Almeda. Empresa de confianza en el Baix Llobregat.',
        metaDescription: 'Instalación de red en Cornellà de Llobregat. Polígon Gran Via Sud, Almeda, Parc Empresarial. Baix Llobregat. Cat6/Cat6A/Cat7. ☎ +34 605 974 605',
        cta: '¿Necesitas red en Cornellà?',
        features: [
            { icon: '🏭', title: 'Polígon Gran Via Sud', text: 'Cableado estructurado para naves y almacenes en el Polígon Industrial Gran Via Sud, el más grande del Baix Llobregat.' },
            { icon: '🏢', title: 'Parc Empresarial de Cornellà', text: 'Redes para oficinas y empresas en el Parc Empresarial de Cornellà y la zona de la Almeda.' },
            { icon: '🏠', title: 'Barrios de Cornellà', text: 'Instalaciones en pisos de Sant Ildefons, Gavarra, Almeda, Sant Joan Espí y el centre de Cornellà.' },
            { icon: '📍', title: 'Todo el Baix Llobregat', text: 'Desde Cornellà cubrimos Esplugues, Sant Joan Despí, Sant Just Desvern, Molins de Rei y municipios del Baix Llobregat.' },
            { icon: '⚡', title: 'Servicio rápido', text: 'Presupuesto en 24h, instalación en la fecha que elijas. Sin recargo por desplazamiento al Baix Llobregat.' },
            { icon: '🛡️', title: 'Garantía 5 años', text: 'Garantía extendida de 5 años en todos los materiales y mano de obra.' },
        ],
        faq: [
            { q: '¿Cubrís Cornellà de Llobregat?', a: 'Sí, cubrimos Cornellà y todos los municipios del Baix Llobregat: Esplugues, Sant Joan Despí, Sant Just, El Prat, Gavà, Viladecans, Castelldefels y más.' },
            { q: '¿Instaláis en los polígonos industriales de Cornellà?', a: 'Sí, tenemos experiencia en el Polígon Gran Via Sud y la zona industrial de la Almeda. Instalamos Cat6A y Cat7 para entornos industriales.' },
            { q: '¿Cuánto cuesta instalar red en Cornellà?', a: 'Aplicamos los mismos precios que en Barcelona ciudad. Punto Cat6 desde 110€ IVA incluido, sin recargo por desplazamiento.' },
        ],
        richSections: [
            {
                h2: "Cornellà: Almeda, un parque de oficinas con reglas propias",
                paragraphs: [
                    "Almeda Park y el entorno del World Trade Center concentran la mayor parte de nuestro trabajo en Cornellà, y es un entorno con condicionantes que conviene conocer antes de presupuestar. Son edificios de oficinas en alquiler, con normativa interna de obra, horarios de acceso restringidos y, casi siempre, obligación de trabajar fuera del horario laboral del resto de inquilinos.",
                    "Eso significa que el precio de una instalación aquí no depende solo de los metros de cable: depende de si podemos entrar a las nueve de la mañana o hay que montar de noche, y de si el edificio exige seguro de responsabilidad civil específico y personal acreditado. Lo preguntamos en la primera visita porque cambia el presupuesto de forma sustancial.",
                    "Técnicamente son instalaciones cómodas: suelo técnico registrable, falso techo accesible y patinillos verticales dimensionados. Se puede planificar una planta entera con densidad alta de puestos sin pelearse con la obra civil, que es lo contrario de lo que nos encontramos en el casco urbano.",
                ],
            },
            {
                h2: "Sant Ildefons, Gavarra y la red doméstica en bloque",
                paragraphs: [
                    "Los barrios residenciales de Cornellà son mayoritariamente bloques de vivienda de los años sesenta y setenta. En un piso de estas características el trabajo consiste casi siempre en llevar dos o tres puntos desde el recibidor, donde entra la fibra del operador, hasta el despacho y el salón, sorteando una distribución con pasillo largo y estancias en línea.",
                    "Trabajamos con canaleta blanca de perfil bajo por rodapié, que en estas viviendas queda mucho más limpia de lo que la gente espera, y dejamos roseta empotrada en cada estancia en lugar de cable suelto. Cuando la comunidad lo permite y hay tubo libre desde el rellano, aprovechamos la canalización existente y no se ve nada.",
                ],
            },
        ],
        updated: '2026-09-08T00:00:00.000Z',
    },
    {
        slug: 'instalacion-red-sant-boi',
        title: 'Instalación Red Sant Boi de Llobregat',
        h1: 'Instalación de red en Sant Boi de Llobregat',
        h2s: ['Servicios en Sant Boi', 'Zonas y barrios', 'Preguntas frecuentes'],
        intro: 'Instalación de redes en Sant Boi de Llobregat. Cubrimos el Polígon Industrial Fontsanta, el Parc Industrial de Can Gambús y los barrios residenciales de Marianao, Camps Blancs y Vinyets. Cableado Ethernet para hogares, comercios y empresas en Sant Boi y municipios del Baix Llobregat sur.',
        metaDescription: 'Instalación de red en Sant Boi de Llobregat. Polígon Fontsanta, Can Gambús, Marianao y Camps Blancs. Cat6/Cat6A/Cat7. ☎ +34 605 974 605',
        cta: '¿Necesitas red en Sant Boi?',
        features: [
            { icon: '🏭', title: 'Polígon Fontsanta y Can Gambús', text: 'Cableado industrial para naves y empresas en el Polígon Industrial Fontsanta y el Parc Industrial de Can Gambús.' },
            { icon: '🏠', title: 'Barrios residenciales', text: 'Red Ethernet en pisos de Marianao, Camps Blancs, Vinyets, El Molí y el centro de Sant Boi.' },
            { icon: '🏢', title: 'Negocios locales', text: 'Cableado para clínicas, academias, consultorios y locales comerciales en Sant Boi.' },
            { icon: '📡', title: 'WiFi sin zonas muertas', text: 'Puntos de acceso cableados para eliminar las zonas sin señal en viviendas y locales.' },
            { icon: '📍', title: 'Sur del Baix Llobregat', text: 'Cubrimos Sant Boi, Viladecans, Gavà, Castelldefels y todos los municipios del litoral del Baix Llobregat.' },
            { icon: '✅', title: 'Garantía total', text: 'Cada punto instalado y testado. Garantía de 5 años en materiales y trabajo.' },
        ],
        faq: [
            { q: '¿Instaláis en Sant Boi de Llobregat?', a: 'Sí, cubrimos Sant Boi y toda la zona sur del Baix Llobregat: Viladecans, Gavà, Castelldefels y l\'Aeroport del Prat.' },
            { q: '¿Hacéis instalaciones en los polígonos de Sant Boi?', a: 'Sí, instalamos en el Polígon Fontsanta y Can Gambús. Para entornos industriales recomendamos Cat6A o Cat7 según el nivel de interferencias.' },
            { q: '¿Cuánto cuesta instalar red en Sant Boi?', a: 'Mismos precios que en Barcelona. Punto Cat6 desde 110€ IVA incluido. Sin recargo por desplazamiento al Baix Llobregat.' },
        ],
        richSections: [
            {
                h2: "Sant Boi: invernadero, industria y el Parc Agrari",
                paragraphs: [
                    "Sant Boi tiene un perfil que no se repite en el resto del Baix Llobregat: junto a los polígonos convencionales de Salinas y Sant Boi Nord está el Parc Agrari, con explotaciones que se han ido digitalizando. Instalar red en un invernadero no se parece a instalar en una nave: hay humedad permanente, condensación, riego por aspersión y estructura metálica que lo complica todo.",
                    "Ahí no vale material de interior. Usamos cable con cubierta apta para exterior, cajas con grado de protección IP adecuado y puntos de acceso preparados para ambiente húmedo. Los equipos activos van siempre en un armario estanco en zona técnica, nunca colgados en el propio invernadero, por mucho que quede más cerca del punto de servicio.",
                    "En las explotaciones con sensórica de riego y control de clima el requisito real no es el ancho de banda sino la continuidad: una red que se cae media hora no rompe nada en una oficina, pero en un ciclo de riego automatizado sí. Por eso planteamos alimentación protegida para el rack y, cuando el presupuesto lo permite, un enlace de respaldo.",
                ],
            },
            {
                h2: "Cercanía al aeropuerto y entornos con mucha radiofrecuencia",
                paragraphs: [
                    "La proximidad al aeropuerto y a los grandes ejes viarios hace que en algunas zonas de Sant Boi el espectro de 2,4 GHz esté especialmente cargado. Es una de esas cosas que no se detectan hasta que el WiFi va mal sin motivo aparente y el cliente lleva meses culpando al operador.",
                    "Cuando pasa esto hacemos un estudio de canales antes de tocar nada y, si el entorno lo justifica, planteamos la cobertura en 5 GHz con más puntos de acceso de menor potencia en lugar de pocos y muy potentes. Casi siempre la solución real es cable: llevar Ethernet hasta donde está el usuario y dejar el WiFi solo para lo que de verdad tiene que ser inalámbrico.",
                ],
            },
        ],
        updated: '2026-09-08T00:00:00.000Z',
    },
    {
        slug: 'instalacion-red-castelldefels',
        title: 'Instalación Red Castelldefels',
        h1: 'Instalación de red en Castelldefels',
        h2s: ['Red para viviendas de Castelldefels', 'WiFi en exteriores y jardines', 'Preguntas frecuentes'],
        intro: 'Instalación de redes en Castelldefels para chalets, apartamentos y empresas de la zona costera del Garraf. Especialistas en viviendas unifamiliares con jardín y segunda residencia: instalamos cable en todas las plantas y puntos de acceso WiFi exterior para terrazas y piscinas. También cubrimos el Parc Empresarial de Castelldefels y la zona de Gavà Mar.',
        metaDescription: 'Instalación de red en Castelldefels. Chalets, segunda residencia, WiFi exterior para jardines. Parc Empresarial Castelldefels. ☎ +34 605 974 605',
        cta: '¿Necesitas red en Castelldefels?',
        features: [
            { icon: '🏖️', title: 'Chalets y segunda residencia', text: 'Especialistas en viviendas de Castelldefels, Gavà Mar y Sitges. Red Ethernet en todas las plantas y WiFi para jardín y piscina.' },
            { icon: '📡', title: 'WiFi exterior profesional', text: 'Puntos de acceso exterior IP65 conectados por cable para cobertura WiFi perfecta en terrazas, jardines y piscinas.' },
            { icon: '🏢', title: 'Parc Empresarial de Castelldefels', text: 'Cableado estructurado para empresas tecnológicas y oficinas en el Parc Empresarial de Castelldefels junto a la B-23.' },
            { icon: '🎮', title: 'Gaming y smart home', text: 'Red de baja latencia para gaming competitivo y soporte técnico para dispositivos domóticos y smart home.' },
            { icon: '🏘️', title: 'Toda la costa del Garraf', text: 'Servicio en Castelldefels, Gavà, Gavà Mar, Sitges, Vilanova i la Geltrú y municipios de la costa del Garraf.' },
            { icon: '🛡️', title: 'Materiales para el exterior', text: 'Cables y conectores certificados para exteriores, resistentes a la humedad y exposición solar del litoral mediterráneo.' },
        ],
        faq: [
            { q: '¿Hacéis instalaciones en chalets de Castelldefels?', a: 'Sí, es uno de nuestros servicios principales en la zona. Instalamos red en todas las plantas del chalet con cable empotrado o canaleta y añadimos WiFi exterior para jardín y terraza.' },
            { q: '¿Podéis instalar WiFi en el jardín o junto a la piscina?', a: 'Sí, instalamos puntos de acceso exterior certificados IP65, resistentes al agua y al sol. Se conectan por cable desde el interior para señal estable en toda la parcela.' },
            { q: '¿Instaláis en segunda residencia?', a: 'Sí, hacemos instalaciones en segunda residencia. Podemos coordinar el acceso con el servicio de limpieza o conserje y enviarte el informe de la instalación por email.' },
            { q: '¿Cuánto cuesta cablear un chalet en Castelldefels?', a: 'Un chalet de 2 plantas con 6-10 puntos de red y WiFi exterior cuesta entre 1.800€ y 3.200€ IVA incluido, según el tamaño y acabados. Pide presupuesto sin compromiso.' },
        ],
        richSections: [
            {
                h2: "Castelldefels: chalets en ladera y el campus del Mediterrani",
                paragraphs: [
                    "En Castelldefels la instalación tipo es una vivienda unifamiliar en Bellamar, Montemar o Vista Alegre, y la dificultad no está en el cable sino en el terreno. Son parcelas en pendiente, con la casa en varios niveles y a menudo un anexo o un garaje a media ladera. Un único router en la planta principal deja siempre alguna estancia sin cobertura utilizable.",
                    "Nuestro planteamiento habitual es un rack pequeño en el nivel inferior, cableado Cat6A a cada planta y puntos de acceso alimentados por PoE en el techo del pasillo de cada nivel, que es donde mejor reparten. Si hay piscina o porche con uso real, se lleva un punto exterior con equipo preparado para intemperie, no un doméstico metido en una caja.",
                    "La cercanía al mar añade un factor que en el interior no existe: salinidad. En instalaciones exteriores usamos herrajes y cajas resistentes a la corrosión, porque el material estándar en primera línea se degrada en un par de temporadas y luego la avería aparece en el sitio más incómodo.",
                ],
            },
            {
                h2: "Hoteles del paseo marítimo y el entorno tecnológico de la UPC",
                paragraphs: [
                    "El Parc Mediterrani de la Tecnologia y el campus de la UPC han traído a Castelldefels empresas de telecomunicaciones y aeronáutica con exigencias por encima de la media: densidad alta de puntos, documentación completa y, en algunos casos, separación física entre red de gestión y red de usuario.",
                    "En el frente hotelero del paseo marítimo el reto es distinto y muy concreto: instalar por plantas sin cerrar el hotel. Trabajamos por alas, dejando siempre la mitad del edificio operativa, con cableado horizontal desde el armario de planta y puntos de acceso en pasillo, que da mejor reparto que el equipo dentro de cada habitación y simplifica el mantenimiento posterior.",
                ],
            },
        ],
        updated: '2026-09-08T00:00:00.000Z',
    },
    {
        slug: 'instalacion-red-mataro',
        title: 'Instalación Red Mataró',
        h1: 'Instalación de red en Mataró',
        h2s: ['Servicios en Mataró y el Maresme', 'Zonas industriales y empresariales', 'Preguntas frecuentes'],
        intro: 'Instalación de redes en Mataró para empresas y hogares del Maresme. Cubrimos el Polígono Industrial Pla d\'en Boet, el Parc Empresarial de la Mata y el Centro Comercial Mataró Park. Cableado Cat6, Cat6A y Cat7 para la industria mataronina, despachos del centro y viviendas en Els Molins, Cirera y Rocafonda.',
        metaDescription: 'Instalación de red en Mataró. Polígono Pla d\'en Boet, Parc Empresarial La Mata, centro y barrios residenciales. Cat6/Cat6A/Cat7. ☎ +34 605 974 605',
        cta: '¿Necesitas red en Mataró?',
        features: [
            { icon: '🏭', title: 'Polígono Pla d\'en Boet', text: 'Cableado estructurado para empresas del Polígono Industrial Pla d\'en Boet, el mayor de Mataró, con más de 300 empresas.' },
            { icon: '🏢', title: 'Centro y eje comercial', text: 'Redes para despachos, consultorios y comercios en el centro de Mataró y la zona de la Rambla.' },
            { icon: '🏠', title: 'Barrios residenciales', text: 'Instalación Ethernet en pisos y casas de los barrios Els Molins, Cirera, Rocafonda, Vista Alegre y Cerdanyola.' },
            { icon: '🏪', title: 'Mataró Park', text: 'Experiencia en locales comerciales y oficinas del centro comercial Mataró Park y la zona de gran consumo.' },
            { icon: '⚡', title: 'Presupuesto en 24h', text: 'Respondemos el presupuesto en 24 horas y podemos hacer la visita técnica al día siguiente si es necesario.' },
            { icon: '📊', title: 'Testeo profesional', text: 'Medimos cada par de cables con analizador profesional. Informe de testeo incluido.' },
        ],
        faq: [
            { q: '¿Llegáis hasta Mataró?', a: 'Sí, cubrimos toda la comarca del Maresme desde Montgat hasta Mataró y Arenys de Mar. Sin recargo por desplazamiento.' },
            { q: '¿Los precios son iguales que en Barcelona?', a: 'Sí, nuestros precios son los mismos en toda el área metropolitana y el Maresme. Sin recargos por distancia.' },
            { q: '¿Instaláis en los polígonos de Mataró?', a: 'Sí, tenemos experiencia en el Polígon Pla d\'en Boet y el Parc Empresarial La Mata. Instalamos Cat6A para oficinas y Cat7 para naves industriales.' },
        ],
        richSections: [
            {
                h2: "Mataró: TecnoCampus, Pla d'en Boet y la ciudad textil",
                paragraphs: [
                    "Mataró funciona como capital del Maresme y eso se nota en el tipo de encargo: no son sucursales de empresas de Barcelona, son empresas con sede aquí que quieren resolver su red de una vez. En el entorno del TecnoCampus y El Rengle predominan las empresas jóvenes, con oficina diáfana y crecimiento previsto, y ahí lo importante es dejar canalización con margen para el doble de puestos de los que hay hoy.",
                    "En Pla d'en Boet y Mata-Rocafonda el tejido es industrial clásico, con parte de género de punto y confección todavía activo. Son naves donde conviven máquinas antiguas y sistemas de gestión nuevos, y el trabajo más frecuente es llevar red fiable hasta el taller sin depender del WiFi que rebota entre estanterías metálicas.",
                ],
            },
            {
                h2: "Instalar en una nave con estanterías metálicas altas",
                paragraphs: [
                    "El almacén con racking alto es probablemente el peor escenario posible para una red inalámbrica: el metal refleja, los pasillos actúan como guías de onda y la cobertura cambia por completo según lo lleno que esté el almacén. Un mapa de cobertura medido en enero con las estanterías vacías no sirve en temporada alta.",
                    "La solución que damos en Mataró y en todo el Maresme es cableado hasta los extremos y puntos de acceso en el eje de los pasillos, no en las paredes, con antenas orientadas hacia abajo. Sale más caro en instalación que colgar dos equipos potentes en las esquinas, pero es la diferencia entre un terminal de radiofrecuencia que lee siempre y uno que falla justo cuando hay trabajo.",
                ],
            },
        ],
        updated: '2026-09-08T00:00:00.000Z',
    },
    {
        slug: 'instalacion-red-granollers',
        title: 'Instalación Red Granollers',
        h1: 'Instalación de red en Granollers',
        h2s: ['Servicios en Granollers y el Vallès Oriental', 'Polígonos y zonas empresariales', 'Preguntas frecuentes'],
        intro: 'Instalación de redes en Granollers para empresas del Vallès Oriental. Cubrimos el Polígono Industrial Les Franqueses, Can Prat, el Parque Industrial de Granollers y la zona del Mercado Central. Cableado Cat6, Cat6A y Cat7 para la industria del Vallès Oriental, oficinas del centro de Granollers y viviendas en La Garriga, Mollet y Canovelles.',
        metaDescription: 'Instalación de red en Granollers. Polígono Les Franqueses, Can Prat, Parque Industrial. Vallès Oriental. Cat6/Cat6A/Cat7. ☎ +34 605 974 605',
        cta: '¿Necesitas red en Granollers?',
        features: [
            { icon: '🏭', title: 'Polígonos del Vallès Oriental', text: 'Cableado estructurado para empresas en el Polígono Les Franqueses, Can Prat y el Parque Industrial de Granollers y Canovelles.' },
            { icon: '🏢', title: 'Centro de Granollers', text: 'Redes para oficinas, despachos y comercios en el centro de Granollers y la zona del Mercado Central.' },
            { icon: '🏠', title: 'Municipios del Vallès Oriental', text: 'Instalación Ethernet en viviendas de Granollers, Mollet del Vallès, La Garriga, Parets del Vallès y Cardedeu.' },
            { icon: '📡', title: 'WiFi para naves', text: 'Puntos de acceso WiFi 6 con cableado backbone Cat6A para cobertura total en almacenes y naves industriales.' },
            { icon: '📋', title: 'Presupuesto 24h', text: 'Contacta hoy y recibe presupuesto detallado en 24 horas. Visita técnica sin compromiso en Granollers.' },
            { icon: '✅', title: 'Garantía 5 años', text: 'Materiales de calidad con garantía extendida de 5 años en todos los trabajos.' },
        ],
        faq: [
            { q: '¿Hacéis instalaciones en Granollers?', a: 'Sí, cubrimos Granollers y todo el Vallès Oriental: Mollet del Vallès, La Garriga, Parets del Vallès, Cardedeu, Les Franqueses y Aiguafreda.' },
            { q: '¿Instaláis en los polígonos de Granollers?', a: 'Sí, trabajamos en el Polígon Les Franqueses, Can Prat y el Parc Industrial de Granollers. Para naves industriales recomendamos Cat6A o Cat7 según las interferencias.' },
            { q: '¿Los precios son los mismos que en Barcelona?', a: 'Sí, mismos precios en todo el Vallès Oriental. Sin recargo por desplazamiento a Granollers.' },
        ],
        richSections: [
            {
                h2: "Granollers: logística sobre la AP-7 y la C-17",
                paragraphs: [
                    "El tejido empresarial de Granollers está marcado por su posición en el cruce de la AP-7 y la C-17, lo que ha concentrado logística y distribución en Font del Ràdium, Congost y Coll de la Manya. Son naves de gran superficie donde el cableado tiene que llegar a muelle de carga, oficina de tráfico y zona de picking, tres entornos con requisitos distintos dentro del mismo edificio.",
                    "En muelle instalamos con protección mecánica reforzada, porque es la zona donde antes o después algo golpea la instalación. En la oficina de tráfico prima la densidad de puestos y la continuidad, ya que es el punto donde se para toda la operación si cae la red. Y en picking casi siempre hay terminales de radiofrecuencia, que dependen más de la calidad de la cobertura que del ancho de banda.",
                ],
            },
            {
                h2: "Industria alimentaria: limpieza con agua a presión",
                paragraphs: [
                    "El sector cárnico y alimentario tiene un peso importante en el Vallès Oriental y plantea una exigencia que no aparece en ningún otro cliente: la instalación tiene que aguantar limpiezas diarias con agua a presión y productos químicos. El material de interior estándar no dura en una sala de despiece.",
                    "En estos entornos trabajamos con cajas y conectividad de grado industrial, tubo rígido en lugar de canaleta y sellado en cada paso de tabique, para que el agua no encuentre camino hacia el interior de la canalización. El equipamiento activo va siempre fuera de la sala de proceso, en un local técnico, con solo el cableado pasante entrando en zona húmeda.",
                ],
            },
        ],
        updated: '2026-09-08T00:00:00.000Z',
    },

    /* ═══════════════════════════════════════════
       FIBRA ÓPTICA — SEO Pages
       ═══════════════════════════════════════════ */

    {
        slug: 'instalacion-fibra-optica-barcelona',
        title: 'Instalación de Fibra Óptica Barcelona',
        h1: 'Instalación de fibra óptica en Barcelona',
        h2s: ['Servicios de fibra óptica en Barcelona', 'Equipamiento y tecnología que usamos', 'Preguntas frecuentes'],
        intro: 'Instalación de fibra óptica en Barcelona por técnicos certificados. Realizamos fusiones por arco eléctrico, tendido de fibra monomodo (SM) y multimodo (OM3/OM4), instalación de racks y bandejas de empalme, y testeo OTDR de cada hilo. Especialistas en FTTH para comunidades de vecinos y enlaces de backbone empresarial en Barcelona y área metropolitana.',
        metaDescription: 'Instalación fibra óptica Barcelona. Técnicos certificados: fusión por arco, OTDR, monomodo/multimodo, FTTH edificios. Presupuesto gratis. ☎ +34 605 974 605',
        cta: '¿Necesitas instalar fibra óptica en Barcelona?',
        features: [
            { icon: '🔥', title: 'Fusión por arco eléctrico', text: 'Empalmes con fusionadora Fujikura de última generación. Atenuación típica < 0.02 dB, muy por debajo del máximo admisible.' },
            { icon: '📊', title: 'Testeo OTDR incluido', text: 'Medimos cada fibra con reflectómetro óptico EXFO. Entregamos informe gráfico del trazado y las pérdidas de cada empalme y conector.' },
            { icon: '🔆', title: 'Monomodo y multimodo', text: 'Instalamos fibra SM G.657A (FTTH), SM G.652D (larga distancia), OM3 y OM4 (backbone de edificio).' },
            { icon: '🏢', title: 'FTTH para comunidades', text: 'Instalamos FTTH vertical en edificios de Barcelona: desde el rack del cuarto de telecomunicaciones hasta la roseta SC/APC de cada vivienda.' },
            { icon: '🗄️', title: 'Racks y bandejas', text: 'Instalamos racks de fibra 19", bandejas de empalme 1U, cajas de segregación y cajas murales para organización profesional.' },
            { icon: '⚡', title: 'Urgencias 24/7', text: 'Servicio de reparación de fibra cortada o dañada en Barcelona con respuesta de urgencia. Disponible 24 horas, 7 días a la semana.' },
        ],
        faq: [
            { q: '¿Cuánto cuesta instalar fibra óptica en Barcelona?', a: 'Un punto de fibra instalado con fusión y testeo cuesta desde 55€. Un proyecto FTTH para un edificio de 10 viviendas está entre 2.500€ y 4.500€ con rack, fusiones y rosetas incluidas. Pide presupuesto sin compromiso.' },
            { q: '¿Qué diferencia hay entre fibra monomodo y multimodo?', a: 'La fibra monomodo (SM G.657A) es para distancias medias-largas y es el estándar en FTTH y conexiones entre edificios. La multimodo (OM3/OM4) se usa dentro de edificios para distancias cortas con velocidades de 10-100 Gbps entre switches.' },
            { q: '¿Hacéis fusión de fibra óptica en Barcelona?', a: 'Sí, realizamos fusiones por arco eléctrico con fusionadora profesional Fujikura. Cada fusión se mide con OTDR y se documenta en informe técnico.' },
            { q: '¿Instaláis FTTH en edificios de viviendas de Barcelona?', a: 'Sí, instalamos FTTH vertical en comunidades de vecinos: desde el rack del sótano o cuarto técnico hasta la roseta SC/APC de cada piso. Trabajamos con administradores de fincas.' },
            { q: '¿Tenéis servicio de urgencia para fibra cortada?', a: 'Sí, ofrecemos servicio de urgencia 24/7 para reparación de fibra dañada en Barcelona. Llamada al +34 605 974 605 y enviamos técnico en el menor tiempo posible.' },
            { q: '¿Qué es la fibra óptica FTTH y cómo funciona en un edificio?', a: 'FTTH (Fiber To The Home) lleva la fibra óptica directamente al piso del usuario. En un edificio, instalamos un splitter óptico en el cuarto técnico o sótano, y tendemos fibra individual a cada vivienda terminando en una roseta SC/APC. Cada vecino conecta su router directamente a esa roseta.' },
            { q: '¿Cuánto tiempo tarda instalar fibra óptica en un edificio de Barcelona?', a: 'Un edificio de 10 viviendas se instala en 2-3 días con un equipo de dos técnicos. Incluye instalación del rack, tendido de fibra por canalización, fusiones en la bandeja de empalme, tiro al piso y certificación OTDR.' },
        ],
        richSections: [
            {
                h2: 'Tipos de instalación de fibra óptica que realizamos en Barcelona',
                paragraphs: [
                    'En CableCore especializamos en tres tipos principales de instalación de fibra óptica en Barcelona. FTTH para comunidades de vecinos: instalamos la red vertical de fibra desde el punto de interconexión (PTR) del operador hasta cada vivienda, con fusiones y testeo OTDR completo. Es el tipo de proyecto más habitual que realizamos en edificios del Eixample, Gràcia y Sarrià.',
                    'Backbone de edificio empresarial: conectamos los armarios de telecomunicaciones de cada planta con fibra multimodo OM4 para velocidades de 10 a 100 Gbps entre switches de distribución. Ideal para edificios de oficinas en el 22@, hoteles de cuatro estrellas y hospitales.',
                    'Interconexión entre edificios: cuando dos naves industriales o edificios de la misma empresa están a menos de 500 metros, instalamos fibra monomodo directamente enterrada o en canalización para un enlace privado sin costes recurrentes de operador. Este servicio es especialmente demandado en el Polígon Pratenc y Zona Franca.',
                ],
            },
            {
                h2: 'Fibra óptica en Barcelona: qué tipo elegir',
                paragraphs: [
                    'La elección del tipo de fibra depende de la distancia y la velocidad requerida. Para FTTH en edificios residenciales usamos fibra monomodo G.657A.2, que es resistente a curvaturas pequeñas y facilita el tendido por tubos de pequeño diámetro. Para backbone de edificios de hasta 300 metros usamos multimodo OM4 con latiguillo LC-LC y transceptores SFP+ para 10 Gbps. Para distancias superiores a 300 metros o entre edificios, la fibra monomodo G.652D es el estándar.',
                    'En todos los casos, testeo OTDR está incluido en el presupuesto. Entregamos un informe gráfico de cada hilo, mostrando las pérdidas en cada fusión, conector y curva. La atenuación total de la fibra instalada por CableCore es siempre inferior al 80% del límite normativo, lo que garantiza margen para futuras ampliaciones.',
                ],
            },
        ],
    },
    {
        slug: 'instalacion-fibra-optica-empresas-barcelona',
        title: 'Fibra Óptica para Empresas Barcelona',
        h1: 'Instalación de fibra óptica para empresas en Barcelona',
        h2s: ['Soluciones de fibra empresarial', 'Tecnología y equipamiento', 'Preguntas frecuentes'],
        intro: 'Fibra óptica para empresas en Barcelona. Interconexión de sedes, backbone de red, enlaces de alta velocidad y redes de campus con fibra monomodo y multimodo. Comprobación profesional.',
        metaDescription: 'Fibra óptica para empresas en Barcelona. Backbone de red, interconexión de sedes, enlaces 10/40/100 Gbps. Presupuesto gratis. ☎ +34 605 974 605',
        cta: '¿Tu empresa necesita fibra óptica?',
        features: [
            { icon: '🚀', title: 'Alta velocidad', text: 'Enlaces de 10, 40 y 100 Gbps con fibra monomodo y multimodo OM4.' },
            { icon: '🏢', title: 'Interconexión de sedes', text: 'Conectamos oficinas, almacenes y centros de datos con enlaces de fibra dedicados.' },
            { icon: '📡', title: 'Backbone de red', text: 'Fibra óptica como columna vertebral de la red empresarial para máximo rendimiento.' },
            { icon: '🔒', title: 'Seguridad', text: 'La fibra óptica es inmune a interferencias electromagnéticas y difícil de interceptar.' },
            { icon: '📐', title: 'Diseño a medida', text: 'Diseñamos la topología de fibra ideal para tu infraestructura empresarial.' },
            { icon: '✅', title: 'Comprobación completa', text: 'Cada enlace testeado con OTDR e informe técnico detallado.' },
        ],
        faq: [
            { q: '¿Merece la pena fibra óptica para mi empresa?', a: 'Si manejas grandes volúmenes de datos, tienes varias sedes o necesitas enlaces superiores a 1 Gbps, la fibra óptica es la opción más rentable a largo plazo.' },
            { q: '¿Se puede usar fibra óptica junto con cable Ethernet?', a: 'Sí, es lo más habitual. La fibra se usa como backbone entre plantas o edificios, y el Ethernet Cat6A para la distribución a los puestos de trabajo.' },
        ],
        richSections: [
            {
                h2: "Cuándo una empresa necesita fibra de verdad",
                paragraphs: [
                    "Muchas empresas piden fibra cuando lo que tienen es un problema de red local, no de acceso. Si el cuello de botella está entre el puesto y el servidor, una línea de fibra del operador no cambia nada: el tráfico ni siquiera sale del edificio. Lo miramos antes de proponer nada, porque la solución puede ser mucho más barata de lo que el cliente espera.",
                    "La fibra propia sí es la respuesta en tres casos concretos: enlazar edificios o naves separadas, subir el backbone entre plantas por encima de lo que el cobre permite, y aislar eléctricamente dos zonas de la instalación. En esos tres, el cobre no es una alternativa peor sino directamente inviable.",
                ],
            },
            {
                h2: "Lo que entregamos al terminar",
                paragraphs: [
                    "Un enlace de fibra empresarial se entrega con documentación o no se ha entregado. Damos informe OTDR de cada hilo con la traza gráfica, tabla de pérdidas por empalme y conector, esquema del recorrido con ubicación de cajas de empalme, y etiquetado físico en ambos extremos.",
                    "Esto no es burocracia: el día que el enlace falle, esa traza es lo que permite saber en qué metro está el problema en lugar de abrir el edificio entero. Sin línea base medida el día de la instalación, no hay con qué comparar y el diagnóstico empieza de cero.",
                ],
            },
        ],
        updated: '2026-09-09T00:00:00.000Z',
    },
    {
        slug: 'cableado-fibra-optica-interior-barcelona',
        title: 'Cableado de Fibra Óptica Interior Barcelona',
        h1: 'Cableado de fibra óptica interior en Barcelona',
        h2s: ['Tipos de cableado interior', 'Materiales y acabados', 'Preguntas frecuentes'],
        intro: 'Instalación de cableado de fibra óptica en interiores en Barcelona. Fibra tight-buffer para distribución interior, con canaleta, falso techo o conductos existentes. Acabados profesionales y discretos.',
        metaDescription: 'Cableado de fibra óptica interior en Barcelona. Instalación profesional, acabados discretos. Presupuesto gratis. ☎ +34 605 974 605',
        cta: '¿Necesitas cableado de fibra interior?',
        features: [
            { icon: '🏠', title: 'Fibra interior', text: 'Cable tight-buffer LSZH para instalaciones interiores, conforme a normativa de incendios CPR.' },
            { icon: '📏', title: 'Canaleta decorativa', text: 'Instalación con canaleta para mantener la estética del espacio.' },
            { icon: '🏗️', title: 'Falso techo', text: 'Tendido de fibra por falso techo para instalaciones invisibles.' },
            { icon: '🔧', title: 'Conductos existentes', text: 'Aprovechamos canalizaciones existentes para minimizar obra.' },
            { icon: '🔌', title: 'Rosetas SC/APC', text: 'Puntos de conexión con rosetas ópticas de 2 puertos SC/APC.' },
            { icon: '🗄️', title: 'Cajas murales', text: 'Cajas de terminación de fibra para organización en cada punto.' },
        ],
        faq: [
            { q: '¿Se nota la instalación de fibra interior?', a: 'No si se hace bien. Usamos canaleta mini decorativa o falso techo para que la instalación sea prácticamente invisible.' },
            { q: '¿Qué tipo de cable se usa en interior?', a: 'Usamos cable tight-buffer monomodo con cubierta LSZH (baja emisión de humos), cumpliendo la normativa CPR de seguridad contra incendios.' },
        ],
        richSections: [
            {
                h2: "Fibra dentro del edificio: qué tipo y por qué",
                paragraphs: [
                    "Para vertical de edificio y backbone entre plantas usamos monomodo G.657.A2, que tolera radios de curvatura muy cerrados sin penalización apreciable. Es la diferencia entre poder subir por un patinillo estrecho con codos reales y tener que buscar un recorrido más largo por falta de holgura.",
                    "Cuando el enlace es corto y ya existe electrónica multimodo, OM4 sigue siendo válido y más barato en transceptores. Pero para obra nueva planteamos monomodo casi siempre: el coste del cable es similar y no impone un techo de distancia ni de velocidad al edificio dentro de diez años.",
                ],
            },
            {
                h2: "Cable interior no es cable exterior",
                paragraphs: [
                    "El cable de interior lleva cubierta libre de halógenos y baja emisión de humos, y eso no es un detalle de catálogo: en caso de incendio un cable con cubierta convencional dentro de un patinillo llena de humo tóxico las vías de evacuación del edificio. Es requisito normativo, y lo verificamos antes de tirar un metro.",
                    "Al revés también importa: el cable de interior no está preparado para humedad ni radiación solar. En tramos que salen a patio, cubierta o fachada, aunque sean dos metros, cambiamos a cable con protección para exterior y hacemos la transición en caja, no a mitad de recorrido.",
                ],
            },
        ],
        updated: '2026-09-09T00:00:00.000Z',
    },
    {
        slug: 'fusion-fibra-optica-barcelona',
        title: 'Fusión de Fibra Óptica Barcelona | Empalme Profesional',
        h1: 'Servicio de fusión de fibra óptica en Barcelona',
        h2s: ['Proceso de fusión', 'Equipamiento profesional', 'Preguntas frecuentes'],
        intro: 'Servicio profesional de fusión (empalme) de fibra óptica en Barcelona. Fusionadora de arco de última generación, pigtails SC/APC, bandejas de empalme y testeo OTDR de cada fusión.',
        metaDescription: 'Fusión de fibra óptica en Barcelona. Empalme por arco profesional, testeo OTDR. Atenuación < 0.05 dB. ☎ +34 605 974 605',
        cta: '¿Necesitas fusionar fibra óptica?',
        features: [
            { icon: '🔥', title: 'Fusión por arco', text: 'Empalme con fusionadora de arco eléctrico de última generación. Atenuación típica < 0.02 dB.' },
            { icon: '📊', title: 'Medición OTDR', text: 'Cada fusión se verifica con reflectómetro óptico para garantizar la calidad del empalme.' },
            { icon: '🔌', title: 'Pigtails SC/APC', text: 'Terminación con pigtails SC/APC de alta calidad para conexión directa a equipos.' },
            { icon: '📋', title: 'Bandejas organizadas', text: 'Cada empalme se protege en bandeja de empalme 1U dentro del rack.' },
            { icon: '🏢', title: 'Edificios FTTH', text: 'Fusiones en cajas de segregación, registros y cuartos de telecomunicaciones.' },
            { icon: '⚡', title: 'Servicio urgente', text: 'Reparación de fibra cortada o dañada con servicio de urgencia 24/7.' },
        ],
        faq: [
            { q: '¿Cuánto cuesta una fusión de fibra óptica?', a: 'El precio por fusión (empalme) es de 15€ por fibra, incluyendo protector de empalme y pigtail SC/APC.' },
            { q: '¿Cuánto tarda una fusión?', a: 'Una fusión individual tarda menos de 2 minutos. Un proyecto de 12-24 fusiones se completa en 2-3 horas incluyendo testeo.' },
            { q: '¿Qué atenuación tiene una fusión?', a: 'Con nuestro equipo profesional, las fusiones tienen una atenuación típica inferior a 0.02 dB, muy por debajo del máximo aceptable de 0.1 dB.' },
        ],
        richSections: [
            {
                h2: "Qué mide realmente una fusión bien hecha",
                paragraphs: [
                    "Una fusión por arco correcta queda por debajo de 0,05 dB de pérdida, y en condiciones normales alcanzamos 0,02 dB o menos. Ese número no se estima a ojo: la fusionadora lo calcula por análisis de imagen del empalme, y el OTDR lo confirma después midiendo la línea completa desde un extremo.",
                    "La diferencia entre 0,02 y 0,3 dB por empalme parece pequeña hasta que se acumulan seis empalmes y dos conectores en un enlace largo. Entonces el presupuesto óptico se agota, el transceptor trabaja al límite y aparecen errores intermitentes que nadie relaciona con el empalme hecho meses antes.",
                ],
            },
            {
                h2: "Preparación: donde se gana o se pierde el empalme",
                paragraphs: [
                    "El arco eléctrico es la parte fácil y automática. Lo que decide el resultado es lo anterior: pelado limpio, limpieza del revestimiento con alcohol isopropílico y una corte perpendicular con cortadora de precisión. Un corte con ángulo de dos grados ya arruina el empalme, por perfecta que sea la máquina.",
                    "Por eso trabajamos con cortadora calibrada y sustituimos la cuchilla según su contador de cortes, no cuando empieza a fallar. Y protegemos cada empalme con manguito termorretráctil dentro de bandeja, nunca al aire: una fibra empalmada sin protección mecánica se rompe en la primera manipulación de la caja.",
                ],
            },
        ],
        updated: '2026-09-09T00:00:00.000Z',
    },
    {
        slug: 'cableado-estructurado-empresas',
        title: 'Cableado Estructurado para Empresas Barcelona',
        h1: 'Cableado estructurado para empresas en Barcelona',
        h2s: ['¿Por qué las empresas necesitan cableado estructurado?', 'Nuestro proceso para proyectos empresariales', 'Preguntas frecuentes'],
        intro: 'Diseñamos e instalamos infraestructuras de cableado estructurado para empresas de todos los tamaños en Barcelona y área metropolitana. Desde despachos de 5 puestos hasta edificios corporativos de 200 puntos de red. Cumplimos la normativa ISO/IEC 11801, entregamos documentación AS-BUILT completa y ofrecemos garantía extendida de 5 años. Técnicos propios, sin subcontratas, sin sorpresas en el presupuesto.',
        metaDescription: 'Cableado estructurado para empresas en Barcelona. ISO/IEC 11801, Cat6A/Cat7, rack, patch panel, documentación AS-BUILT. Técnicos propios. ☎ +34 605 974 605',
        cta: '¿Tu empresa necesita cableado estructurado?',
        features: [
            { icon: '🏢', title: 'Proyectos desde 5 hasta 200+ puestos', text: 'Dimensionamos cada proyecto según el tamaño real de tu empresa: desde pequeñas oficinas hasta sedes corporativas con cientos de puntos de red.' },
            { icon: '📐', title: 'Proyecto técnico incluido', text: 'Elaboramos planos de distribución con recorridos de cable, ubicación de racks, cantidad de puntos y categoría de cable. Sin costes adicionales.' },
            { icon: '🏗️', title: 'Normativa ISO/IEC 11801', text: 'Toda instalación cumple el estándar internacional de cableado estructurado. Categorías 6, 6A y 7 según las necesidades del proyecto.' },
            { icon: '📊', title: 'Testeo y certificación Fluke', text: 'Medimos cada par de cables con certificadora Fluke Networks. Informe por escrito con los resultados de cada punto para tu archivo técnico.' },
            { icon: '📁', title: 'Documentación AS-BUILT', text: 'Entregamos los planos finales con los recorridos reales, etiquetado completo y resultados de testeo. Documentación que el departamento IT necesita para gestionar la red.' },
            { icon: '🛡️', title: 'Garantía 5 años', text: 'Garantía extendida de 5 años en materiales y mano de obra. Si falla cualquier punto, lo reparamos sin coste adicional.' },
        ],
        faq: [
            { q: '¿Cuánto cuesta el cableado estructurado para una empresa en Barcelona?', a: 'Depende del número de puestos. Una oficina de 10 puestos con rack, patch panel y testeo cuesta entre 2.000€ y 3.500€. Para 20 puestos, entre 3.500€ y 6.000€. Para 50+ puestos hacemos presupuesto a medida. Contacta para un precio exacto.' },
            { q: '¿Cuánto tiempo tarda la instalación?', a: 'Una oficina de 10-15 puestos requiere 2-3 días de instalación más 1 día de testeo y documentación. Para proyectos más grandes planificamos por fases para no interrumpir la actividad.' },
            { q: '¿Podéis instalar fuera de horario laboral?', a: 'Sí, ofrecemos instalación en horario nocturno y fines de semana para empresas que no pueden parar su actividad durante el día. Sin recargo por horario nocturno para proyectos de más de 15 puestos.' },
            { q: '¿Qué categoría de cable recomendáis para una empresa?', a: 'Cat6A (10 Gbps) es el estándar actual para nuevas instalaciones empresariales. Está preparado para tecnologías futuras como WiFi 6E, PoE++ y 10GbE. Cat6 solo lo recomendamos para renovaciones parciales donde el presupuesto es muy ajustado.' },
            { q: '¿Instaláis el rack y el patch panel también?', a: 'Sí, el proyecto completo incluye armario de telecomunicaciones, patch panel etiquetado, organizadores de cables y regleta de alimentación con protección. Todo incluido en el presupuesto.' },
            { q: '¿Tenéis experiencia en empresas del 22@ de Barcelona?', a: 'Sí, hemos completado proyectos en el Distrito 22@ de Barcelona, incluyendo edificios de oficinas con plantas diáfanas y coworking. Conocemos los requisitos de instalación de estos edificios.' },
        ],
        richSections: [
            {
                h2: "Cómo se organiza un proyecto de empresa por fases",
                paragraphs: [
                    "Un proyecto empresarial rara vez se ejecuta de una vez. Lo dividimos en fases con entregable propio: primero la infraestructura pasiva completa (canalización, tendido, rack, paneles, certificación), después la electrónica, y por último la configuración y la migración de puestos. Cada fase se cierra funcionando antes de empezar la siguiente.",
                    "El motivo es económico además de técnico. La obra pasiva es la parte cara de deshacer y la que hay que dimensionar con reserva; la electrónica se puede escalar después según crezca la plantilla. Un cliente que reparte así el gasto llega al mismo resultado sin bloquear presupuesto de golpe.",
                ],
            },
            {
                h2: "Coordinación con obra, arquitecto y otros gremios",
                paragraphs: [
                    "Cuando el cableado entra dentro de una reforma, el orden con los demás gremios decide el coste. Las canalizaciones se dejan antes de cerrar techos y tabiques; entrar después significa abrir lo que ya está pintado. Por eso pedimos participar en la planificación, no recibir una llamada cuando la obra está acabada.",
                    "También coordinamos con el electricista la separación entre canalización de datos y de potencia, que es requisito normativo y no una preferencia nuestra. Acordar los recorridos entre ambos al principio evita el escenario habitual: llegar y encontrar que el único tubo libre va paralelo a la línea de fuerza.",
                ],
            },
        ],
        updated: '2026-09-09T00:00:00.000Z',
    },
    {
        slug: 'instalador-red-barcelona',
        title: 'Instalador de Red Barcelona — Técnicos Certificados',
        h1: 'Instalador de red profesional en Barcelona',
        h2s: ['Por qué elegir un instalador de red profesional', 'Qué incluye nuestro servicio', 'Preguntas frecuentes'],
        intro: 'CableCore es tu instalador de red en Barcelona con más de 10 años de experiencia y más de 500 proyectos completados. Instalamos redes Ethernet, fibra óptica, WiFi empresarial y cableado estructurado en hogares, oficinas y naves industriales. Técnicos propios certificados, presupuesto en 24 horas y garantía de 5 años en todos los trabajos.',
        metaDescription: 'Instalador de red en Barcelona. +500 proyectos. Cableado Ethernet, fibra óptica, WiFi. Técnicos propios certificados. Presupuesto gratis 24h. ☎ +34 605 974 605',
        cta: '¿Necesitas un instalador de red en Barcelona?',
        features: [
            { icon: '👨‍🔧', title: 'Técnicos propios certificados', text: 'No subcontratamos. Todos los trabajos los realizan técnicos propios de CableCore formados y certificados en cableado estructurado y fibra óptica.' },
            { icon: '🌐', title: 'Todos los tipos de red', text: 'Ethernet Cat5e/Cat6/Cat6A/Cat7, fibra óptica monomodo y multimodo, WiFi empresarial, VoIP, CCTV y domótica. Un solo instalador para toda tu infraestructura.' },
            { icon: '🏠', title: 'Hogares y pisos', text: 'Mejora la conectividad de tu casa con cable Ethernet en todas las habitaciones. Desde 180€ para 2 puntos con canaleta decorativa.' },
            { icon: '🏢', title: 'Oficinas y empresas', text: 'Cableado estructurado llave en mano para empresas de Barcelona. Proyecto técnico, instalación, testeo y documentación AS-BUILT.' },
            { icon: '🏭', title: 'Naves industriales', text: 'Instalaciones Cat6A y Cat7 para entornos industriales con interferencias electromagnéticas. Canalización IP y materiales certificados para industria.' },
            { icon: '📊', title: 'Testeo y documentación', text: 'Entregamos informe de testeo de cada punto instalado. Si no pasa el test, lo reparamos hasta que lo haga. Garantía escrita de 5 años.' },
        ],
        faq: [
            { q: '¿Cuánto cobra un instalador de red en Barcelona?', a: 'Un punto de red Cat6 instalado completo (cable + roseta + testeo) cuesta desde 110€ IVA incluido. Cat6A U/FTP desde 130€ IVA incluido. Una red doméstica de 4 puntos Cat6 con canaleta desde 500€ IVA incluido. Una oficina de 10 puestos (cableado Cat6A + rack + patch panel) desde 2.200€ IVA incluido. Pide presupuesto sin compromiso.' },
            { q: '¿Cuánto tarda la instalación?', a: 'Un hogar de 2-4 puntos en medio día. Una instalación de 8-10 puntos en 1 día. Una oficina de 15-20 puestos en 2-3 días. Siempre acordamos una fecha concreta.' },
            { q: '¿Trabajáis en toda Barcelona?', a: 'Sí, cubrimos todos los distritos de Barcelona: Eixample, Gràcia, Sant Martí, Sants, Horta-Guinardó, Nou Barris, Sant Andreu, Sarrià y Les Corts. También cubrimos toda el área metropolitana (Badalona, Hospitalet, Sant Cugat, Sabadell, Terrassa y más).' },
            { q: '¿Instaláis también WiFi?', a: 'Sí, complementamos el cableado Ethernet con puntos de acceso WiFi profesionales (Ubiquiti, TP-Link EAP). El cable es la columna vertebral y el WiFi complementa las zonas donde no llega el cable.' },
            { q: '¿Podéis dar presupuesto sin visita?', a: 'Para instalaciones estándar (1-4 puntos en piso o oficina pequeña) podemos dar un presupuesto orientativo por WhatsApp o email con fotos. Para proyectos de más de 8 puntos recomendamos una visita técnica gratuita.' },
            { q: '¿Hacéis instalaciones de red urgentes?', a: 'Sí, ofrecemos servicio urgente para empresas con avería de red. Contacta al +34 605 974 605 y enviamos técnico en el menor tiempo posible dentro de Barcelona.' },
        ],
        richSections: [
            {
                h2: "Qué pedir antes de contratar a nadie",
                paragraphs: [
                    "Hay tres cosas que conviene exigir a cualquier instalador, incluidos nosotros. La primera, que el presupuesto diga la categoría exacta del cable y de la conectividad, no solo la del cable: es donde se recorta sin que se note. La segunda, que incluya certificación con informe entregado. La tercera, que detalle qué pasa si aparece una canalización impracticable a mitad de obra.",
                    "Un presupuesto que dice solo cantidad de puntos y precio total deja fuera precisamente lo que diferencia una instalación de otra. Y un instalador que se incomoda al detallar esos tres puntos está diciendo algo útil sobre cómo va a trabajar.",
                ],
            },
            {
                h2: "Señales de que una instalación se hizo mal",
                paragraphs: [
                    "Hay síntomas que reconocemos al entrar. Cable de instalación terminado en conector macho colgando de la pared. Latiguillos de categoría inferior a la del cableado. Switch doméstico bajo una mesa alimentando media oficina. Rosetas sin etiquetar. Cable de datos grapado junto a la línea eléctrica en el mismo tubo.",
                    "Ninguno de estos impide que la red funcione el primer día, y esa es la razón por la que se cometen. Todos aparecen meses después como cortes intermitentes que se achacan al operador. Cuando nos llaman a diagnosticar una red lenta, empezamos por revisar estos cinco puntos antes de tocar la configuración.",
                ],
            },
        ],
        updated: '2026-09-09T00:00:00.000Z',
    },
    {
        slug: 'instalacion-ftth-edificios-barcelona',
        title: 'Instalación FTTH Edificios Barcelona',
        h1: 'Instalación FTTH para edificios en Barcelona',
        h2s: ['¿Qué es FTTH?', 'Proceso de instalación', 'Preguntas frecuentes'],
        intro: 'Instalación FTTH (Fiber To The Home) en edificios de Barcelona. Cableado vertical de fibra óptica desde el rack comunitario hasta cada vivienda. Rosetas SC/APC de 2 puertos en cada piso. Ideal para comunidades de vecinos.',
        metaDescription: 'Instalación FTTH en edificios de Barcelona. Fibra óptica hasta cada vivienda. Rack, fusión, rosetas SC/APC. ☎ +34 605 974 605',
        cta: '¿Tu edificio necesita FTTH?',
        features: [
            { icon: '🏢', title: 'Cableado vertical', text: 'Fibra monomodo desde el sótano o cuarto de telecomunicaciones hasta cada planta del edificio.' },
            { icon: '🔌', title: 'Roseta en cada vivienda', text: 'Punto de fibra con roseta SC/APC de 2 puertos en el interior de cada vivienda.' },
            { icon: '🗄️', title: 'Rack comunitario', text: 'Rack de fibra centralizado con bandejas de empalme y acopladores para conectar con los operadores.' },
            { icon: '🔥', title: 'Fusión profesional', text: 'Todos los empalmes realizados con fusionadora de arco y verificados con OTDR.' },
            { icon: '📐', title: 'Proyecto ICT', text: 'Cumplimos con la normativa ICT2 para infraestructuras de telecomunicaciones en edificios.' },
            { icon: '🤝', title: 'Comunidades de vecinos', text: 'Trabajamos con administradores de fincas y comunidades para presupuestos colectivos.' },
        ],
        faq: [
            { q: '¿Qué es FTTH?', a: 'FTTH (Fiber To The Home) significa fibra hasta el hogar. Es la instalación de cable de fibra óptica directamente hasta cada vivienda del edificio.' },
            { q: '¿Cuánto cuesta instalar FTTH en un edificio?', a: 'Depende del número de plantas y viviendas. Un edificio de 10 viviendas está en torno a 2.000-4.000€ con rack, fusiones y rosetas incluidas.' },
            { q: '¿Los vecinos pueden contratar operadores diferentes?', a: 'Sí, la instalación FTTH es neutra. Cada operador puede conectar su fibra al rack comunitario y dar servicio a los vecinos que contraten.' },
        ],
        richSections: [
            {
                h2: "FTTH en comunidad: la parte que no es técnica",
                paragraphs: [
                    "En una finca de vecinos, el trabajo técnico suele ser lo más sencillo. Lo que decide los plazos es el acuerdo: la instalación afecta a zonas comunes, necesita autorización de la comunidad y, en fincas con protección patrimonial, condiciona por dónde puede pasar el cable en fachada o escalera.",
                    "Por eso presentamos siempre propuesta con recorrido dibujado antes de la junta, para que los vecinos vean exactamente qué se toca. Un proyecto rechazado en junta por falta de información cuesta meses más que hacer bien esa documentación previa.",
                ],
            },
            {
                h2: "Registro principal, vertical y acometida a vivienda",
                paragraphs: [
                    "La instalación se divide en tres tramos con lógica propia. El registro principal, donde entran los operadores, requiere espacio para que convivan varios sin invadirse. La vertical sube por el patinillo con holgura para futuras altas. Y la acometida a cada vivienda se deja tirada hasta el registro de terminación de red del piso.",
                    "El error más caro es dimensionar la vertical justo para los vecinos que dicen sí hoy. Las altas llegan durante años, y volver a subir por el patinillo con la obra cerrada cuesta mucho más que dejar reserva desde el principio. Calculamos siempre con margen sobre el número de viviendas, no sobre el número de interesados.",
                ],
            },
        ],
        updated: '2026-09-09T00:00:00.000Z',
    },
];
