import AppLogoIcon from '@/components/app-logo-icon';

export function MarketingFooter() {
    return (
        <footer className="border-t border-border/60 py-10">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
                <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <AppLogoIcon className="size-4" />
                    </div>
                    <span className="font-semibold text-foreground">
                        Sabil Tracker
                    </span>
                </div>
                <p>
                    &copy; {new Date().getFullYear()} Sabil Tracker. Self-hosted
                    personal finance & asset tracking.
                </p>
            </div>
        </footer>
    );
}
