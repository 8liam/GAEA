"use client";
import { useRef } from "react";
import Chat from "./Chat";
import { PanelLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
interface SidebarChatProps {
    isOpen: boolean;
    width: number;
    onResize: (_width: number) => void; // kept for prop compatibility, unused
    onOpenChange: (open: boolean) => void;
}

export default function SidebarChat({ isOpen, width, onResize, onOpenChange }: SidebarChatProps) {
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Sidebar styles (static width from prop)
    const sidebarStyle = {
        width: isOpen ? width : 0,
        transition: "width 0.2s cubic-bezier(.4,1.2,.4,1)",
        minWidth: isOpen ? 280 : 0,
        maxWidth: 700,
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 50,
    } as React.CSSProperties;

    return (
        <>
            {/* Minimized button */}
            {!isOpen && (
                <button
                    className="fixed left-2 top-2 z-50 bg-[#18192b] hover:bg-[#1E2938] p-3 transition-colors rounded-lg"
                    onClick={() => onOpenChange(true)}
                    aria-label="Open chat sidebar"
                >
                    <PanelLeft width={20} height={20} />
                </button>
            )}
            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className={`fixed bg-white dark:bg-[#18192b] shadow-2xl border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen transition-all duration-200 ease-in-out ${isOpen ? '' : 'overflow-hidden'}`}
                style={sidebarStyle}
            >
                {/* Header with minimize */}
                <div className="flex items-center justify-between px-3 py-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#18192b]/80 backdrop-blur-md">
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
                    <div className="flex items-center gap-2">
                        <button
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={() => onOpenChange(false)}
                            aria-label="Minimize chat sidebar"
                        >
                            <PanelLeft width={20} height={20} />
                        </button>
                    </div>
                </div>
                {/* Chat content */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                    <Chat />
                </div>
            </div>
        </>
    );
} 