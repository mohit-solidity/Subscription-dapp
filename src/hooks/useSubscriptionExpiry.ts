'use client';

import { useMemo, useEffect, useState } from 'react';
import { useReadContract, useBlockNumber } from 'wagmi';
import { CONTRACT_ABI } from '@/config/abi';
import { CONTRACT_ADDRESS } from '@/config/contract';

/**
 * Hook to get subscription expiry information from the blockchain contract
 * Reads from subscriptionBoughtDuration mapping and calculates time remaining
 */
export function useSubscriptionExpiry(
    userAddress: string | undefined,
    creatorAddress: string | undefined
) {
    const [currentTime, setCurrentTime] = useState(Date.now());

    // Read the subscription expiry timestamp from contract
    const { data: expiryTimestamp, isLoading } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS,
        functionName: 'subscriptionBoughtDuration',
        args: userAddress && creatorAddress ? [userAddress as `0x${string}`, creatorAddress as `0x${string}`] : undefined,
        query: {
            enabled: !!userAddress && !!creatorAddress,
            refetchInterval: 30000, // Refetch every 30 seconds
        }
    });

    // Update current time every 30 seconds to recalculate remaining time
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 30 * 1000);

        return () => clearInterval(interval);
    }, []);

    const expiryData = useMemo(() => {
        if (!expiryTimestamp || typeof expiryTimestamp !== 'bigint') {
            return {
                isExpired: false,
                daysRemaining: null,
                hoursRemaining: null,
                minutesRemaining: null,
                secondsRemaining: null,
                isExpiringSoon: false,
                expiryTimestamp: null,
            };
        }

        const timestamp = Number(expiryTimestamp);

        // If no subscription exists (timestamp is 0)
        if (timestamp === 0) {
            return {
                isExpired: false,
                daysRemaining: null,
                hoursRemaining: null,
                minutesRemaining: null,
                secondsRemaining: null,
                isExpiringSoon: false,
                expiryTimestamp: null,
            };
        }

        // Calculate time remaining in seconds
        const nowInSeconds = Math.floor(currentTime / 1000);
        const remainingSeconds = timestamp - nowInSeconds;

        // Check if expired
        const isExpired = remainingSeconds <= 0;

        if (isExpired) {
            return {
                isExpired: true,
                daysRemaining: 0,
                hoursRemaining: 0,
                minutesRemaining: 0,
                secondsRemaining: 0,
                isExpiringSoon: false,
                expiryTimestamp: timestamp,
            };
        }

        // Calculate days, hours, minutes
        const days = Math.floor(remainingSeconds / 86400);
        const hours = Math.floor((remainingSeconds % 86400) / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        const seconds = remainingSeconds % 60;

        // Check if expiring soon (less than 3 days)
        const isExpiringSoon = days < 3;

        return {
            isExpired: false,
            daysRemaining: days,
            hoursRemaining: hours,
            minutesRemaining: minutes,
            secondsRemaining: seconds,
            isExpiringSoon,
            expiryTimestamp: timestamp,
        };
    }, [expiryTimestamp, currentTime]);

    return {
        ...expiryData,
        isLoading,
    };
}
