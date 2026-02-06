import { parseEther, formatEther } from 'viem';

export function parseDecimal(value: string | number): bigint {
    if (!value) return 0n;
    return parseEther(value.toString());
}

export function formatDecimal(value: bigint | undefined): string {
    if (!value) return '0';
    return formatEther(value);
}
