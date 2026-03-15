import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PrivacidadPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-[#09090b] pt-24 pb-16">
                <div className="container-custom max-w-4xl">
                    <h1 className="font-heading text-3xl lg:text-4xl font-bold text-white mb-8">
                        Política de Privacidad
                    </h1>

                    <div className="prose prose-invert prose-gold max-w-none space-y-6 text-brand-gold-muted text-sm leading-relaxed">

                        <section>
                            <h2 className="text-xl font-heading font-semibold text-white mb-3">1. Responsable del Tratamiento</h2>
                            <p>
                                <strong className="text-white">CableCore</strong><br />
                                Carrer Vitor Balaguer 33, Badalona, 08914, Barcelona<br />
                                Email: info@cablecore.es<br />
                                Teléfono: +34 605 974 605
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-heading font-semibold text-white mb-3">2. Datos Personales que Recopilamos</h2>
                            <p>A través de nuestro sitio web y formularios de contacto, podemos recopilar los siguientes datos personales:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Nombre y apellidos</li>
                                <li>Dirección de correo electrónico</li>
                                <li>Número de teléfono</li>
                                <li>Dirección de instalación</li>
                                <li>Detalles del proyecto o servicio solicitado</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-heading font-semibold text-white mb-3">3. Finalidad del Tratamiento</h2>
                            <p>Los datos personales recogidos serán tratados con las siguientes finalidades:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Gestionar las solicitudes de presupuesto y contacto</li>
                                <li>Enviar presupuestos detallados por correo electrónico</li>
                                <li>Prestar los servicios de instalación de redes contratados</li>
                                <li>Mantener la comunicación con el cliente durante y después del proyecto</li>
                                <li>Cumplir con las obligaciones legales y fiscales</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-heading font-semibold text-white mb-3">4. Base Legal</h2>
                            <p>El tratamiento de sus datos se basa en:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li><strong className="text-white">Consentimiento:</strong> Al enviar un formulario de contacto o solicitar un presupuesto</li>
                                <li><strong className="text-white">Ejecución de contrato:</strong> Para la prestación de los servicios contratados</li>
                                <li><strong className="text-white">Obligación legal:</strong> Cumplimiento de obligaciones fiscales y contables</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-heading font-semibold text-white mb-3">5. Conservación de Datos</h2>
                            <p>
                                Los datos personales serán conservados mientras se mantenga la relación comercial y durante el tiempo necesario para cumplir con las obligaciones legales. Una vez finalizados estos plazos, los datos serán eliminados de forma segura.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-heading font-semibold text-white mb-3">6. Derechos del Interesado</h2>
                            <p>Usted tiene derecho a:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li><strong className="text-white">Acceso:</strong> Conocer qué datos personales tratamos sobre usted</li>
                                <li><strong className="text-white">Rectificación:</strong> Solicitar la corrección de datos inexactos</li>
                                <li><strong className="text-white">Supresión:</strong> Solicitar la eliminación de sus datos</li>
                                <li><strong className="text-white">Limitación:</strong> Solicitar la limitación del tratamiento</li>
                                <li><strong className="text-white">Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
                                <li><strong className="text-white">Oposición:</strong> Oponerse al tratamiento de sus datos</li>
                            </ul>
                            <p className="mt-3">
                                Para ejercer estos derechos, puede contactarnos en <a href="mailto:info@cablecore.es" className="text-brand-gold hover:underline">info@cablecore.es</a>.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-heading font-semibold text-white mb-3">7. Seguridad de los Datos</h2>
                            <p>
                                Aplicamos medidas técnicas y organizativas adecuadas para proteger sus datos personales contra el acceso no autorizado, la pérdida o la destrucción. Nuestros sistemas utilizan cifrado SSL/TLS para la transmisión segura de datos.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-heading font-semibold text-white mb-3">8. Cookies</h2>
                            <p>
                                Este sitio web utiliza cookies técnicas necesarias para su funcionamiento. No utilizamos cookies de seguimiento ni publicitarias. Las cookies técnicas se eliminan al cerrar el navegador.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-heading font-semibold text-white mb-3">9. Modificaciones</h2>
                            <p>
                                CableCore se reserva el derecho de modificar esta política de privacidad para adaptarla a cambios legislativos o criterios de la Agencia Española de Protección de Datos. Cualquier modificación será publicada en esta página.
                            </p>
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
