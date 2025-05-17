# NFT Minting and Display System Integration Guide

## Overview
This document explains how the NFT minting and display system works, which can be integrated into your game. The system consists of two main components:
1. CandyMint - For minting new NFTs
2. OwnedNFTs - For displaying NFTs owned by the user

## Technical Stack
- Solana Blockchain
- Metaplex SDK
- Candy Machine v2
- React/Next.js

## Key Components

### 1. CandyMint Component
This component handles the minting of new NFTs from a Candy Machine.

#### Key Features:
- Shows remaining NFTs available to mint
- Handles wallet connection
- Manages minting transactions
- Updates remaining count after successful mint

#### Important Code Snippets:
```typescript
// Minting process
const onClick = useCallback(async () => {
    // 1. Check wallet connection
    if (!wallet.publicKey) {
        notify({ type: 'error', message: 'Wallet not connected!' });
        return;
    }

    // 2. Fetch Candy Machine and Guard
    const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);
    const candyGuard = await safeFetchCandyGuard(umi, candyMachine.mintAuthority);

    // 3. Mint NFT
    const nftMint = generateSigner(umi);
    const transaction = await transactionBuilder()
        .add(setComputeUnitLimit(umi, { units: 800_000 }))
        .add(
            mintV2(umi, {
                candyMachine: candyMachine.publicKey,
                candyGuard: candyGuard?.publicKey,
                nftMint,
                collectionMint: candyMachine.collectionMint,
                collectionUpdateAuthority: candyMachine.authority,
                mintArgs: {
                    solPayment: some({ destination: treasury }),
                },
            })
        );

    // 4. Send and confirm transaction
    const { signature } = await transaction.sendAndConfirm(umi, {
        confirm: { commitment: "confirmed" },
    });
});

// Tracking remaining NFTs
const fetchRemaining = useCallback(async () => {
    const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);
    const itemsRemaining = Number(candyMachine.itemsLoaded) - Number(candyMachine.itemsRedeemed);
    setRemaining(itemsRemaining);
}, [umi, candyMachineAddress]);
```

### 2. OwnedNFTs Component
This component displays NFTs owned by the connected wallet.

#### Key Features:
- Fetches all NFTs owned by the wallet
- Filters NFTs by collection
- Displays NFT images and names
- Handles loading and error states

#### Important Code Snippets:
```typescript
// Fetching owned NFTs
const fetchNFTs = async () => {
    const metaplex = new Metaplex(connection);
    
    // 1. Fetch all NFTs owned by the wallet
    const ownedNFTs = await metaplex
        .nfts()
        .findAllByOwner({ owner: wallet.publicKey });

    // 2. Filter NFTs from our collection
    const collectionNFTs = ownedNFTs.filter(nft => 
        nft.collection?.address.toBase58() === process.env.NEXT_PUBLIC_COLLECTION_ID
    );

    // 3. Fetch metadata for each NFT
    const nftData = await Promise.all(collectionNFTs.map(async (nft) => {
        const response = await fetch(nft.uri);
        const metadata = await response.json();
        return {
            name: nft.name,
            image: metadata.image || '',
            mint: nft.address.toBase58()
        };
    }));
};
```

## Environment Variables Required
```env
NEXT_PUBLIC_RPC=<your-rpc-endpoint>
NEXT_PUBLIC_CANDY_MACHINE_ID=<your-candy-machine-id>
NEXT_PUBLIC_COLLECTION_ID=<your-collection-id>
NEXT_PUBLIC_TREASURY=<your-treasury-wallet>
```

## Integration Steps for Your Game

1. **Setup Environment**
   - Add required environment variables
   - Configure RPC endpoint
   - Set up Candy Machine and Collection IDs

2. **Wallet Integration**
   - Implement wallet connection in your game
   - Use the same wallet adapter for consistency

3. **Minting Integration**
   - Add minting functionality using CandyMint component
   - Handle minting success/failure in your game logic

4. **NFT Display Integration**
   - Use OwnedNFTs component to show user's NFTs
   - Customize the display to match your game's UI

5. **Error Handling**
   - Implement proper error handling for:
     - Wallet connection issues
     - Minting failures
     - NFT loading errors

## Important Considerations

1. **Performance**
   - NFT metadata fetching can be slow
   - Consider caching metadata
   - Implement loading states

2. **Error States**
   - Handle wallet disconnection
   - Handle RPC failures
   - Handle minting failures

3. **User Experience**
   - Show clear loading states
   - Provide feedback for actions
   - Handle edge cases gracefully

4. **Security**
   - Validate wallet connections
   - Verify transaction signatures
   - Handle failed transactions

## Example Usage in Game

```typescript
// 1. Check if user owns specific NFT
const hasNFT = ownedNFTs.some(nft => nft.mint === specificNFTMint);

// 2. Get NFT metadata for game use
const nftMetadata = ownedNFTs.find(nft => nft.mint === specificNFTMint);

// 3. Track minting status
const isMinting = false; // Set to true during mint process
const mintingError = null; // Store any minting errors

// 4. Update game state based on NFT ownership
if (hasNFT) {
    // Enable game features
    enableSpecialFeatures();
} else {
    // Show minting option
    showMintingOption();
}
```

## Troubleshooting

1. **NFTs Not Showing**
   - Check wallet connection
   - Verify collection ID
   - Check RPC endpoint

2. **Minting Fails**
   - Check wallet balance
   - Verify Candy Machine configuration
   - Check transaction logs

3. **Images Not Loading**
   - Verify metadata URI
   - Check image URL accessibility
   - Handle CORS issues

## Additional Resources
- [Metaplex Documentation](https://docs.metaplex.com/)
- [Solana Documentation](https://docs.solana.com/)
- [Candy Machine v2 Guide](https://docs.metaplex.com/programs/candy-machine/) 