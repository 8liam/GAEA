import { Moon, Smartphone, Code2, Sparkles, Boxes, Brain } from 'lucide-react';

type Feature = {
    title: string;
    description: string;
    icon?: React.ReactNode;
};

const features: Feature[] = [
    {
        title: 'Dark mode first',
        description: 'A carefully tuned visual system with glass, glow, and gradients that shines in the dark.',
        icon: <Moon className="h-5 w-5 text-indigo-300" />,
    },
    {
        title: 'Responsive by design',
        description: 'Every component adapts elegantly from mobile to desktop without extra work.',
        icon: <Smartphone className="h-5 w-5 text-indigo-300" />,
    },
    {
        title: 'Next.js + Tailwind',
        description: 'Generated components slot directly into modern stacks with zero friction.',
        icon: <Code2 className="h-5 w-5 text-indigo-300" />,
    },
    {
        title: 'Real-time preview',
        description: 'Iterate faster with immediate visual feedback while you chat.',
        icon: <Sparkles className="h-5 w-5 text-indigo-300" />,
    },
    {
        title: 'Composable primitives',
        description: 'Small, reusable building blocks to assemble complex interfaces.',
        icon: <Boxes className="h-5 w-5 text-indigo-300" />,
    },
    {
        title: 'OpenRouter powered',
        description: 'Leverage state-of-the-art models for quality output and speed.',
        icon: <Brain className="h-5 w-5 text-indigo-300" />,
    },
];

export default function FeatureGrid() {
    return (
        <section id="features" className="relative">
            <div className="mx-auto max-w-7xl px-6 py-20">
                <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-semibold text-white">Built for ambitious teams</h2>
                    <p className="mt-3 text-gray-300">Everything you need to go from idea to polished UI in minutes.</p>
                </div>

                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f) => (
                        <div
                            key={f.title}
                            className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/7.5 transition-colors"
                        >
                            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            <div className="h-10 w-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
                                {f.icon}
                            </div>
                            <h3 className="mt-4 text-white font-medium">{f.title}</h3>
                            <p className="mt-2 text-sm text-gray-300 leading-6">{f.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}


