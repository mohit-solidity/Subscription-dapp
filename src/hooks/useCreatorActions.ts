'use client';

import { useSmartWrite } from './useSmartWrite';
import { useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { addKnownPlanId } from '@/utils/storage';

export function useCreatorActions() {
    const queryClient = useQueryClient();
    const { address } = useAccount();

    const { sendTransaction: setData, isPending: isSettingData } = useSmartWrite('setCreatorData', {
        onSuccess: () => queryClient.invalidateQueries()
    });

    const { sendTransaction: addPlanWrite, isPending: isAddingPlan } = useSmartWrite('addPlan', {
        onSuccess: () => queryClient.invalidateQueries()
    });

    const { sendTransaction: activatePlanWrite, isPending: isActivating } = useSmartWrite('activatePlan', {
        onSuccess: () => queryClient.invalidateQueries()
    });

    const { sendTransaction: deactivatePlanWrite, isPending: isDeactivating } = useSmartWrite('deactivatePlan', {
        onSuccess: () => queryClient.invalidateQueries()
    });

    const { sendTransaction: withdraw, isPending: isWithdrawing } = useSmartWrite('creatorWithdraw', {
        onSuccess: () => queryClient.invalidateQueries()
    });

    return {
        setCreatorData: (name: string) => setData([name]),
        addPlan: async (id: number, price: bigint, duration: number) => {
            const res = await addPlanWrite([BigInt(id), price, BigInt(duration)]);
            if (address) addKnownPlanId(address, id);
            return res;
        },
        activatePlan: (id: number) => activatePlanWrite([BigInt(id)]),
        deactivatePlan: (id: number) => deactivatePlanWrite([BigInt(id)]),
        creatorWithdraw: (amount: bigint) => withdraw([amount]),
        isPending: isSettingData || isAddingPlan || isWithdrawing || isActivating || isDeactivating
    };
}
