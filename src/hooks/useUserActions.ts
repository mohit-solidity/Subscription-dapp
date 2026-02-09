'use client';

import { useSmartWrite } from './useSmartWrite';
import { useQueryClient } from '@tanstack/react-query';
import { parseEther } from 'viem';
import { saveSubscriptionPurchase } from '@/utils/subscriptionStorage';
import { useAccount } from 'wagmi';

export function useUserActions() {
    const queryClient = useQueryClient();
    const { address: userAddress } = useAccount();

    const { sendTransaction: buy, isPending: isBuying } = useSmartWrite('buyOrRenewSubscription', {
        onSuccess: () => queryClient.invalidateQueries()
    });

    const { sendTransaction: gift, isPending: isGifting } = useSmartWrite('giftSubscription', {
        onSuccess: () => queryClient.invalidateQueries()
    });

    return {
        buySubscription: async ({ creator, planId, price, duration }: { creator: string, planId: number, price: string, duration: number }) => {
            const result = await buy(
                [creator as `0x${string}`, BigInt(planId)],
                { value: parseEther(price) }
            );

            // Save to localStorage for tracking expiry
            if (userAddress) {
                saveSubscriptionPurchase(userAddress, creator, planId, duration);
            }

            return result;
        },
        giftSubscription: async ({ user, creator, planId, price, duration }: { user: string, creator: string, planId: number, price: string, duration: number }) => {
            const result = await gift(
                [user as `0x${string}`, BigInt(planId), creator as `0x${string}`],
                { value: parseEther(price) }
            );

            // Save to localStorage for the recipient
            saveSubscriptionPurchase(user, creator, planId, duration);

            return result;
        },
        isBuying,
        isGifting
    };
}
