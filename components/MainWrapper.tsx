'use client';

import { usePathname } from 'next/navigation';

export function MainWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || '';
    const isAuth = pathname.includes('/login') || pathname.includes('/register');

    if (isAuth) {
        return <main className="flex-grow flex flex-col">{children}</main>;
    }

    return (
        <main className="flex-grow pt-24 sm:pt-28 lg:pt-32 pb-12">
            <div className="container-premium animate-fade-in">
                {children}
            </div>
        </main>
    );
}
