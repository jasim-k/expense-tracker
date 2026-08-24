import { Link } from '@inertiajs/react';
import { ArrowLeftRight } from 'lucide-react';
import { register } from '@/routes';

export function CtaBand() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-violet-700 to-fuchsia-700 py-20 text-primary-foreground">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 20% 20%, white 0, transparent 40%), radial-gradient(circle at 80% 60%, white 0, transparent 35%)',
                }}
            />
            <div className="relative mx-auto max-w-3xl px-6 text-center">
                <ArrowLeftRight className="mx-auto size-10 opacity-90" />
                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                    Stop guessing your balance. Stop finding out too late.
                </h2>
                <p className="mt-4 text-primary-foreground/85">
                    Set up your first account in under a minute — free,
                    self-hosted, and entirely yours.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <Link
                        href={register()}
                        className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary shadow-lg transition-transform hover:-translate-y-0.5"
                    >
                        Create your free account
                    </Link>
                </div>
            </div>
        </section>
    );
}
