'use client';

import { useReadContracts } from 'wagmi';
import { CONTRACT_ADDRESS, TARGET_CHAIN_ID, CONTRACT_ABI } from '@/config/contract';
import { useMemo } from 'react';
import { getKnownPlanIds } from '@/utils/storage';

type Plan = {
    planId: number;
    price: bigint;
    duration: bigint;
    isActive: boolean;
};

export function useCreatorPlansList(creatorAddress: `0x${string}` | undefined) {
    // 👇 Combine default scan range (1-20) with specifically known IDs from storage
    const targetIds = useMemo(() => {
        if (!creatorAddress) return [];

        const defaultRange = Array.from({ length: 61 }, (_, i) => i);
        const knownIds = getKnownPlanIds(creatorAddress);

        // Remove duplicates and sort
        return Array.from(new Set([...defaultRange, ...knownIds])).sort((a, b) => a - b);
    }, [creatorAddress]);

    // 👇 Construct direct mapping read calls (Multicall optimization)
    const contracts = useMemo(() => {
        if (!creatorAddress || targetIds.length === 0) return [];

        return targetIds.map((id) => ({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'creatorPlans',
            args: [creatorAddress, BigInt(id)],
            chainId: TARGET_CHAIN_ID,
        } as const));
    }, [creatorAddress, targetIds]);

    const { data: results, isLoading, error } = useReadContracts({
        contracts,
        query: {
            enabled: !!creatorAddress && targetIds.length > 0,
            staleTime: 2 * 60 * 1000, // 2 minutes
        }
    });

    // 👇 Process multicall results into a clean Plan array
    const plans = useMemo<Plan[]>(() => {
        if (!results || !targetIds.length) return [];

        return results
            .map((res, index) => {
                if (res.status === 'success' && res.result) {
                    const [price, duration, isActive] = res.result as [bigint, bigint, boolean];
                    if (price > 0n) {
                        return {
                            planId: targetIds[index],
                            price,
                            duration,
                            isActive
                        };
                    }
                }
                return null;
            })
            .filter((p): p is Plan => p !== null);
    }, [results, targetIds]);

    return { plans, isLoading, error };
}
