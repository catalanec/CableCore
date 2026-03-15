import { getRequestConfig } from 'next-intl/server';

const locales = ['es', 'en', 'ru'] as const;
const defaultLocale = 'es';

export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;
    const locale = (requested && locales.includes(requested as any)) ? requested : defaultLocale;

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default,
    };
});
