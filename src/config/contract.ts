export const CONTRACT_ADDRESS = "0x56A58624f42A84B4e1B3d286Ee6e1CDc1797Fec9" as const;
export const OWNER_ADDRESS = "0xb4df6ac663383fb70bf1171d10f458c41933f85b" as const;

// Assuming Sepolia for now, but this should be matched with the chain ID the contract is deployed on.
// If local, change to localhost.
export const TARGET_CHAIN_ID = 11155111; // Sepolia

export { CONTRACT_ABI } from './abi';
