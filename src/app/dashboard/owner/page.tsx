'use client';

import { Guard } from '@/components/Guard';
import { usePlatformStats } from '@/hooks/useContractData';
import { useOwnerActions } from '@/hooks/useOwnerActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatEther } from 'viem';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function OwnerDashboard() {
    return (
        <Guard requireRole="OWNER">
            <div className="container mx-auto py-8 space-y-8">
                <header className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Owner Dashboard</h1>
                </header>

                <StatsSection />

                <div className="grid md:grid-cols-2 gap-8">
                    <ControlsSection />
                    <CreatorManagementSection />
                </div>
            </div>
        </Guard>
    );
}

function StatsSection() {
    const { feeAPY, feeCollected, owner, isLoading } = usePlatformStats();

    if (isLoading) return <div className="grid grid-cols-3 gap-4 animate-pulse h-24 bg-gray-100 rounded-lg"></div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Fees Collected</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {feeCollected ? formatEther(feeCollected) : '0'} ETH
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Current Platform Fee</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {feeAPY ? (Number(feeAPY) / 100).toFixed(2) : '0'}%
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Contract Owner</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xs font-mono text-gray-600 truncate" title={owner}>
                        {owner}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function ControlsSection() {
    const { pauseContract, resumeContract, changeFee, collectFee, isPending } = useOwnerActions();
    const { feeAPY } = usePlatformStats();
    const [newFee, setNewFee] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');

    const handleUpdateFee = () => {
        const apyValue = parseInt(newFee);
        if (isNaN(apyValue) || apyValue < 0 || apyValue > 1000) {
            toast.error("Enter a valid Rate (0-1000)");
            return;
        }
        changeFee(apyValue);
    };

    const handleWithdraw = () => {
        const amount = parseFloat(withdrawAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Inter a valid withdrawal amount");
            return;
        }
        collectFee(BigInt(Math.floor(amount * 1e18)));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Platform Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Contract Status</h4>
                    <div className="flex gap-4">
                        <Button
                            variant="danger"
                            onClick={pauseContract}
                            disabled={isPending}
                        >
                            Pause Contract
                        </Button>
                        <Button
                            variant="primary"
                            onClick={resumeContract}
                            disabled={isPending}
                        >
                            Resume Contract
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Update Platform Fee</h4>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Rate (e.g. 100 = 1%)"
                            type="number"
                            value={newFee}
                            onChange={(e) => setNewFee(e.target.value)}
                        />
                        <Button
                            onClick={handleUpdateFee}
                            disabled={isPending || !newFee}
                        >
                            Update
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                        Current: {feeAPY ? (Number(feeAPY) / 100).toFixed(2) : 0}%
                    </p>
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Withdraw Fees</h4>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Amount in ETH"
                            type="number"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                        />
                        <Button
                            onClick={handleWithdraw}
                            disabled={isPending || !withdrawAmount}
                        >
                            Withdraw
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function CreatorManagementSection() {
    const { addCreator, removeCreator, isPending } = useOwnerActions();
    const [address, setAddress] = useState('');

    const validateAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Creator Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Manage Creators</h4>
                    <Input
                        placeholder="Creator Wallet Address (0x...)"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={!address || validateAddress(address) ? "" : "border-red-500"}
                    />
                    <div className="flex gap-2 mt-2">
                        <Button
                            variant="primary"
                            onClick={() => addCreator(address)}
                            disabled={isPending || !validateAddress(address)}
                            className="flex-1"
                        >
                            Add Creator
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => removeCreator(address)}
                            disabled={isPending || !validateAddress(address)}
                            className="flex-1"
                        >
                            Remove Creator
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
