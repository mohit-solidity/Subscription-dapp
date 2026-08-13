# Subscription dApp

A decentralized subscription platform built with **Solidity, Next.js, React, Ethers.js, Wagmi, and RainbowKit**.

The platform allows creators to create subscription plans and users to purchase subscriptions using ETH. Each active subscription is represented by an **ERC-721 NFT**, which acts as an on-chain proof of the user's subscription.

## Features

### For Creators

* Create a creator profile with a unique username
* Create multiple subscription plans
* Set the price and duration for each plan
* Activate or deactivate subscription plans
* View creator balance
* Withdraw earned ETH
* Track the number of subscribers

### For Users

* Connect a Web3 wallet
* Browse available creators
* View creator subscription plans
* Purchase a subscription using ETH
* Renew subscriptions
* Gift a subscription to another address
* Receive an NFT representing the subscription
* Check whether a subscription is currently active

### Smart Contract Features

* Creator management
* Subscription plan management
* Subscription payments in ETH
* Subscription expiry tracking
* Subscription renewal
* Subscription gifting
* Creator withdrawals
* Platform fee collection
* Contract pause/resume functionality
* Reentrancy protection
* Custom Solidity errors
* On-chain events
* ERC-721 subscription NFTs

## How It Works

The basic flow is:

```text
User
  │
  │ Connect Wallet
  ▼
Next.js Frontend
  │
  │ Contract Interaction
  ▼
Subscription Contract
  │
  ├── Creator Management
  ├── Subscription Plans
  ├── ETH Payments
  ├── Subscription Expiry
  └── Platform Fees
  │
  ▼
SubscriptionNFT Contract
  │
  └── ERC-721 Subscription NFT
```

When a user purchases a subscription:

1. The user selects a creator and subscription plan.
2. The frontend sends the required ETH to the `Subscription` contract.
3. The contract verifies the creator, plan, price, and subscription state.
4. The subscription expiry timestamp is calculated.
5. A platform fee is deducted.
6. The remaining amount is credited to the creator.
7. The `SubscriptionNFT` contract mints an NFT for the user.
8. The NFT stores the creator, subscriber, and expiry information.
9. The subscription can later be checked directly on-chain.

## Smart Contracts

### `Subscription.sol`

The main contract responsible for the subscription system.

It manages:

* Creators
* Creator profiles
* Subscription plans
* Subscription purchases
* Subscription renewals
* Gift subscriptions
* Creator balances
* Platform fees
* Subscription validation
* Contract administration

Important functions include:

```solidity
addCreator()
removeCreator()
setCreatorData()
addPlan()
activatePlan()
deactivatePlan()
buyOrRenewSubscription()
giftSubscription()
creatorWithdraw()
isValidSubscription()
collectFee()
pauseContract()
resumeContract()
```

The contract also uses OpenZeppelin's `Ownable` and `ReentrancyGuard`.

### `SubscriptionNFT.sol`

An ERC-721 contract used to represent subscriptions as NFTs.

Each subscription NFT stores:

```solidity
struct NFT {
    address creator;
    address user;
    uint expiry;
}
```

The NFT contract supports:

* Minting subscription NFTs
* Renewing existing subscription NFTs
* Checking subscription validity
* Reading subscription expiry

A user receives one NFT per creator. Renewing the subscription updates the existing NFT's expiry rather than minting another NFT.

## Fee System

The platform charges a configurable fee whenever a subscription is purchased.

The contract stores the fee in basis points:

```solidity
feeAPY
```

For example:

```text
200 = 2%
500 = 5%
1000 = 10%
```

The maximum fee is limited to **10%**.

The payment is split into:

```text
Subscription Payment
        │
        ├── Platform Fee
        │
        └── Creator Balance
```

Creators can withdraw their accumulated balance, while the contract owner can collect the accumulated platform fees.

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Lucide React
* React Hot Toast

### Web3

* Solidity
* Ethers.js
* Wagmi
* Viem
* RainbowKit

### Smart Contracts

* Solidity `^0.8.20`
* OpenZeppelin Contracts
* ERC-721
* Ownable
* ReentrancyGuard

The current `package.json` confirms the frontend dependencies include Next.js, React, Ethers.js, Wagmi, Viem, RainbowKit, and Tailwind CSS.

## Project Structure

```text
Subscription-dapp/
│
├── contracts/
│   ├── subscription.sol
│   └── subscriptionNFT.sol
│
├── public/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── config/
│   ├── hooks/
│   ├── utils/
│   ├── providers.tsx
│   └── wagmi.ts
│
├── package.json
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

The repository separates the Solidity contracts under `contracts/` and the Next.js application under `src/`.

## Getting Started

### Prerequisites

Make sure you have installed:

* Node.js
* npm
* Git
* MetaMask or another compatible Web3 wallet

### Clone the Repository

```bash
git clone https://github.com/mohit-solidity/Subscription-dapp.git

cd Subscription-dapp
```

### Install Dependencies

```bash
npm install
```

### Start the Development Server

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev
```

Starts the Next.js development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run start
```

Starts the production server.

```bash
npm run lint
```

Runs ESLint.

## Security Considerations

This project is intended primarily as a learning and development project.

The contracts use several OpenZeppelin security primitives, including:

* `Ownable` for administrative access control
* `ReentrancyGuard` for withdrawal protection
* Solidity custom errors
* Checks before transferring ETH
* Contract pause functionality

However, **the contracts have not been professionally audited**.

Do not use the contracts with real funds without conducting a complete security review and audit.

## Learning Objectives

This project demonstrates several important Web3 development concepts:

* Solidity smart contract architecture
* Contract-to-contract interaction
* ERC-721 NFTs
* ETH payments
* Subscription expiry using `block.timestamp`
* Access control
* Reentrancy protection
* Custom errors
* Solidity events
* React + Web3 integration
* Wallet connection
* Contract reads and writes
* Transaction handling
* On-chain state management

## Future Improvements

Potential improvements include:

* Automatic subscription renewal
* Stablecoin payments
* More flexible billing periods
* Subscription cancellation/refunds
* Creator analytics
* Subscription history
* NFT metadata
* Multi-chain support
* Better gas optimization
* Comprehensive Foundry tests
* Smart contract security audit
* Decentralized metadata storage

## Disclaimer

This project is for **educational and experimental purposes**.

The smart contracts have not been professionally audited. Use at your own risk and do not deposit funds that you cannot afford to lose.

## Author

**Mohit Sharma**

Blockchain Developer | Solidity • React.js • Ethers.js

GitHub:
https://github.com/mohit-solidity

Repository:
https://github.com/mohit-solidity/Subscription-dapp
