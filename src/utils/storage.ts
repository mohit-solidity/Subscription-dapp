/**
 * LocalStorage utility to keep track of plan IDs created by users.
 * This ensures that even if a plan ID is outside the default scan range (1-20),
 * it will still be fetched and displayed.
 */

const STORAGE_PREFIX = 'subscription_dapp_known_plans_';

/**
 * Adds a new plan ID to the known list for a specific creator.
 */
export function addKnownPlanId(creator: string, planId: number): void {
    if (typeof window === 'undefined') return;

    const key = `${STORAGE_PREFIX}${creator.toLowerCase()}`;
    const stored = localStorage.getItem(key);
    const ids: number[] = stored ? JSON.parse(stored) : [];

    if (!ids.includes(planId)) {
        ids.push(planId);
        localStorage.setItem(key, JSON.stringify(ids));
    }
}

/**
 * Retrieves all known plan IDs for a specific creator.
 */
export function getKnownPlanIds(creator: string): number[] {
    if (typeof window === 'undefined') return [];

    const key = `${STORAGE_PREFIX}${creator.toLowerCase()}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
}
