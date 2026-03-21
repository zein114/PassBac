import type { Metadata } from 'next';
import '../globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'PassBac — AI-Powered Exam Preparation',
  description: 'Ace your Baccalaureate with AI-powered learning, courses, and quizzes.',
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction}>
      <body className="bg-slate-50 min-h-screen flex flex-col antialiased">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <Navbar locale={locale} />
            <main className="flex-grow pt-24 sm:pt-28 lg:pt-32 pb-12">
              <div className="container-premium animate-fade-in">
                {children}
              </div>
            </main>
            <Footer />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
