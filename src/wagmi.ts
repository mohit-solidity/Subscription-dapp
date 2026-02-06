import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia } from 'wagmi/chains'
import { http } from 'wagmi'

export const config = getDefaultConfig({
    appName: 'Subscription DApp',

    // 🔴 MUST be a real WalletConnect project ID
    projectId: '5488fb677ed87050e8f0c73835a34ad2',

    // ✅ Keep ONLY the chain you are actually using
    chains: [sepolia],

    // ✅ Transport matches the chain exactly
    transports: {
        [sepolia.id]: http(
            'https://eth-sepolia.g.alchemy.com/v2/05Jjvtzj4LeGjBCJr20kq'
        ),
    },
})
