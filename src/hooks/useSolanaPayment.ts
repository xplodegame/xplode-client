import { useState } from "react";
import { useSolanaWallets } from "@privy-io/react-auth";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from "@solana/web3.js";

interface UseSolanaPaymentProps {
  userId?: number;
  onPaymentComplete: (balance: number) => void;
  onPaymentFailed: (error: string) => void;
}

export const useSolanaPayment = ({
  userId,
  onPaymentComplete,
  onPaymentFailed,
}: UseSolanaPaymentProps) => {
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [processingPayment, setProcessingPayment] = useState(false);

  // Use Privy's wallet hook to get the connected wallet
  const { wallets } = useSolanaWallets();
  const wallet = wallets[0]; // Assuming the first wallet is the one connected via Privy
  const walletAddress = wallet?.address;

  // This is the game's merchant wallet address where funds will be sent
  const MERCHANT_WALLET_ADDRESS =
    "8KzFk7cCzNXEdZHQcq9rvHdnMcqx6BPR1dG3xYUNdeaG"; // Replace with your Solana address

  // Solana connection - use a fallback to a default network if custom RPC is not available
  const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl("devnet");
  const connection = new Connection(rpcUrl, "confirmed");

  const initiatePayment = async (amount: string) => {
    if (!amount || Number(amount) <= 0) {
      throw new Error("Please enter a valid amount");
    }

    if (!walletAddress || !wallet) {
      throw new Error("Wallet not connected");
    }

    if (!userId) {
      throw new Error("No user ID available");
    }

    try {
      setProcessingPayment(true);
      setPaymentStatus("processing");

      console.log(
        "Using wallet:",
        wallet.walletClientType,
        "Address:",
        walletAddress
      );

      // Convert SOL amount to lamports (1 SOL = 1 billion lamports)
      const lamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL);

      // Create a Solana transaction
      const merchantPublicKey = new PublicKey(MERCHANT_WALLET_ADDRESS);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(walletAddress),
          toPubkey: merchantPublicKey,
          lamports: lamports,
        })
      );

      // Get the recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(walletAddress);

      // Universal approach that works with most wallets
      let txSignature;

      // Approach 1: Try sign and send separately (most reliable across wallets)
      if (wallet.signTransaction) {
        console.log("Using sign-then-send approach");
        try {
          // Sign the transaction
          const signedTx = await wallet.signTransaction(transaction);
          // Send the signed transaction
          txSignature = await connection.sendRawTransaction(
            signedTx.serialize()
          );
        } catch (err) {
          console.error("Error with sign-then-send approach:", err);
          // Continue to next approach if this fails
        }
      }

      // Approach 2: Try wallet-specific methods if sign-then-send failed
      if (!txSignature) {
        // Phantom-specific approach
        if (wallet.walletClientType === "phantom") {
          if (window.solana) {
            console.log("Using Phantom-specific method with window.solana");
            try {
              await window.solana.connect();
              txSignature = await window.solana.signAndSendTransaction(
                transaction
              );
            } catch (err) {
              console.error("Error with Phantom window.solana:", err);
            }
          } else if (window.phantom?.solana) {
            console.log(
              "Using Phantom-specific method with window.phantom.solana"
            );
            try {
              const provider = window.phantom.solana;
              await provider.connect();
              txSignature = await provider.signAndSendTransaction(transaction);
            } catch (err) {
              console.error("Error with window.phantom.solana:", err);
            }
          }
        }

        // Other wallet-specific approaches could be added here
        // ...
      }

      // // Approach 3: Try standard adapter methods as last resort
      // if (!txSignature) {
      //   if (wallet.sendTransaction) {
      //     console.log("Trying wallet.sendTransaction as fallback");
      //     try {
      //       txSignature = await wallet.sendTransaction(transaction);
      //     } catch (err) {
      //       console.error("Error with wallet.sendTransaction:", err);
      //     }
      //   } else if (wallet.solana?.sendTransaction) {
      //     console.log("Trying wallet.solana.sendTransaction as fallback");
      //     try {
      //       txSignature = await wallet.solana.sendTransaction(transaction);
      //     } catch (err) {
      //       console.error("Error with wallet.solana.sendTransaction:", err);
      //     }
      //   }
      // }

      // Final check if we got a signature
      if (!txSignature) {
        throw new Error("Failed to send transaction with any available method");
      }

      console.log("Transaction sent with signature:", txSignature);
      setPaymentStatus("confirming");

      // Wait for confirmation
      try {
        const confirmation = await connection.confirmTransaction(
          txSignature,
          "confirmed"
        );
        console.log("Transaction confirmed:", confirmation);
      } catch (confErr) {
        console.warn(
          "Confirmation error (but transaction may still succeed):",
          confErr
        );
      }

      // Notify the backend about the deposit
      await verifyTransaction(txSignature, amount);

      return txSignature;
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus("failed");
      onPaymentFailed(
        error instanceof Error ? error.message : "Failed to process payment"
      );
      throw error;
    } finally {
      setProcessingPayment(false);
    }
  };

  const verifyTransaction = async (txHash: string, amount: string) => {
    try {
      if (!userId) {
        throw new Error("No user ID available");
      }

      const depositData = {
        user_id: userId,
        amount: Number(amount),
        currency: "SOL",
        tx_hash: txHash,
      };

      console.log("Sending deposit data:", depositData);

      const response = await fetch(
        import.meta.env.VITE_PAYMENT_DEPOSIT_ENDPOINT_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(depositData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Deposit failed: ${errorText}`);
      }

      const result = await response.json();

      if (typeof result.balance === "number") {
        onPaymentComplete(result.balance);
        setPaymentStatus("completed");
      } else {
        throw new Error("Invalid balance received from server");
      }
    } catch (err) {
      setPaymentStatus("failed");
      onPaymentFailed(
        err instanceof Error ? err.message : "Failed to process deposit"
      );
    }
  };

  const cancelPayment = () => {
    setPaymentStatus("cancelled");
    setProcessingPayment(false);
    onPaymentFailed("Payment cancelled by user");
  };

  return {
    paymentStatus,
    processingPayment,
    initiatePayment,
    cancelPayment,
    isWalletConnected: !!walletAddress,
  };
};

// Add wallet type definitions
declare global {
  interface Window {
    phantom?: {
      solana?: {
        connect: () => Promise<{ publicKey: PublicKey }>;
        signAndSendTransaction: (transaction: Transaction) => Promise<string>;
      };
    };
    solana?: {
      connect: () => Promise<{ publicKey: PublicKey }>;
      signAndSendTransaction: (transaction: Transaction) => Promise<string>;
      signTransaction: (transaction: Transaction) => Promise<Transaction>;
    };
  }
}
