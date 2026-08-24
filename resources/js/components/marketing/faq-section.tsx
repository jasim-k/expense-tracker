const faqs = [
    {
        q: 'Does Sabil Tracker track cash separately from bank accounts?',
        a: 'Yes — every transaction is tied to an account of type cash or bank, and each balance updates and reconciles instantly and independently.',
    },
    {
        q: 'Can I track things other than money, like a vehicle or a passport?',
        a: 'Yes. That is the point of the Dynamic Fields Engine: attach Date, Number, Text or Checkbox fields to any sub-category, then set a reminder on any Date field with a custom "remind me N days before" offset.',
    },
    {
        q: 'Do I need to code to add a custom field?',
        a: 'No. Field definitions are created entirely in the Category & Field Builder screen — no code, no database migration. The transaction logger picks up new fields the moment you save them.',
    },
    {
        q: 'How do reminders actually reach me?',
        a: 'A nightly scheduled command checks every date field with a reminder enabled and sends both an email and an in-app alert once you cross your chosen threshold.',
    },
    {
        q: 'Is my data private?',
        a: 'Sabil Tracker is self-hosted. Your data lives in your own database on your own infrastructure — nothing is shared with, or processed by, a third party.',
    },
];

export function FaqSection() {
    return (
        <section id="faq" className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
            <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Frequently asked questions
            </h2>
            <div className="mt-10 divide-y divide-border rounded-2xl border border-border/70 bg-card shadow-sm">
                {faqs.map((item) => (
                    <div key={item.q} className="p-6">
                        <p className="font-semibold text-foreground">
                            {item.q}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {item.a}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
