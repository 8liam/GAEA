import { SquarePen, RefreshCw, Rocket } from 'lucide-react';

export default function HowItWorks() {
    const steps = [
        { title: 'Describe', desc: 'Tell GAEA what to build.', icon: SquarePen },
        { title: 'Iterate', desc: 'Refine in chat with preview.', icon: RefreshCw },
        { title: 'Apply', desc: 'Copy or apply the code.', icon: Rocket },
    ] as const;

    return (
        <section id="how-it-works" className="relative">
            <div className="mx-auto max-w-7xl px-6 py-20">
                <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-semibold text-white">How it works</h2>
                    <p className="mt-3 text-gray-300">From prompt to production-ready components in minutes.</p>
                </div>

                <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {steps.map((s, idx) => {
                        const Icon = s.icon;
                        return (
                            <li key={s.title} className="rounded-xl border border-white/10 bg-white/5 p-5">
                                <div className="flex items-center gap-3">
                                    <Icon className="h-4 w-4 text-gray-200" aria-hidden="true" />
                                </div>
                                <h3 className="mt-3 text-white font-medium">{s.title}</h3>
                                <p className="mt-1 text-sm text-gray-300">{s.desc}</p>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </section>
    );
}


