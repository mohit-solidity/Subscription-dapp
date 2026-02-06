'use client';

import { useSmartWrite } from './useSmartWrite';
import { useQueryClient } from '@tanstack/react-query';
import { parseEther } from 'viem';

export function useUserActions() {
    const queryClient = useQueryClient();

    const { sendTransaction: buy, isPending: isBuying } = useSmartWrite('buySubscription', {
        onSuccess: () => queryClient.invalidateQueries()
    });

    const { sendTransaction: gift, isPending: isGifting } = useSmartWrite('giftSubscription', {
        onSuccess: () => queryClient.invalidateQueries()
    });

    return {
        buySubscription: async ({ creator, planId, price }: { creator: string, planId: number, price: string }) => {
            return buy(
                [creator as `0x${string}`, BigInt(planId)],
                { value: parseEther(price) }
            );
        },
        giftSubscription: async ({ user, creator, planId, price }: { user: string, creator: string, planId: number, price: string }) => {
            return gift(
                [user as `0x${string}`, BigInt(planId), creator as `0x${string}`],
                { value: parseEther(price) }
            );
        },
        isBuying,
        isGifting
    };
}
