import { permanentRedirect } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function CalculadoraRedirect() {
    const locale = useLocale();
    permanentRedirect(`/${locale}/calculator`);
}
