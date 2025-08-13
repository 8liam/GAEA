import Image from 'next/image';
import Link from 'next/link';

type HeaderProps = {
    ctaHref?: string;
};

export default function Header({ ctaHref = '/chat' }: HeaderProps) {
    return (
        <header className="sticky top-0 z-40 w-full backdrop-blur supports-backdrop-blur:bg-white/50 border-b border-white/10 bg-black/30">
            <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <Image src="/gaea-logo.png"
                        alt="GAEA Thinking"
                        width={28}
                        height={28}
                        className="object-contain col-span-1"
                    />
                    <span className="text-lg font-semibold tracking-tight text-white">
                        <span className="text-white">GAEA</span>
                    </span>
                </Link>
                <nav className="hidden md:flex items-center gap-8 text-sm text-gray-300">
                    <a href="#features" className="hover:text-white transition-colors">Features</a>
                    <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
                    <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
                </nav>
                <div className="flex items-center gap-3">
                    <Link
                        href={ctaHref}
                        className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-[0_0_20px_-4px_rgba(99,102,241,0.6)] hover:shadow-[0_0_28px_-4px_rgba(168,85,247,0.6)] transition-all"
                    >
                        Open Chat
                    </Link>
                </div>
            </div>
        </header>
    );
}


