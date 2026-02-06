'use client';

import { useAccount, useSwitchChain } from 'wagmi';
import { useRoles } from '@/hooks/useRoles';
import { TARGET_CHAIN_ID } from '@/config/contract';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { ReactNode, useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface GuardProps {
    children: ReactNode;
    requireRole?: 'OWNER' | 'CREATOR' | 'USER';
    fallback?: ReactNode;
    requireWallet?: boolean;
}

export function Guard({ children, requireRole, fallback, requireWallet = true }: GuardProps) {
    const { isConnected, chainId } = useAccount();
    const { switchChain } = useSwitchChain();
    const { role, isLoading } = useRoles();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    // 1. Wallet Connection Check
    if (requireWallet && !isConnected) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle>Connect Wallet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500 mb-6">Please connect your wallet to access this section.</p>
                        <div className="flex justify-center">
                            <ConnectButton />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // 2. Network Check
    if (isConnected && chainId !== TARGET_CHAIN_ID) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <Card className="w-full max-w-md text-center border-red-500 shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-red-500">Wrong Network</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500 mb-6">
                            Please switch to the correct network to continue.
                        </p>
                        <Button
                            variant="danger"
                            onClick={() => switchChain({ chainId: TARGET_CHAIN_ID })}
                        >
                            Switch Network
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // 3. Role Check
    if (requireRole && role !== requireRole && role !== 'OWNER') {
        if (fallback) return <>{fallback}</>;
        return (
            <div className="flex items-center justify-center min-vh-[50vh]">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500">
                            You need the <span className="font-bold">{requireRole}</span> role to view this page.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}
