'use client';

import * as React from 'react';
import {
    RainbowKitProvider,
    darkTheme,
} from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from './wagmi';
import { Toaster } from 'react-hot-toast';
import { sepolia } from 'wagmi/chains';

// Global Query Client Optimization
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30 * 1000, // 30 seconds
            gcTime: 10 * 60 * 1000, // 10 minutes
            refetchOnWindowFocus: false, // Prevent RPC spam on tab switch
            retry: 1, // Only retry once for RPC errors
            refetchOnMount: true,
        },
    },
});

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme()}
                    initialChain={sepolia}
                    showRecentTransactions={true}
                >
                    {children}
                    <Toaster position="bottom-right" />
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
