'use client';

import { useAccount, useReadContracts } from 'wagmi';
import { CONTRACT_ABI as ABI } from '@/config/abi';
import { CONTRACT_ADDRESS, TARGET_CHAIN_ID } from '@/config/contract';

/**
 * Standardized Role Detection hook.
 */
export function useRoles() {
    const { address, isConnected } = useAccount();

    const contractConfig = {
        abi: ABI,
        address: CONTRACT_ADDRESS,
        chainId: TARGET_CHAIN_ID,
    } as const;

    const { data: results, isLoading } = useReadContracts({
        contracts: [
            { ...contractConfig, functionName: 'isCreator', args: address ? [address] : [] } as any,
            { ...contractConfig, functionName: 'owner' } as any,
        ],
        query: {
            enabled: !!address,
            staleTime: 60 * 1000, // Roles don't change often
        }
    });

    const isCreatorResult = results?.[0]?.result as boolean | undefined;
    const ownerResult = results?.[1]?.result as string | undefined;

    const isOwner = isConnected && address && ownerResult
        ? address.toLowerCase() === ownerResult.toLowerCase()
        : false;

    const isCreator = !!isCreatorResult;

    return {
        isOwner,
        isCreator,
        isUser: isConnected && !isOwner && !isCreator,
        isLoading: isConnected ? isLoading : false,
        role: isOwner ? 'OWNER' : (isCreator ? 'CREATOR' : 'USER')
    };
}
