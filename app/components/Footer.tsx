import Image from "next/image";

export default function Footer() {
    return (
        <footer className="border-t border-white/10">
            <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-3">
                    <Image src="/gaea-logo.png"
                        alt="GAEA Thinking"
                        width={28}
                        height={28}
                        className="object-contain col-span-1"
                    />
                    <span>GAEA</span>
                </div>
                <p className="text-center sm:text-right">© {new Date().getFullYear()} GAEA. All rights reserved.</p>
            </div>
        </footer>
    );
}


