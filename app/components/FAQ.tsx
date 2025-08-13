export default function FAQ() {
    return (
        <section id="faq" className="relative">
            <div className="mx-auto max-w-4xl px-6 py-20">
                <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-semibold text-white">Frequently asked questions</h2>
                    <p className="mt-3 text-gray-300">Quick answers about GAEA.</p>
                </div>
                <div className="mt-10 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5">
                    {[
                        {
                            q: 'What frameworks are supported?',
                            a: 'Next.js and Tailwind CSS out of the box. Components are plain React so can be adapted.'
                        },
                        {
                            q: 'Is the code production-ready?',
                            a: 'Components include accessibility-minded markup and are typed where appropriate.'
                        },
                        {
                            q: 'How do I try it?',
                            a: 'Click “Open Chat” in the header to start generating components with GAEA.'
                        }
                    ].map((item) => (
                        <details key={item.q} className="group p-6 open:bg-white/5">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                                <span className="text-white font-medium">{item.q}</span>
                                <span className="text-gray-400 group-open:hidden">+</span>
                                <span className="text-gray-400 hidden group-open:inline">–</span>
                            </summary>
                            <p className="mt-3 text-sm text-gray-300">{item.a}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}


