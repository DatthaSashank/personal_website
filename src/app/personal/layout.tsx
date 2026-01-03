import { PersonaToggle } from "@/components/shared/PersonaToggle";

export default function PersonalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="dark min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-pink-900 selection:text-pink-100">
            <PersonaToggle />
            <main className="pt-24 pb-16 px-4 md:px-8 max-w-[1600px] mx-auto">
                {children}
            </main>
            <footer className="py-8 text-center text-neutral-600 text-sm border-t border-white/5 mt-12">
                <p>&copy; {new Date().getFullYear()} Dattha Sashank. Creative Gallery.</p>
            </footer>
        </div>
    );
}
