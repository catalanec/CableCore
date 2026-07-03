import { permanentRedirect } from 'next/navigation';

export default function CalculadoraRedirect({ params }: { params: { locale: string } }) {
    permanentRedirect(`/${params.locale}/calculator`);
}
