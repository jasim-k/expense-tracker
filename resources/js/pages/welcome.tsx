import { Head, usePage } from '@inertiajs/react';
import { useLayoutEffect } from 'react';
import { CtaBand } from '@/components/marketing/cta-band';
import { DynamicFieldsShowcase } from '@/components/marketing/dynamic-fields-showcase';
import { FaqSection } from '@/components/marketing/faq-section';
import { FeaturesSection } from '@/components/marketing/features-section';
import { HowItWorksSection } from '@/components/marketing/how-it-works-section';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingHero } from '@/components/marketing/marketing-hero';
import { OutcomesSection } from '@/components/marketing/outcomes-section';
import { ProblemSection } from '@/components/marketing/problem-section';

export default function Welcome() {
    const { auth } = usePage().props;

    // The landing page is always light. A client-side visit from a dark-themed
    // dashboard never re-runs the blade root template, so drop the class here
    // too and restore it when the visitor navigates back into the app.
    useLayoutEffect(() => {
        const root = document.documentElement;
        const wasDark = root.classList.contains('dark');

        if (!wasDark) {
            return;
        }

        root.classList.remove('dark');

        return () => root.classList.add('dark');
    }, []);

    return (
        <>
            <Head title="Sabil Tracker — Track cash, bank, assets & documents in one place" />

            <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
                {/* Decorative gradient blobs */}
                <div
                    aria-hidden
                    className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
                >
                    <div className="animate-blob absolute -top-32 -left-24 size-96 rounded-full bg-violet-200/40 blur-3xl dark:bg-primary/10" />
                    <div className="animate-blob animation-delay-2000 absolute top-1/3 -right-32 size-[28rem] rounded-full bg-fuchsia-200/30 blur-3xl dark:bg-fuchsia-400/10" />
                    <div className="animate-blob animation-delay-4000 absolute bottom-0 left-1/4 size-80 rounded-full bg-violet-200/30 blur-3xl dark:bg-violet-400/10" />
                </div>

                <MarketingHeader isAuthenticated={Boolean(auth.user)} />

                <main>
                    <MarketingHero />
                    <ProblemSection />
                    <FeaturesSection />
                    <DynamicFieldsShowcase />
                    <OutcomesSection />
                    <HowItWorksSection />
                    <FaqSection />
                    <CtaBand />
                </main>

                <MarketingFooter />
            </div>
        </>
    );
}
