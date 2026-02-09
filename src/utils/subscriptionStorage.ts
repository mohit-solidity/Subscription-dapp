'use client';

/**
 * Utility functions for tracking subscription purchases in localStorage
 */

export interface SubscriptionRecord {
    creatorAddress: string;
    planId: number;
    purchaseTimestamp: number; // Unix timestamp in seconds
    duration: number; // Duration in seconds
    expiryTimestamp: number; // Unix timestamp in seconds
}

const STORAGE_KEY = 'subscription_purchases';

/**
 * Save a subscription purchase to localStorage
 */
export function saveSubscriptionPurchase(
    userAddress: string,
    creatorAddress: string,
    planId: number,
    duration: number
) {
    try {
        const now = Math.floor(Date.now() / 1000);
        const record: SubscriptionRecord = {
            creatorAddress,
            planId,
            purchaseTimestamp: now,
            duration,
            expiryTimestamp: now + duration,
        };

        const key = `${STORAGE_KEY}_${userAddress.toLowerCase()}_${creatorAddress.toLowerCase()}`;
        localStorage.setItem(key, JSON.stringify(record));
    } catch (error) {
        console.error('Failed to save subscription purchase:', error);
    }
}

/**
 * Get a subscription purchase record from localStorage
 */
export function getSubscriptionPurchase(
    userAddress: string | undefined,
    creatorAddress: string | undefined
): SubscriptionRecord | null {
    if (!userAddress || !creatorAddress) return null;

    try {
        const key = `${STORAGE_KEY}_${userAddress.toLowerCase()}_${creatorAddress.toLowerCase()}`;
        const stored = localStorage.getItem(key);
        if (!stored) return null;

        return JSON.parse(stored) as SubscriptionRecord;
    } catch (error) {
        console.error('Failed to get subscription purchase:', error);
        return null;
    }
}

/**
 * Calculate time remaining for a subscription
 */
export function calculateTimeRemaining(record: SubscriptionRecord | null) {
    if (!record) {
        return {
            isExpired: false,
            timeRemaining: null,
            expiryDate: null,
            daysRemaining: null,
            hoursRemaining: null,
            minutesRemaining: null,
            isExpiringSoon: false,
            purchaseDate: null,
        };
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timeRemainingSeconds = record.expiryTimestamp - currentTimestamp;

    const isExpired = timeRemainingSeconds <= 0;
    const daysRemaining = Math.floor(timeRemainingSeconds / 86400);
    const hoursRemaining = Math.floor((timeRemainingSeconds % 86400) / 3600);
    const minutesRemaining = Math.floor((timeRemainingSeconds % 3600) / 60);
    const isExpiringSoon = daysRemaining < 7 && !isExpired;

    return {
        isExpired,
        timeRemaining: timeRemainingSeconds,
        expiryDate: new Date(record.expiryTimestamp * 1000),
        daysRemaining: isExpired ? 0 : daysRemaining,
        hoursRemaining: isExpired ? 0 : hoursRemaining,
        minutesRemaining: isExpired ? 0 : minutesRemaining,
        isExpiringSoon,
        purchaseDate: new Date(record.purchaseTimestamp * 1000),
    };
}
