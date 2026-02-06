'use client';

import { Guard } from '@/components/Guard';
import { useAccount } from 'wagmi';
import { useCreatorProfile } from '@/hooks/useContractData';
import { useCreatorPlansList } from '@/hooks/useCreatorPlansList';
import { useCreatorActions } from '@/hooks/useCreatorActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatEther, parseEther } from 'viem';
import { useState } from 'react';
import { CONTRACT_ADDRESS } from '@/config/contract';
import { CONTRACT_ABI } from '@/config/abi';
import { useReadContract } from 'wagmi';
import toast from 'react-hot-toast';

export default function CreatorDashboard() {
    const { address } = useAccount();

    return (
        <Guard requireRole="CREATOR">
            <div className="container mx-auto py-8 space-y-8">
                <h1 className="text-3xl font-bold">Creator Dashboard</h1>

                <ProfileSection address={address} />

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <PlansList address={address} />
                    </div>
                    <div className="space-y-8">
                        <AddPlanForm />
                        <WithdrawSection address={address} />
                    </div>
                </div>
            </div>
        </Guard>
    );
}

function ProfileSection({ address }: { address?: string }) {
    const { data: profile } = useCreatorProfile(address);
    const { setCreatorData, isPending } = useCreatorActions();
    const [name, setName] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    if (!profile) return <div className="animate-pulse h-32 bg-gray-100 rounded-lg"></div>;

    const [currentName, balance, subscribers] = profile as [string, bigint, bigint];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-500">Creator Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold truncate">{currentName || 'Unnamed'}</div>
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                            Edit
                        </Button>
                    </div>
                    {isEditing && (
                        <div className="mt-4 flex gap-2">
                            <Input
                                placeholder="New Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={32}
                            />
                            <Button
                                onClick={() => { setCreatorData(name); setIsEditing(false); }}
                                disabled={isPending || !name.trim()}
                            >
                                Save
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-500">Earnings Balance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatEther(balance)} ETH</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-500">Total Subscribers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{Number(subscribers)}</div>
                </CardContent>
            </Card>
        </div>
    );
}

function PlansList({ address }: { address?: string }) {
    const { plans, isLoading, error } = useCreatorPlansList(address as `0x${string}`);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Subscription Plans</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="text-center py-4 space-y-2">
                        {[1, 2].map(i => <div key={i} className="animate-pulse h-16 bg-gray-50 rounded" />)}
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                        <p className="text-red-500 mb-2">⚠️ Failed to load plans</p>
                        <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
                            Retry Refetch
                        </Button>
                    </div>
                ) : plans.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No plans created yet. Add one to start earning!</div>
                ) : (
                    <div className="space-y-4">
                        {plans.map((plan) => (
                            <PlanItem key={plan.planId} planId={plan.planId} creatorAddress={address} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function PlanItem({ planId, creatorAddress }: { planId: number, creatorAddress?: string }) {
    const { data: plan } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS,
        functionName: 'creatorPlans',
        args: creatorAddress ? [creatorAddress as `0x${string}`, BigInt(planId)] : undefined,
        query: { enabled: !!creatorAddress }
    });

    const { activatePlan, deactivatePlan, isPending } = useCreatorActions();

    if (!plan) return <div className="animate-pulse h-16 bg-gray-100 rounded"></div>;

    const [price, duration, isActive] = plan as [bigint, bigint, boolean];

    return (
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
            <div>
                <div className="flex items-center gap-2">
                    <h4 className="font-bold">Plan #{planId}</h4>
                    {isActive ? (
                        <Badge variant="success">Active</Badge>
                    ) : (
                        <Badge variant="secondary">Inactive</Badge>
                    )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formatEther(price)} ETH / {Number(duration) / 86400} Days
                </div>
            </div>
            <div className="flex gap-2">
                {isActive ? (
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => deactivatePlan(planId)}
                        disabled={isPending}
                    >
                        Deactivate
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => activatePlan(planId)}
                        disabled={isPending}
                    >
                        Activate
                    </Button>
                )}
            </div>
        </div>
    );
}

function AddPlanForm() {
    const { addPlan, isPending } = useCreatorActions();
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [planId, setPlanId] = useState('');

    const handleAddPlan = () => {
        const id = parseInt(planId);
        const dur = parseInt(duration);
        if (isNaN(id) || isNaN(dur) || dur <= 0) {
            toast.error("Valid ID and Duration required");
            return;
        }
        try {
            const priceWei = parseEther(price);
            addPlan(id, priceWei, dur * 86400);
        } catch (e) {
            toast.error("Invalid price format");
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Input
                    placeholder="Plan ID (Unique number)"
                    type="number"
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                />
                <Input
                    placeholder="Price (ETH)"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />
                <Input
                    placeholder="Duration (Days)"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                />
                <Button
                    className="w-full"
                    onClick={handleAddPlan}
                    disabled={isPending || !price || !duration || !planId}
                >
                    Create Plan
                </Button>
            </CardContent>
        </Card>
    );
}

function WithdrawSection({ address }: { address?: string }) {
    const { creatorWithdraw, isPending } = useCreatorActions();
    const [amount, setAmount] = useState('');

    const handleWithdraw = () => {
        try {
            creatorWithdraw(parseEther(amount));
        } catch (e) {
            toast.error("Invalid amount");
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Withdraw Earnings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Input
                    placeholder="Amount in ETH"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <Button
                    className="w-full"
                    onClick={handleWithdraw}
                    disabled={isPending || !amount}
                >
                    Withdraw
                </Button>
            </CardContent>
        </Card>
    );
}
