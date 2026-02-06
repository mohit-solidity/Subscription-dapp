'use client';

import { useSmartWrite } from './useSmartWrite';
import { useQueryClient } from '@tanstack/react-query';

export function useOwnerActions() {
    const queryClient = useQueryClient();

    const { sendTransaction: pauseContract, isPending: isPausing } = useSmartWrite('pauseContract', {
        onSuccess: () => queryClient.invalidateQueries()
    });

    const { sendTransaction: resumeContract, isPending: isResuming } = useSmartWrite('resumeContract', {
        onSuccess: () => queryClient.invalidateQueries()
    });

    const { sendTransaction: updateFee, isPending: isUpdatingFee } = useSmartWrite('changeFee', {
        onSuccess: () => queryClient.invalidateQueries()
    });

    const { sendTransaction: addCreatorWrite, isPending: isAdding } = useSmartWrite('addCreator', {
        onSuccess: () => queryClient.invalidateQueries()
    });

    const { sendTransaction: removeCreatorWrite, isPending: isRemoving } = useSmartWrite('removeCreator', {
        onSuccess: () => queryClient.invalidateQueries()
    });

    const { sendTransaction: collectFeeWrite, isPending: isCollecting } = useSmartWrite('collectFee', {
        onSuccess: () => queryClient.invalidateQueries()
    });

    return {
        pauseContract: () => pauseContract([]),
        resumeContract: () => resumeContract([]),
        changeFee: (apy: number) => updateFee([BigInt(apy)]),
        addCreator: (address: string) => addCreatorWrite([address as `0x${string}`]),
        removeCreator: (address: string) => removeCreatorWrite([address as `0x${string}`]),
        collectFee: (amount: bigint) => collectFeeWrite([amount]),
        isPending: isPausing || isResuming || isUpdatingFee || isAdding || isRemoving || isCollecting
    };
}
