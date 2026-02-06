'use client';

import { useState, useEffect, useRef } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient, useAccount } from 'wagmi';
import { CONTRACT_ADDRESS, TARGET_CHAIN_ID } from '@/config/contract';
import { CONTRACT_ABI as ABI } from '@/config/abi';
import { parseContractError } from '@/utils/errors';
import toast from 'react-hot-toast';

interface UseTransactionConfig {
    onSuccess?: (hash: `0x${string}`) => void;
    enabled?: boolean;
}

/**
 * Industrial-strength write wrapper.
 * Features: Automatic loading toasts, Simulation on-chain, Success/Failure tracking, Chain enforcement.
 */
export function useSmartWrite(
    functionName: string,
    config?: UseTransactionConfig
) {
    const publicClient = usePublicClient();
    const { address } = useAccount();
    const { writeContractAsync, isPending: isWritePending, error: writeError } = useWriteContract();
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
    const [activeId, setActiveId] = useState<string | undefined>(undefined);

    const { isLoading: isConfirming, isSuccess: isConfirmed, error: receiptError } =
        useWaitForTransactionReceipt({ hash: txHash, chainId: TARGET_CHAIN_ID });

    // Handle confirmation feedback
    useEffect(() => {
        if (isConfirmed && activeId) {
            toast.success('Transaction Confirmed!', { id: activeId });
            setActiveId(undefined);
            if (txHash && config?.onSuccess) {
                config.onSuccess(txHash);
            }
        }
        if (receiptError && activeId) {
            const msg = parseContractError(receiptError);
            toast.error(`Transaction Failed: ${msg}`, { id: activeId });
            setActiveId(undefined);
        }
    }, [isConfirmed, receiptError, activeId, txHash, config]);

    const isPending = isWritePending || isConfirming;

    const sendTransaction = async (args: any[], options?: { value?: bigint }) => {
        const id = toast.loading('Simulating transaction...') as string;
        setActiveId(id);

        try {
            // 1. Simulation Step
            if (publicClient && address) {
                try {
                    await publicClient.simulateContract({
                        address: CONTRACT_ADDRESS,
                        abi: ABI,
                        functionName: functionName as any,
                        args: args as any,
                        account: address,
                        value: options?.value as any
                    });
                } catch (simError: any) {
                    const msg = parseContractError(simError);
                    toast.error(`Simulation Failed: ${msg}`, { id });
                    setActiveId(undefined);
                    throw simError;
                }
            }

            toast.loading('Waiting for wallet confirmation...', { id });

            // 2. Actual Transaction
            const hash = await writeContractAsync({
                abi: ABI as any,
                address: CONTRACT_ADDRESS,
                functionName,
                args,
                value: options?.value,
                chainId: TARGET_CHAIN_ID,
            });

            setTxHash(hash);
            toast.loading('Mining transaction... please wait', { id });

            return hash;
        } catch (err: any) {
            if (err.name === 'ContractFunctionExecutionError' || err.name === 'EstimateGasError') {
                // Already toasted
            } else {
                const msg = parseContractError(err);
                if (msg.toLowerCase().includes('rejected')) {
                    toast.dismiss(id);
                } else {
                    toast.error(msg, { id });
                }
            }
            setActiveId(undefined);
            throw err;
        }
    };

    return {
        sendTransaction,
        isPending,
        isConfirmed,
        error: writeError || receiptError,
        txHash
    };
}
