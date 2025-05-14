import { useState, useEffect, useCallback } from 'react';
import { Star, Sparkles, ChevronLeft, ChevronRight, Search, X, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { useParticles } from '../../components/LandingPage/Particles';
import { usePayment } from '../../hooks/usePayment';
import { useNftMint } from '../../hooks/useNftMint';
import { motion, AnimatePresence } from 'framer-motion';
import { gifNfts, GifNft } from '../../data/gifData'; // Import from our new file

export default function CosmicGifMarketplace() {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGif, setSelectedGif] = useState<GifNft | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [transactionResult, setTransactionResult] = useState<'none' | 'success' | 'failed'>('none');
  const Particles = useParticles();
  
  // Get userId as number from userData stored in localStorage
  const [userId, setUserId] = useState<number | undefined>(undefined);

  // Get user data from localStorage on component mount
  useEffect(() => {
    try {
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        // Ensure userId is a number
        if (userData?.id && typeof userData.id === 'number') {
          setUserId(userData.id);
          console.log('Retrieved userId from localStorage:', userData.id);
        } else {
          console.error('Invalid userId in localStorage userData:', userData?.id);
        }
      } else {
        console.warn('No userData found in localStorage');
      }
    } catch (error) {
      console.error('Error parsing userData from localStorage:', error);
    }
  }, []);

  const {
    solanaAmount,
    setSolanaAmount,
    paymentStatus,
    processingPayment,
    isWalletConnected,
    handleCancelPayment
  } = usePayment({ userId, tx_type: "MINT", gif_id: selectedGif?.id});

  // Initialize with no custom candy machine ID initially
  const { mintNft, isWalletConnected: isNftWalletConnected } = useNftMint();

  // Reset transaction result when modal is closed
  useEffect(() => {
    if (!isConfirmModalOpen) {
      // Give some time for animation to complete
      setTimeout(() => {
        setTransactionResult('none');
      }, 300);
    }
  }, [isConfirmModalOpen]);

  // Watch payment status changes
  useEffect(() => {
    if (paymentStatus === 'completed') {
      setTransactionResult('success');
      // Auto close after success with a delay
      setTimeout(() => {
        setIsConfirmModalOpen(false);
        setSelectedGif(null);
      }, 2000);
    } else if (paymentStatus === 'failed') {
      setTransactionResult('failed');
    }
  }, [paymentStatus]);
  
  // Initialize solanaAmount when selectedGif changes
  useEffect(() => {
    if (selectedGif) {
      setSolanaAmount(selectedGif.price.toString());
    }
  }, [selectedGif, setSolanaAmount]);

  const itemsPerPage = 6;
  const maxPage = Math.ceil(gifNfts.length / itemsPerPage);

  const rarityColors = {
    "Common": {
      bg: "bg-emerald-500/30",
      text: "text-emerald-400",
      border: "border-emerald-500/40",
      glow: "shadow-emerald-500/30"
    },
    "Rare": {
      bg: "bg-blue-500/30",
      text: "text-blue-400",
      border: "border-blue-500/40",
      glow: "shadow-blue-500/30"
    },
    "Epic": {
      bg: "bg-purple-500/30", 
      text: "text-purple-400",
      border: "border-purple-500/40",
      glow: "shadow-purple-500/30"
    },
    "Legendary": {
      bg: "bg-yellow-500/30",
      text: "text-yellow-400",
      border: "border-yellow-500/40",
      glow: "shadow-yellow-500/30"
    },
    "Mythic": {
      bg: "bg-red-500/30",
      text: "text-red-400",
      border: "border-red-500/40",
      glow: "shadow-red-500/30"
    }
  };

  const filteredNfts = gifNfts.filter(nft => 
    nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nft.rarity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedNfts = filteredNfts.slice(
    currentPage * itemsPerPage, 
    (currentPage + 1) * itemsPerPage
  );

  const openPurchaseModal = useCallback((nft: GifNft) => {
    if (!userId) {
      console.error("Cannot purchase: No user ID available");
      // Show error to user
      alert("Please ensure you're logged in before purchasing.");
      return;
    }
    
    if (!isWalletConnected) {
      alert("Please connect your wallet first");
      return;
    }
    
    // Reset the transaction result
    setTransactionResult('none');
    
    // Set the selected GIF
    setSelectedGif(nft);
    
    // Initialize the amount
    setSolanaAmount(nft.price.toString());
    
    // Open the confirmation modal
    setIsConfirmModalOpen(true);
  }, [userId, isWalletConnected, setSolanaAmount]);

  const handleInitiatePayment = useCallback(async () => {
    if (!selectedGif || !userId || !isNftWalletConnected) return;

    try {
      // Pass the specific candy machine ID for the selected GIF
      const result = await mintNft(selectedGif.candyMachineId);
      
      if (result.success) {
        // Update UI state
        setTransactionResult('success');
        
        // Auto close after success with a delay
        setTimeout(() => {
          setIsConfirmModalOpen(false);
          setSelectedGif(null);
        }, 2000);

        try {
          if (!userId) {
            throw new Error("No user ID available");
          }
    
          const mintData = {
            user_id: userId,
            mint_amount: Number(selectedGif.price),
            currency: "SOL",
            tx_type: "PURCHASE",
            gif_id: selectedGif.id,
            tx_hash: result.txid,
            candy_machine_id: selectedGif.candyMachineId // Include candy machine ID in the data
          };
    
          console.log("Sending mint deposit data:", mintData);
    
          const response = await fetch(
            import.meta.env.VITE_MINTING_ENDPOINT_URL,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(mintData),
            }
          );

          console.log("minting successfully updated in db", response)
    
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Deposit failed: ${errorText}`);
          }
        } catch (err) {
          console.log(err)
        }
      }

    } catch (error) {
      console.error("Failed to mint NFT:", error);
      setTransactionResult('failed');
    }
  }, [selectedGif, userId, isNftWalletConnected, mintNft]);

  const handleCancelTransaction = useCallback(() => {
    // Cancel any pending payment
    handleCancelPayment();
    
    // Close the modal
    setIsConfirmModalOpen(false);
    
    // Clear the selected GIF after a delay to allow animation
    setTimeout(() => setSelectedGif(null), 300);
  }, [handleCancelPayment]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-dark to-game-dark-light">
      <div className="min-h-screen bg-black/40 relative">
        {/* Particles Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0">
            {Particles}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-40" />
        </div>
        
        {/* Main Content */}
        <div className="relative z-10 pt-20 pb-16">
          <div className="container mx-auto px-4">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                  Cosmic Communication GIFs
                </span>
              </h1>
              <p className="text-zinc-300 max-w-2xl mx-auto">
                Express yourself across the interstellar grid with exclusive NFT GIFs
              </p>
            </motion.div>

            {/* Filter Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-black/60 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-4 mb-8 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-2">
                <div className="text-zinc-400 text-sm">Filter by rarity:</div>
                <div className="flex flex-wrap gap-2">
                  {["All", "Common", "Rare", "Epic", "Legendary", "Mythic"].map(rarity => (
                    <button
                      key={rarity}
                      onClick={() => {
                        setSearchTerm(rarity === "All" ? "" : rarity);
                        setCurrentPage(0);
                      }}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                        searchTerm === (rarity === "All" ? "" : rarity)
                          ? "bg-emerald-500 text-black"
                          : "bg-black/40 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40"
                      }`}
                    >
                      {rarity}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center bg-black/40 border border-emerald-500/20 rounded-lg px-3 py-2">
                  <Search className="w-4 h-4 text-emerald-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search GIFs..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(0);
                    }}
                    className="bg-transparent border-none focus:outline-none text-white placeholder-zinc-500 w-40"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-zinc-400 text-sm mb-6"
            >
              Showing {filteredNfts.length} cosmic GIF NFTs
            </motion.div>

            {/* NFT Grid */}
            {filteredNfts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center py-16"
              >
                <Sparkles className="w-12 h-12 text-emerald-500/50 mb-4" />
                <p className="text-zinc-400 text-lg">No GIFs found matching your search</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedNfts.map((nft, index) => (
                  <motion.div 
                    key={nft.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * (index % itemsPerPage) }}
                    className={`relative overflow-hidden rounded-2xl border ${rarityColors[nft.rarity].border} bg-black/60 backdrop-blur-sm transition-all 
                      hover:shadow-lg ${rarityColors[nft.rarity].glow} transform hover:scale-[1.02]`}
                  >
                    {/* Animated Border Glow */}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent animate-gradient-x rounded-2xl"></div>
                    
                    {/* Rarity Badge */}
                    <div className={`absolute top-3 left-3 z-20 px-2 py-1 rounded-full text-xs font-medium ${rarityColors[nft.rarity].bg} ${rarityColors[nft.rarity].text}`}>
                      {nft.rarity === "Legendary" || nft.rarity === "Mythic" ? (
                        <div className="flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          {nft.rarity}
                        </div>
                      ) : (
                        nft.rarity
                      )}
                    </div>

                    {/* GIF Image */}
                    <div className="aspect-square overflow-hidden relative">
                      <img
                        src={nft.url}
                        alt={nft.name}
                        className="w-full h-full object-cover transition-all duration-700 hover:scale-110"
                        onError={(e) => {
                          // Fallback if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'https://placehold.co/400x400/1a2e35/10b981?text=GIF+Not+Found';
                        }}
                      />
                    </div>

                    {/* NFT Info */}
                    <div className="p-4 bg-black/70 backdrop-blur-sm border-t border-emerald-500/10">
                      <h3 className="text-white font-semibold text-lg mb-2 truncate">{nft.name}</h3>

                      <div className="flex items-center justify-between">
                        <div className="text-emerald-400 font-mono">
                          {nft.price.toFixed(2)} SOL
                        </div>
                        
                        <div className={`text-xs ${rarityColors[nft.rarity].text} border ${rarityColors[nft.rarity].border} rounded-full px-2 py-1 ${rarityColors[nft.rarity].bg}`}>
                          NFT GIF
                        </div>
                      </div>
                      
                      {/* Purchase Button */}
                      <button
                        onClick={() => openPurchaseModal(nft)}
                        disabled={processingPayment || !isWalletConnected}
                        className={`w-full mt-3 py-2 rounded-lg font-medium flex items-center justify-center transition-all ${
                          processingPayment
                            ? "bg-emerald-500/10 text-emerald-400/50 cursor-not-allowed"
                            : isWalletConnected
                              ? "bg-emerald-500 text-black hover:bg-emerald-400"
                              : "bg-red-500/20 border border-red-500/40 text-red-400 cursor-not-allowed"
                        }`}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        {processingPayment ? "Processing..." : "Purchase GIF"}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {filteredNfts.length > itemsPerPage && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex items-center justify-center mt-10"
              >
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="p-2 rounded-lg bg-black/60 border border-emerald-500/20 text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-emerald-500/40 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="px-4 py-2 bg-black/40 border border-emerald-500/20 rounded-lg text-emerald-400">
                    {currentPage + 1} / {maxPage}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(maxPage - 1, currentPage + 1))}
                    disabled={currentPage >= maxPage - 1}
                    className="p-2 rounded-lg bg-black/60 border border-emerald-500/20 text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-emerald-500/40 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Modal */}
      <AnimatePresence>
        {isConfirmModalOpen && selectedGif && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl
                ${transactionResult === 'success' 
                  ? 'border-2 border-emerald-500 shadow-emerald-500/30' 
                  : transactionResult === 'failed'
                    ? 'border-2 border-red-500 shadow-red-500/30'
                    : 'border border-emerald-500/30 shadow-emerald-500/20'
                }`}
            >
              {/* Close button */}
              <button 
                onClick={handleCancelTransaction}
                className="absolute top-3 right-3 z-50 p-1 rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/70 transition-all"
                disabled={processingPayment}
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Background with tint based on transaction result */}
              <div 
                className={`absolute inset-0 
                  ${transactionResult === 'success' 
                    ? 'bg-emerald-900/20' 
                    : transactionResult === 'failed'
                      ? 'bg-red-900/20'
                      : 'bg-black/90'
                  }`}
              />
              
              {/* Transaction Result Overlay */}
              <AnimatePresence>
                {transactionResult !== 'none' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-30 flex flex-col items-center justify-center backdrop-blur-sm"
                  >
                    {transactionResult === 'success' ? (
                      <div className="text-center">
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 15 }}
                          className="mb-4 bg-emerald-500 rounded-full p-4 inline-block"
                        >
                          <CheckCircle2 className="w-10 h-10 text-black" />
                        </motion.div>
                        <h2 className="text-xl font-bold text-emerald-400 mb-1">Mint Successful!</h2>
                        <p className="text-emerald-300/80">Your NFT has been minted to your wallet</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 15 }}
                          className="mb-4 bg-red-500 rounded-full p-4 inline-block"
                        >
                          <AlertTriangle className="w-10 h-10 text-black" />
                        </motion.div>
                        <h2 className="text-xl font-bold text-red-400 mb-1">Mint Failed</h2>
                        <p className="text-red-300/80">Please try again later</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="relative z-10 p-6">
                <div className="flex mb-6">
                  {/* GIF Preview */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-black/50 mr-4 flex-shrink-0">
                    <img 
                      src={selectedGif.url} 
                      alt={selectedGif.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'https://placehold.co/400x400/1a2e35/10b981?text=GIF+Not+Found';
                      }}
                    />
                  </div>
                  
                  {/* GIF Details */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{selectedGif.name}</h3>
                    <div className={`inline-block px-2 py-0.5 rounded-full text-xs ${rarityColors[selectedGif.rarity].bg} ${rarityColors[selectedGif.rarity].text} mb-2`}>
                      {selectedGif.rarity}
                    </div>
                    <div className="text-emerald-400 font-mono font-medium text-xl">
                      {selectedGif.price.toFixed(2)} SOL
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <h4 className="text-white font-medium">Confirm Mint</h4>
                  <p className="text-zinc-400 text-sm">
                    This GIF will be minted as an NFT to your wallet address from Candy Machine: {selectedGif.candyMachineId.substring(0, 8)}...
                  </p>
                  
                  {/* Processing Indicator */}
                  {processingPayment && (
                    <div className="bg-black/40 rounded-lg p-3 flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-emerald-500 mr-3"></div>
                      <span className="text-emerald-400 text-sm">Processing mint...</span>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  {transactionResult === 'none' && (
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancelTransaction}
                        disabled={processingPayment}
                        className="flex-1 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      
                      <button
                        onClick={handleInitiatePayment}
                        disabled={processingPayment || !isWalletConnected}
                        className="flex-1 py-2 rounded-lg bg-emerald-500 text-black font-medium hover:bg-emerald-400 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {processingPayment ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Mint NFT
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  
                  {/* Result Action Button */}
                  {transactionResult !== 'none' && (
                    <button
                      onClick={handleCancelTransaction}
                      className={`w-full py-2 rounded-lg font-medium
                        ${transactionResult === 'success' 
                          ? 'bg-emerald-500 text-black hover:bg-emerald-400' 
                          : 'bg-zinc-700 text-white hover:bg-zinc-600'
                        } transition-all`}
                    >
                      {transactionResult === 'success' ? 'Awesome!' : 'Close'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet connection notice */}
      {!isWalletConnected && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 border border-emerald-500/30 rounded-lg px-4 py-2 text-white z-50 shadow-lg shadow-emerald-500/20">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></div>
            <span>Connect your wallet to mint GIF NFTs</span>
          </div>
        </div>
      )}
    </div>
  );
}