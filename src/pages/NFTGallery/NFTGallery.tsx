import React, { useEffect, useState } from 'react';
import { useSolanaWallets } from '@privy-io/react-auth';
import { fetchNFTs } from '../../hooks/useNftMint';

interface NFT {
  name: string;
  image: string;
  mint: string;
}

const NFTGallery: React.FC = () => {
  const { wallets } = useSolanaWallets();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNFTs = async () => {
      if (!wallets[0]?.address) {
        setError('No wallet connected');
        setLoading(false);
        return;
      }

      try {
        const nftData = await fetchNFTs(wallets[0].address);
        setNfts(nftData);
      } catch (err) {
        setError('Failed to load NFTs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadNFTs();
  }, [wallets[0]?.address]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">My NFTs</h1>
        {nfts.length === 0 ? (
          <div className="text-gray-400 text-center py-12">
            No NFTs found in your wallet
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nfts.map((nft) => (
              <div
                key={nft.mint}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                {nft.image && (
                  <div className="aspect-w-1 aspect-h-1 w-full">
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {nft.name}
                  </h3>
                  <p className="text-sm text-gray-400 truncate">
                    {nft.mint}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTGallery; 