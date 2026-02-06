export const CONTRACT_ADDRESS = "0xf04b989FfcAa939e9867E7280afa6FEE90770Ae2" as const;
export const OWNER_ADDRESS = "0xb4df6ac663383fb70bf1171d10f458c41933f85b" as const;

// Assuming Sepolia for now, but this should be matched with the chain ID the contract is deployed on.
// If local, change to localhost.
export const TARGET_CHAIN_ID = 11155111; // Sepolia

export { CONTRACT_ABI } from './abi';
