import Link from 'next/link';
import { MessageSquare, Wand2 } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-32 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.25),transparent_60%)] blur-3xl" />
                <div className="absolute top-1/3 -left-20 h-72 w-72 rotate-12 rounded-full bg-[conic-gradient(from_90deg,rgba(168,85,247,0.3),transparent_60%)] blur-2xl" />
                <div className="absolute bottom-0 -right-10 h-80 w-80 -rotate-12 rounded-full bg-[conic-gradient(from_0deg,rgba(236,72,153,0.25),transparent_60%)] blur-2xl" />
            </div>

            <div className="mx-auto max-w-7xl px-6 pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-28">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <div className="relative">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            Live
                        </div>
                        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
                            Build modern UI components with AI in seconds
                        </h1>
                        <p className="mt-5 text-base leading-7 text-gray-300 sm:text-lg sm:leading-8">
                            Meet GAEA — your generative AI copilot for designing and coding beautifully responsive components for Next.js and Tailwind. Developer approved.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                            <Link
                                href="/chat"
                                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.6)] hover:shadow-[0_12px_44px_-10px_rgba(168,85,247,0.65)] transition-all w-full sm:w-auto"
                            >
                                Start chatting
                            </Link>
                            <a
                                href="#features"
                                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-medium text-white/90 bg-white/10 hover:bg-white/15 border border-white/10 transition-all w-full sm:w-auto"
                            >
                                Explore features
                            </a>
                        </div>
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-300">
                            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2"><MessageSquare className="h-3.5 w-3.5" /><span>Responsive out of the box</span></div>
                            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2"><Wand2 className="h-3.5 w-3.5" /><span>Powered by OpenRouter</span></div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-indigo-600/20 via-purple-600/10 to-fuchsia-500/20 blur-2xl" />
                        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-2 shadow-2xl">
                            <div className="aspect-[16/10] w-full rounded-xl bg-black/60 backdrop-blur overflow-hidden">
                                <div className="h-full w-full grid grid-cols-3 gap-px p-px bg-white/5">
                                    {/* Sidebar (left) */}
                                    <div className="bg-[#0e1323] p-4">
                                        <div className="h-3 w-20 rounded bg-white/10" />
                                        <div className="mt-3 space-y-2">
                                            <div className="h-2.5 w-full rounded bg-white/10" />
                                            <div className="h-2.5 w-4/6 rounded bg-white/10" />
                                            <div className="h-2.5 w-3/6 rounded bg-white/10" />
                                        </div>
                                        <div className="mt-6 h-32 rounded-lg bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-fuchsia-500/20 border border-white/10" />
                                    </div>
                                    {/* Main content (right) */}
                                    <div className="col-span-2 bg-[#0b0f1a] p-6">
                                        <div className="h-4 w-24 rounded bg-white/10" />
                                        <div className="mt-4 space-y-2">
                                            <div className="h-3 w-full rounded bg-white/10" />
                                            <div className="h-3 w-5/6 rounded bg-white/10" />
                                            <div className="h-3 w-2/3 rounded bg-white/10" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}


