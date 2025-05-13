import { useCallback, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
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
import { PublicKey } from "@solana/web3.js";

// Constants
const quicknodeEndpoint = import.meta.env.VITE_SOLANA_RPC_URL;
const candyMachineAddress = publicKey(import.meta.env.VITE_CANDY_MACHINE_ID);
const treasury = publicKey(import.meta.env.VITE_TREASURY);

export const useNftMint = () => {
  const { wallets } = useSolanaWallets();
  const wallet = wallets[0];
  console.log("use wallet ", wallet);
  console.log("wallet", wallet.address);
  const wallet_pubkey = new PublicKey(wallet.address);
  // Create an Umi instance
  const umi = useMemo(
    () =>
      createUmi(quicknodeEndpoint)
        .use(
          walletAdapterIdentity({
            publicKey: wallet_pubkey,
            signTransaction: wallet.signTransaction,
            signMessage: wallet.signMessage,
          })
        )
        .use(mplCandyMachine())
        .use(mplTokenMetadata()),
    [wallet, wallet_pubkey]
  );

  const mintNft = useCallback(async () => {
    if (!wallet_pubkey) {
      throw new Error("Wallet not connected!");
    }

    try {
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
  }, [umi, wallet_pubkey]);

  return {
    mintNft,
    isWalletConnected: !!wallet_pubkey,
  };
};
