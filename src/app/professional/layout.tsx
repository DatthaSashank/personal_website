import { PersonaToggle } from "@/components/shared/PersonaToggle";

export default function ProfessionalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            <PersonaToggle />
            <main className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
                {children}
            </main>
            <footer className="py-8 text-center text-slate-400 text-sm">
                <p>&copy; {new Date().getFullYear()} Dattha Sashank. Professional Portfolio.</p>
            </footer>
        </div>
    );
}
