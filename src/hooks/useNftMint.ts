import { useCallback, useMemo } from "react";
import { Metaplex } from "@metaplex-foundation/js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  generateSigner,
  transactionBuilder,
  publicKey,
  some,
} from "@metaplex-foundation/umi";
import {
  fetchCandyMachine,
  mintV2,
  mplCandyMachine,
  safeFetchCandyGuard,
} from "@metaplex-foundation/mpl-candy-machine";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import * as bs58 from "bs58";
import { useSolanaWallets } from "@privy-io/react-auth";
import { Connection, PublicKey } from "@solana/web3.js";
import { gifNfts } from "../data/gifData"; // Import the gifNfts array

// Constants
const quicknodeEndpoint = import.meta.env.VITE_SOLANA_RPC_URL;
const treasury = publicKey(import.meta.env.VITE_TREASURY);

// Get all collection IDs from env variables
const getAllCollectionIds = () => {
  const collectionIds = [];

  // Add the default collection ID if it exists
  if (import.meta.env.VITE_COLLECTION_ID) {
    collectionIds.push(import.meta.env.VITE_COLLECTION_ID);
  }

  // Add all numbered collection IDs from gifNfts
  for (const gif of gifNfts) {
    if (gif.collectionMintId && !collectionIds.includes(gif.collectionMintId)) {
      collectionIds.push(gif.collectionMintId);
    }
  }

  return collectionIds;
};

export const useNftMint = () => {
  const { wallets } = useSolanaWallets();
  const wallet = wallets[0];
  const wallet_pubkey = wallet ? new PublicKey(wallet.address) : null;

  // Create an Umi instance
  const umi = useMemo(() => {
    if (!wallet_pubkey) return null;

    return createUmi(quicknodeEndpoint)
      .use(
        walletAdapterIdentity({
          publicKey: wallet_pubkey,
          signTransaction: wallet.signTransaction,
          signMessage: wallet.signMessage,
        })
      )
      .use(mplCandyMachine())
      .use(mplTokenMetadata());
  }, [wallet, wallet_pubkey]);

  const mintNft = useCallback(
    async (candyMachineIdToUse: string) => {
      if (!wallet_pubkey) {
        throw new Error("Wallet not connected!");
      }

      if (!umi) {
        throw new Error("Umi instance not initialized!");
      }

      try {
        // Use the provided candy machine ID, or fall back to default
        const candyMachineIdStr = candyMachineIdToUse;
        console.log("Using candy machine ID:", candyMachineIdStr);

        // Convert to UMI publicKey
        const candyMachineAddress = publicKey(candyMachineIdStr);

        // Fetch the Candy Machine
        const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);

        // Fetch the Candy Guard
        const candyGuard = await safeFetchCandyGuard(
          umi,
          candyMachine.mintAuthority
        );

        // Generate a new NFT mint
        const nftMint = generateSigner(umi);
        console.log("NFT Mint Address:", nftMint.publicKey);

        // Create and send the mint transaction
        const transaction = transactionBuilder()
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

        // Send and confirm the transaction
        const { signature } = await transaction.sendAndConfirm(umi, {
          confirm: { commitment: "confirmed" },
        });

        const txid = bs58.default.encode(signature);
        console.log("Mint successful! Transaction ID:", txid);

        return { success: true, txid };
      } catch (error) {
        console.error("Failed to mint NFT:", error);
        throw error;
      }
    },
    [umi, wallet_pubkey]
  );

  return {
    mintNft,
    isWalletConnected: !!wallet_pubkey,
  };
};

export const fetchNFTs = async (address: string) => {
  console.log("for wallet: ", address);
  try {
    const wallet_pubkey = new PublicKey(address);
    const connection = new Connection(quicknodeEndpoint);
    const metaplex = new Metaplex(connection);

    // console.log("Wallet public key:", wallet_pubkey.toBase58());

    // Fetch all NFTs owned by the wallet
    const ownedNFTs = await metaplex
      .nfts()
      .findAllByOwner({ owner: wallet_pubkey });

    console.log("Owned NFTs:", ownedNFTs);

    // Get all collection IDs to check against
    const allCollectionIds = getAllCollectionIds();
    // console.log("All collection IDs to check:", allCollectionIds);

    // Filter NFTs from our collections (any of our collection IDs)
    const collectionNFTs = ownedNFTs.filter((nft) => {
      if (!nft.collection?.address) return false;

      const nftCollectionId = nft.collection.address.toBase58();
      // console.log(`NFT ${nft.address.toBase58()} has collection: ${nftCollectionId}`);

      return allCollectionIds.includes(nftCollectionId);
    });

    console.log("Collection NFTs:", collectionNFTs);

    // If no collection NFTs found, try to match by the NFT addresses directly
    if (collectionNFTs.length === 0) {
      console.log(
        "No NFTs found by collection ID. Attempting to identify NFTs by metadata..."
      );
    }

    // Fetch metadata for each NFT
    const nftData = await Promise.all(
      collectionNFTs.map(async (nft) => {
        try {
          // Handle case where URI might be missing
          if (!nft.uri) {
            console.log(`No URI for NFT ${nft.address.toBase58()}`);

            // Try to find a matching GIF from our data by matching collection ID
            if (nft.collection?.address) {
              const collectionId = nft.collection.address.toBase58();
              const matchingGif = gifNfts.find(
                (gif) => gif.collectionMintId === collectionId
              );

              if (matchingGif) {
                return {
                  name: matchingGif.name,
                  image: matchingGif.url,
                  mint: nft.address.toBase58(),
                };
              }
            }

            return {
              name: nft.name || "Unknown NFT",
              image: "",
              mint: nft.address.toBase58(),
            };
          }

          const response = await fetch(nft.uri);
          const metadata = await response.json();
          return {
            name: nft.name || metadata.name || "Unknown NFT",
            image: metadata.image || "",
            mint: nft.address.toBase58(),
          };
        } catch (error) {
          console.error(
            `Error fetching metadata for NFT ${nft.address.toBase58()}:`,
            error
          );
          return {
            name: nft.name || "Unknown NFT",
            image: "",
            mint: nft.address.toBase58(),
          };
        }
      })
    );

    console.log("NFTs:", nftData);
    return nftData;
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    throw error;
  }
};
