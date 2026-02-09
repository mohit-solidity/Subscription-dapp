import { useReadContract } from 'wagmi';
import { CONTRACT_ABI } from '@/config/abi';
import { CONTRACT_ADDRESS } from '@/config/contract';
import { useMemo } from 'react';

interface SubscriptionExpiryDateProps {
    userAddress?: `0x${string}`;
    creatorAddress?: string;
}

/**
 * Component to display the exact subscription expiry date and time
 */
export function SubscriptionExpiryDate({ userAddress, creatorAddress }: SubscriptionExpiryDateProps) {
    // Read the subscription expiry timestamp from contract
    const { data: expiryTimestamp } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS,
        functionName: 'subscriptionBoughtDuration',
        args: userAddress && creatorAddress ? [userAddress, creatorAddress as `0x${string}`] : undefined,
        query: {
            enabled: !!userAddress && !!creatorAddress,
        }
    });

    const { expiryDate, formattedDate, formattedTime } = useMemo(() => {
        if (!expiryTimestamp || typeof expiryTimestamp !== 'bigint') {
            return { expiryDate: null, formattedDate: '', formattedTime: '' };
        }

        const timestamp = Number(expiryTimestamp);
        if (timestamp === 0) {
            return { expiryDate: null, formattedDate: '', formattedTime: '' };
        }

        const date = new Date(timestamp * 1000);

        // Format options
        const dateOptions: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };

        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        };

        return {
            expiryDate: date,
            formattedDate: date.toLocaleDateString('en-US', dateOptions),
            formattedTime: date.toLocaleTimeString('en-US', timeOptions),
        };
    }, [expiryTimestamp]);

    if (!expiryDate) {
        return null;
    }

    const isExpired = expiryDate < new Date();

    return (
        <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 ${isExpired ? 'text-red-500' : 'text-blue-500'}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
                <div className="flex-1">
                    <p className={`text-sm font-semibold ${isExpired ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {isExpired ? 'Subscription Expired On:' : 'Subscription Expires On:'}
                    </p>
                    <p className="text-base font-bold text-gray-900 dark:text-gray-100 mt-1">
                        {formattedDate}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        at {formattedTime}
                    </p>
                </div>
            </div>
        </div>
    );
}
