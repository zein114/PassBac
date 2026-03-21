import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Can be imported from a shared config
const locales = ['fr', 'ar', 'en'];

export default getRequestConfig(async ({ requestLocale }) => {
    // This is the updated next-intl 3.x pattern for App Router
    const locale = await requestLocale;

    // Validate that the incoming `locale` parameter is valid
    if (!locales.includes(locale as any)) notFound();

    return {
        locale: locale as string,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
