'use client';

import { useParams } from 'next/navigation';
import { useCreatorProfile, useUserActivePlan } from '@/hooks/useContractData';
import { useCreatorPlansList } from '@/hooks/useCreatorPlansList';
import { useUserActions } from '@/hooks/useUserActions';
import { useSubscriptionExpiry } from '@/hooks/useSubscriptionExpiry';
import { useReadContract, useAccount } from 'wagmi';
import { CONTRACT_ABI } from '@/config/abi';
import { CONTRACT_ADDRESS } from '@/config/contract';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/Navbar';
import { SubscriptionExpiryDate } from '@/components/SubscriptionExpiryDate';
import { formatEther } from 'viem';
import { Input } from '@/components/ui/Input';
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';

export default function CreatorPage() {
    const params = useParams();
    const address = params?.address as string | undefined;
    const { address: userAddress } = useAccount();
    const { data: profile, isLoading: isProfileLoading } = useCreatorProfile(address);
    const { plans: allPlans, isLoading: isLoadingPlans, error: plansError } = useCreatorPlansList(address as `0x${string}`);
    const { data: activePlanIdResult } = useUserActivePlan(userAddress, address);

    const activePlanId = activePlanIdResult ? Number(activePlanIdResult) : 0;

    const plans = allPlans; // Show all plans, no filtering


    if (!address) return <div className="p-12 text-center">Invalid Address</div>;

    return (
        <>
            <Navbar />
            <div className="container mx-auto py-12 px-4 text-center">
                {/* Profile Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-4">
                        {isProfileLoading ? 'Loading profile...' : ((profile as any)?.[0] || 'Unknown Creator')}
                    </h1>
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-500 text-sm">
                        {address}
                    </code>
                </div>

                <h2 className="text-2xl font-bold mb-6">Subscription Plans</h2>

                {isLoadingPlans ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
                    </div>
                ) : plansError ? (
                    <div className="text-gray-500 py-12 border-2 border-dashed rounded-xl max-w-md mx-auto">
                        <p className="text-red-500 mb-4">⚠️ We couldn't load this creator's plans.</p>
                        <Button variant="outline" onClick={() => window.location.reload()}>
                            Refresh Page
                        </Button>
                    </div>
                ) : plans.length === 0 ? (
                    <div className="text-gray-500">This creator has no active plans.</div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {plans.map((plan) => (
                            <SubscriptionPlanCard
                                key={plan.planId}
                                planId={plan.planId}
                                creatorAddress={address}
                                isActiveSubscription={plan.planId === activePlanId}
                                isSubscriber={activePlanId > 0}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function SubscriptionPlanCard({
    planId,
    creatorAddress,
    isActiveSubscription,
    isSubscriber
}: {
    planId: number,
    creatorAddress: string,
    isActiveSubscription: boolean,
    isSubscriber: boolean
}) {
    const { address: userAddress } = useAccount();

    const { data: plan } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS,
        functionName: 'creatorPlans',
        args: [creatorAddress as `0x${string}`, BigInt(planId)],
        query: { enabled: !!creatorAddress }
    });

    const { buySubscription, giftSubscription, isBuying, isGifting } = useUserActions();
    const [isGiftingMode, setIsGiftingMode] = useState(false);
    const [recipient, setRecipient] = useState('');

    // Get subscription expiry data for active subscription
    const {
        isExpired,
        daysRemaining,
        hoursRemaining,
        minutesRemaining,
        isExpiringSoon,
        isLoading: isLoadingExpiry
    } = useSubscriptionExpiry(
        isActiveSubscription ? userAddress : undefined,
        isActiveSubscription ? creatorAddress : undefined
    );

    if (!plan) return <Card className="animate-pulse h-64 shadow-sm" />;

    const [price, duration, isActive] = plan as [bigint, bigint, boolean];
    if (!isActive) return null;

    const days = Number(duration) / 86400;
    const priceEth = formatEther(price);
    const durationSeconds = Number(duration);

    const handleBuy = async () => {
        try {
            await buySubscription({ creator: creatorAddress, planId, price: priceEth, duration: durationSeconds });
        } catch (e) { /* Error handled in hook */ }
    };

    const handleGift = async () => {
        if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
            toast.error("Valid recipient address required");
            return;
        }
        try {
            await giftSubscription({ user: recipient, creator: creatorAddress, planId, price: priceEth, duration: durationSeconds });
        } catch (e) { /* Error handled in hook */ }
    };

    // Format time remaining display
    const getTimeRemainingText = () => {
        if (isExpired) return "Expired";
        if (daysRemaining !== null && daysRemaining > 0) {
            return `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`;
        }
        if (hoursRemaining !== null && hoursRemaining > 0) {
            return `${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''} remaining`;
        }
        if (minutesRemaining !== null) {
            return `${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''} remaining`;
        }
        return "Expiring soon";
    };

    return (
        <Card className={`transition-all border-2 bg-white dark:bg-gray-900 shadow-xl ${isActiveSubscription
            ? isExpired
                ? 'border-red-500 ring-2 ring-red-500/20'
                : isExpiringSoon
                    ? 'border-yellow-500 ring-2 ring-yellow-500/20'
                    : 'border-green-500 ring-2 ring-green-500/20'
            : 'hover:border-blue-500 border-transparent'
            }`}>
            <CardHeader className="relative">
                {isActiveSubscription && (
                    <div className={`absolute top-2 right-2 ${isExpired
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                        : isExpiringSoon
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                        } text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider`}>
                        {isExpired ? 'Expired' : 'Active'}
                    </div>
                )}
                <CardTitle className="text-xl">Plan #{planId}</CardTitle>
                <div className="text-4xl font-bold my-4">{priceEth} ETH</div>
                <div className="text-gray-500 text-sm">Valid for {days} days</div>

                {/* Time Remaining Display */}
                {isActiveSubscription && !isLoadingExpiry && (
                    <div className={`mt-3 pt-3 border-t ${isExpired
                        ? 'border-red-200 dark:border-red-800'
                        : isExpiringSoon
                            ? 'border-yellow-200 dark:border-yellow-800'
                            : 'border-green-200 dark:border-green-800'
                        }`}>
                        {daysRemaining !== null ? (
                            <>
                                <div className={`text-sm font-semibold ${isExpired
                                    ? 'text-red-600 dark:text-red-400'
                                    : isExpiringSoon
                                        ? 'text-yellow-600 dark:text-yellow-400'
                                        : 'text-green-600 dark:text-green-400'
                                    }`}>
                                    {isExpired ? '⚠️ Subscription Expired' : `⏱️ ${getTimeRemainingText()}`}
                                </div>
                                {isExpiringSoon && !isExpired && (
                                    <div className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                                        Renew soon to avoid interruption
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                                ✓ Active Subscription
                            </div>
                        )}
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Expiry Date Display - Show full date/time for active subscriptions */}
                {isActiveSubscription && userAddress && (
                    <SubscriptionExpiryDate
                        userAddress={userAddress}
                        creatorAddress={creatorAddress}
                    />
                )}

                {!isGiftingMode ? (
                    <div className="space-y-3">
                        {/* Only show Subscribe button if user doesn't have an active subscription */}
                        {!isSubscriber && (
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleBuy}
                                isLoading={isBuying}
                            >
                                Subscribe Now
                            </Button>
                        )}

                        {/* Show Renew button if subscription is expired */}
                        {isActiveSubscription && isExpired && (
                            <Button
                                className="w-full bg-red-600 hover:bg-red-700"
                                size="lg"
                                onClick={handleBuy}
                                isLoading={isBuying}
                            >
                                Renew Subscription
                            </Button>
                        )}

                        {/* Gift button - always available to everyone */}
                        <Button
                            variant={isActiveSubscription ? "primary" : "outline"}
                            className="w-full"
                            onClick={() => setIsGiftingMode(true)}
                        >
                            Gift as Token
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                        <Input
                            placeholder="Recipient Address (0x...)"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                        />
                        <Button
                            className="w-full"
                            onClick={handleGift}
                            isLoading={isGifting}
                            disabled={!recipient}
                        >
                            Send Gift
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsGiftingMode(false)}
                            className="w-full"
                        >
                            Cancel
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
