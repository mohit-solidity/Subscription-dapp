import { BaseError, ContractFunctionRevertedError } from 'viem';

/**
 * Industrial-strength contract error parser.
 * Extracts custom error names and revert reasons (require messages).
 */
export function parseContractError(error: any): string {
    if (!error) return "Unknown error occurred";

    // 1. Walk the error chain to find a revert error
    if (error instanceof BaseError) {
        const revertError = error.walk(err => err instanceof ContractFunctionRevertedError);

        if (revertError instanceof ContractFunctionRevertedError) {
            // Priority 1: Extract the 'reason' property (usually from Solidity 'require' or 'revert')
            const reason = (revertError as any).reason;
            if (reason) return reason;

            // Priority 2: Extract custom error name
            const errorName = revertError.data?.errorName;
            if (errorName) {
                switch (errorName) {
                    case 'InvalidAddress': return "The address provided is invalid.";
                    case 'NotEnoughBalance': return "Insufficient balance for this transaction.";
                    case 'NotTheCreator': return "Access denied: You are not registered as a creator.";
                    case 'TransactionFailed': return "The contract execution failed.";
                    case 'OwnableUnauthorizedAccount': return "Access denied: You are not the owner.";
                    case 'AmountZero': return "Amount must be greater than zero.";
                    case 'InvalidPlan': return "The specified subscription plan does not exist or is inactive.";
                    case 'AlreadySubscribed': return "You already have an active subscription.";
                    default: return `Contract Error: ${errorName}`;
                }
            }
        }

        // 2. Handle BaseError short message
        const shortMessage = error.shortMessage;
        if (shortMessage) {
            if (shortMessage.includes("User rejected")) return "Transaction rejected by user.";
            if (shortMessage.includes("insufficient funds")) return "Insufficient funds in wallet.";
            return shortMessage;
        }
    }

    // 3. Fallback to generic message parsing
    const message = error.message || error.toString() || "";
    if (message.includes("User rejected")) return "Transaction rejected by user.";
    if (message.includes("insufficient funds")) return "Insufficient funds in wallet.";
    if (message.includes("exceeds the balance")) return "Amount exceeds your wallet balance.";

    return message.length > 80 ? "Transaction failed. See console for details." : message;
}
