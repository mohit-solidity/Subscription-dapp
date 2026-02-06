'use client';

import { useReadContract, useReadContracts } from 'wagmi';
import { CONTRACT_ADDRESS, TARGET_CHAIN_ID } from '@/config/contract';
import { CONTRACT_ABI as ABI } from '@/config/abi';

/**
 * Enhanced generic read hook with strict typing and enabled guards.
 */
export function useContractRead(
    functionName: string,
    args: any[] = [],
    enabled: boolean = true
) {
    return useReadContract({
        abi: ABI,
        address: CONTRACT_ADDRESS,
        functionName: functionName as any,
        args: args as any,
        query: {
            enabled: enabled && !!CONTRACT_ADDRESS,
            staleTime: 30 * 1000,
            gcTime: 5 * 60 * 1000,
        },
        chainId: TARGET_CHAIN_ID
    });
}

/**
 * Fetch all creators list.
 */
export function useAllCreators() {
    return useContractRead('getAllCreators');
}

/**
 * Fetch specific creator profile.
 */
export function useCreatorProfile(address: string | undefined) {
    const safeAddress = address as `0x${string}` | undefined;
    return useContractRead('creatorProfile', safeAddress ? [safeAddress] : [], !!safeAddress);
}

/**
 * Fetch platform statistics using Multicall (useReadContracts) for efficiency.
 */
export function usePlatformStats() {
    const contractConfig = {
        abi: ABI,
        address: CONTRACT_ADDRESS,
        chainId: TARGET_CHAIN_ID,
    } as const;

    const { data, isLoading, error } = useReadContracts({
        contracts: [
            { ...contractConfig, functionName: 'feeAPY' },
            { ...contractConfig, functionName: 'feeCollected' },
            { ...contractConfig, functionName: 'owner' },
        ],
        query: {
            staleTime: 60 * 1000,
        }
    });

    return {
        feeAPY: data?.[0]?.result as bigint | undefined,
        feeCollected: data?.[1]?.result as bigint | undefined,
        owner: data?.[2]?.result as string | undefined,
        isLoading,
        error
    };
}

/**
 * Fetch specific plan details.
 */
export function useCreatorPlan(creator: string | undefined, planId: number) {
    const safeCreator = creator as `0x${string}` | undefined;
    return useContractRead(
        'creatorPlans',
        safeCreator ? [safeCreator, BigInt(planId)] : [],
        !!safeCreator
    );
}
/**
 * Fetch a user's active plan ID for a specific creator.
 */
export function useUserActivePlan(user: string | undefined, creator: string | undefined) {
    const safeUser = user as `0x${string}` | undefined;
    const safeCreator = creator as `0x${string}` | undefined;
    return useContractRead(
        'activePlan',
        safeUser && safeCreator ? [safeUser, safeCreator] : [],
        !!safeUser && !!safeCreator
    );
}

/**
 * Fetch all creator profiles in bulk.
 */
export function useAllCreatorProfiles(addresses: readonly string[] | undefined) {
    const contracts = (addresses || []).map((addr) => ({
        abi: ABI,
        address: CONTRACT_ADDRESS,
        functionName: 'creatorProfile',
        args: [addr as `0x${string}`],
        chainId: TARGET_CHAIN_ID,
    }));

    return useReadContracts({
        contracts,
        query: {
            enabled: !!addresses && addresses.length > 0,
            staleTime: 60 * 1000,
        }
    });
}
