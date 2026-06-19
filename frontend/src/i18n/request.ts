import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { notFound } from 'next/navigation';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as 'en' | 'my')) {
    locale = 'en';
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: 'Asia/Yangon'
  };
});
