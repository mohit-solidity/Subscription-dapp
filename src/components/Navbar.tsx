'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useRoles } from '@/hooks/useRoles';
import { usePathname } from 'next/navigation';
import { twMerge } from 'tailwind-merge';

export function Navbar() {
    const { isOwner, isCreator } = useRoles();
    const pathname = usePathname();

    const NavLink = ({ href, label }: { href: string; label: string }) => {
        const isActive = pathname === href;
        return (
            <Link
                href={href}
                className={twMerge(
                    "text-sm font-medium transition-colors hover:text-blue-600",
                    isActive ? "text-blue-600 font-bold" : "text-gray-600 dark:text-gray-400"
                )}
            >
                {label}
            </Link>
        );
    };

    return (
        <nav className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Subscription DApp
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <NavLink href="/" label="Explore" />
                    {isCreator && <NavLink href="/dashboard/creator" label="Creator Dashboard" />}
                    {isOwner && <NavLink href="/dashboard/owner" label="Owner Panel" />}
                </div>

                <div className="flex items-center gap-4">
                    <ConnectButton showBalance={false} />
                </div>
            </div>
        </nav>
    );
}
