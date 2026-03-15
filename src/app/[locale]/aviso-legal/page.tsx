import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function AvisoLegalPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-[#09090b] pt-24 pb-16">
                <div className="container-custom max-w-4xl">
                    <h1 className="font-heading text-3xl lg:text-4xl font-bold text-white mb-8">
                        Aviso Legal
                    </h1>

                    <div className="prose prose-invert prose-gold max-w-none space-y-6 text-brand-gold-muted text-sm leading-relaxed">

                        <section>
                            <h2 className="text-xl font-heading font-semibold text-white mb-3">1. Datos Identificativos</h2>
                            <p>
                                En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSICE), se ponen a disposición del usuario los siguientes datos:
                            </p>
                            <ul className="list-none space-y-1 mt-3">
                                <li><strong className="text-white">Denominación:</strong> CableCore</li>
                                <li><strong className="text-white">Domicilio:</strong> Carrer Vitor Balaguer 33, Badalona, 08914, Barcelona</li>
                                <li><strong className="text-white">Email:</strong> info@cablecore.es</li>
                                <li><strong className="text-white">Teléfono:</strong> +34 605 974 605</li>
                                <li><strong className="text-white">Sitio web:</strong> cablecore.es</li>
                                <li><strong className="text-white">Actividad:</strong> Instalación profesional de redes y cableado estructurado</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-heading font-semibold text-white mb-3">2. Objeto</h2>
                            <p>
                                El presente sitio web tiene como objeto proporcionar información sobre los servicios de instalación de redes y cableado estructurado que ofrece CableCore, así como facilitar el contacto con potenciales clientes y la generación de presupuestos.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-heading font-semibold text-white mb-3">3. Propiedad Intelectual e Industrial</h2>
                            <p>
                                Todos los contenidos del sitio web, incluyendo textos, imágenes, logotipos, iconos, diseño gráfico, código fuente y software, son propiedad de CableCore o de sus respectivos titulares, y están protegidos por las leyes de propiedad intelectual e industrial.
                            </p>
                            <p>
                                Queda prohibida la reproducción, distribución, comunicación pública o transformación de cualquier contenido del sitio web sin autorización expresa por escrito de CableCore.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-heading font-semibold text-white mb-3">4. Condiciones de Uso</h2>
                            <p>El usuario se compromete a:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Utilizar el sitio web de conformidad con la ley, la moral y el orden público</li>
                                <li>No realizar actividades ilícitas o contrarias a la buena fe</li>
                                <li>No difundir contenidos de carácter racista, xenófobo, pornográfico o que atenten contra los derechos fundamentales</li>
                                <li>No introducir virus informáticos o cualquier tipo de programa dañino</li>
                                <li>No intentar acceder a áreas restringidas del sitio web</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-heading font-semibold text-white mb-3">5. Exclusión de Responsabilidad</h2>
                            <p>CableCore no se hace responsable de:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Los posibles errores de seguridad que puedan producirse por el uso de equipos informáticos infectados con virus</li>
                                <li>Las consecuencias que puedan derivarse del mal uso del sitio web</li>
                                <li>Los contenidos de los sitios web de terceros a los que se pueda acceder mediante enlaces desde este sitio</li>
                                <li>Las interrupciones del servicio por causas técnicas o de mantenimiento</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-heading font-semibold text-white mb-3">6. Presupuestos y Precios</h2>
                            <p>
                                Los precios mostrados en la calculadora de instalación son orientativos y no constituyen una oferta vinculante. El presupuesto final puede variar en función de las condiciones específicas del espacio y los requisitos del proyecto. Todos los presupuestos generados tienen una validez de 30 días salvo indicación contraria.
                            </p>
                            <p>
                                Los precios incluyen IVA (21%) salvo que se indique lo contrario.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-heading font-semibold text-white mb-3">7. Legislación Aplicable</h2>
                            <p>
                                El presente aviso legal se rige por la legislación española. Para la resolución de cualquier controversia que pudiera surgir, las partes se someten a los Juzgados y Tribunales de Barcelona.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-heading font-semibold text-white mb-3">8. Normativa Aplicable</h2>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSICE)</li>
                                <li>Reglamento (UE) 2016/679 del Parlamento Europeo (RGPD)</li>
                                <li>Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales (LOPDGDD)</li>
                                <li>Ley 7/1998, de 13 de abril, sobre Condiciones Generales de la Contratación</li>
                            </ul>
                        </section>

                        <p className="text-xs text-brand-gold-muted mt-8 pt-4 border-t border-border-subtle">
                            Última actualización: Marzo 2026
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
