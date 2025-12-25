import { useState, useEffect, useCallback } from 'react';
import { request } from '@stacks/connect';
import { Cl, cvToValue, fetchCallReadOnlyFunction } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { toast } from 'sonner';
import { RefreshCw, Store, Sprout } from 'lucide-react';

import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import MarketplaceGrid from '@/components/MarketplaceGrid';
import ListItemForm from '@/components/ListItemForm';
import SellerDashboard from '@/components/SellerDashboard';
import { useStacksWallet } from '@/hooks/useStacksWallet';
import {
  CONTRACT_ADDRESS,
  CONTRACT_NAME,
  FULL_CONTRACT,
  WALLETCONNECT_PROJECT_ID,
  MarketItem,
  stxToMicroStx,
} from '@/lib/stacks';

const Index = () => {
  const { isConnected, address, isConnecting, connectWallet, disconnectWallet } = useStacksWallet();
  
  const [items, setItems] = useState<MarketItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [earnedSats, setEarnedSats] = useState<bigint>(0n);
  const [isLoadingSats, setIsLoadingSats] = useState(false);
  const [isHarvesting, setIsHarvesting] = useState(false);

  // Fetch all marketplace items
  const fetchItems = useCallback(async () => {
    setIsLoadingItems(true);
    try {
      // First get the next item ID to know how many items exist
      const nextIdResponse = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-next-item-id',
        functionArgs: [],
        network: STACKS_TESTNET,
        senderAddress: CONTRACT_ADDRESS,
      });

      const nextIdValue = cvToValue(nextIdResponse);
      const nextId = Number(nextIdValue);
      console.log('Next item ID:', nextId);
      
      const fetchedItems: MarketItem[] = [];

      // Fetch all items from 1 to nextId - 1
      // If nextId is 1, no items exist. If nextId is 2, item 1 exists, etc.
      for (let id = 1; id < nextId; id++) {
        try {
          console.log(`Fetching item ${id}...`);
          const itemResponse = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-item',
            functionArgs: [Cl.uint(id)],
            network: STACKS_TESTNET,
            senderAddress: CONTRACT_ADDRESS,
          });

          console.log(`Raw item ${id} response:`, itemResponse);
          
          // Handle optional response - get-item returns (optional {...})
          const itemValue = cvToValue(itemResponse);
          console.log(`Converted item ${id} value:`, itemValue);
          
          // Check if the optional has a value (not none)
          if (itemValue && itemValue.value) {
            const item = itemValue.value;
            console.log(`Item ${id} data:`, item);
            fetchedItems.push({
              id,
              name: item.name?.value || item.name || '',
              description: item.description?.value || item.description || '',
              price: BigInt(item.price?.value ?? item.price ?? 0),
              quantity: BigInt(item.quantity?.value ?? item.quantity ?? 0),
              seller: item.seller?.value || item.seller || '',
              active: item.active?.value ?? item.active ?? true,
            });
          } else if (itemValue && typeof itemValue === 'object' && 'name' in itemValue) {
            // Fallback for direct object structure
            console.log(`Item ${id} direct structure:`, itemValue);
            fetchedItems.push({
              id,
              name: itemValue.name?.value || itemValue.name || '',
              description: itemValue.description?.value || itemValue.description || '',
              price: BigInt(itemValue.price?.value ?? itemValue.price ?? 0),
              quantity: BigInt(itemValue.quantity?.value ?? itemValue.quantity ?? 0),
              seller: itemValue.seller?.value || itemValue.seller || '',
              active: itemValue.active?.value ?? itemValue.active ?? true,
            });
          } else {
            console.log(`Item ${id} not found or invalid structure`);
          }
        } catch (err) {
          console.error(`Error fetching item ${id}:`, err);
        }
      }

      console.log('Total fetched items:', fetchedItems);
      setItems(fetchedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load marketplace items');
    } finally {
      setIsLoadingItems(false);
    }
  }, []);

  // Fetch seller's earned sats
  const fetchEarnedSats = useCallback(async () => {
    if (!address) return;
    
    setIsLoadingSats(true);
    try {
      const response = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-seller-sats',
        functionArgs: [Cl.principal(address)],
        network: STACKS_TESTNET,
        senderAddress: address,
      });

      const satsValue = cvToValue(response);
      setEarnedSats(BigInt(satsValue || 0));
    } catch (error) {
      console.error('Error fetching earned sats:', error);
    } finally {
      setIsLoadingSats(false);
    }
  }, [address]);

  // Initial load
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Fetch sats when connected
  useEffect(() => {
    if (isConnected && address) {
      fetchEarnedSats();
    }
  }, [isConnected, address, fetchEarnedSats]);

  // Handle wallet connection
  const handleConnect = async () => {
    try {
      await connectWallet();
      toast.success('Wallet connected successfully!');
    } catch (error) {
      toast.error('Failed to connect wallet. Please try again.');
    }
  };

  // Handle disconnect
  const handleDisconnect = () => {
    disconnectWallet();
    setEarnedSats(0n);
    toast.info('Wallet disconnected');
  };

  // List a new item
  const handleListItem = async (name: string, description: string, priceStx: number, quantity: number) => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const result = await request(
        { walletConnectProjectId: WALLETCONNECT_PROJECT_ID },
        'stx_callContract',
        {
          contract: FULL_CONTRACT,
          functionName: 'list-item',
          functionArgs: [
            Cl.stringAscii(name),
            Cl.stringAscii(description),
            Cl.uint(stxToMicroStx(priceStx)),
            Cl.uint(quantity),
          ],
          network: 'testnet',
        }
      );

      if (result) {
        toast.success('Item listed successfully! Transaction submitted.');
        // Refresh items after a delay to allow transaction to process
        setTimeout(() => fetchItems(), 5000);
      }
    } catch (error: any) {
      console.error('Error listing item:', error);
      toast.error(error.message || 'Failed to list item');
    }
  };

  // Buy an item
  const handleBuyItem = async (itemId: number, quantity: bigint) => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const result = await request(
        { walletConnectProjectId: WALLETCONNECT_PROJECT_ID },
        'stx_callContract',
        {
          contract: FULL_CONTRACT,
          functionName: 'buy-item',
          functionArgs: [Cl.uint(itemId), Cl.uint(quantity)],
          network: 'testnet',
          postConditionMode: 'allow',
        }
      );

      if (result) {
        toast.success('Purchase initiated! Transaction submitted.');
        setTimeout(() => {
          fetchItems();
          fetchEarnedSats();
        }, 5000);
      }
    } catch (error: any) {
      console.error('Error buying item:', error);
      toast.error(error.message || 'Failed to buy item');
    }
  };

  // Harvest earned sats
  const handleHarvest = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (earnedSats === 0n) {
      toast.error('No sats to harvest');
      return;
    }

    setIsHarvesting(true);
    try {
      const result = await request(
        { walletConnectProjectId: WALLETCONNECT_PROJECT_ID },
        'stx_callContract',
        {
          contract: FULL_CONTRACT,
          functionName: 'harvest-sats',
          functionArgs: [],
          network: 'testnet',
        }
      );

      if (result) {
        toast.success('Harvest initiated! Your sats are on the way!');
        setTimeout(() => fetchEarnedSats(), 5000);
      }
    } catch (error: any) {
      console.error('Error harvesting:', error);
      toast.error(error.message || 'Failed to harvest sats');
    } finally {
      setIsHarvesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        isConnected={isConnected}
        address={address}
        isConnecting={isConnecting}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <main>
        <HeroSection isConnected={isConnected} onConnect={handleConnect} />

        <div className="container mx-auto px-4 py-12">
          {/* Dashboard Section */}
          {isConnected && (
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <SellerDashboard
                earnedSats={earnedSats}
                isLoading={isLoadingSats}
                onHarvest={handleHarvest}
                isHarvesting={isHarvesting}
                isConnected={isConnected}
              />
              <ListItemForm onList={handleListItem} isConnected={isConnected} />
            </div>
          )}

          {/* Marketplace Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Marketplace</h2>
                  <p className="text-sm text-muted-foreground">
                    Fresh farm products, secured by Bitcoin
                  </p>
                </div>
              </div>
              <button
                onClick={fetchItems}
                disabled={isLoadingItems}
                className="btn-bitcoin-outline flex items-center gap-2 px-4 py-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingItems ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            <MarketplaceGrid
              items={items}
              isLoading={isLoadingItems}
              onBuy={handleBuyItem}
              isConnected={isConnected}
            />
          </section>

          {/* Not Connected CTA */}
          {!isConnected && (
            <section className="mt-16 text-center">
              <div className="card-farm max-w-lg mx-auto py-12">
                <Sprout className="w-16 h-16 text-farm-green mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-3">Ready to Farm?</h3>
                <p className="text-muted-foreground mb-6">
                  Connect your wallet to start listing products and earning Sats
                </p>
                <button onClick={handleConnect} className="btn-bitcoin">
                  Connect Wallet
                </button>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>SatoshiFarm © 2024 — Built on Stacks, Secured by Bitcoin</p>
          <p className="mt-2 font-mono text-xs">Contract: {FULL_CONTRACT}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
