import { permanentRedirect } from 'next/navigation';

import { setRequestLocale } from 'next-intl/server';
export default function CalculadoraRedirect({ params }: { params: { locale: string } }) {
    setRequestLocale(params.locale);

    permanentRedirect(`/${params.locale}/calculator`);
}
