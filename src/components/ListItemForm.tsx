import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import BitcoinIcon from './BitcoinIcon';

interface ListItemFormProps {
  onList: (name: string, description: string, priceStx: number, quantity: number) => Promise<void>;
  isConnected: boolean;
}

const ListItemForm = ({ onList, isConnected }: ListItemFormProps) => {
  const [isListing, setIsListing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.price || !formData.quantity) return;

    setIsListing(true);
    try {
      await onList(
        formData.name,
        formData.description,
        parseFloat(formData.price),
        parseInt(formData.quantity)
      );
      setFormData({ name: '', description: '', price: '', quantity: '' });
    } finally {
      setIsListing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="card-farm text-center py-8">
        <BitcoinIcon size={48} className="text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Connect to List Items</h3>
        <p className="text-muted-foreground text-sm">
          Connect your wallet to start selling on SatoshiFarm
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-farm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Plus className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold">List New Item</h3>
          <p className="text-sm text-muted-foreground">Sell your farm products for Sats</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Product Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value.slice(0, 100) }))}
            className="input-farm"
            placeholder="e.g., Fresh Organic Tomatoes"
            maxLength={100}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value.slice(0, 200) }))}
            className="input-farm resize-none h-20"
            placeholder="Describe your product..."
            maxLength={200}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Price (STX)</label>
            <div className="relative">
              <input
                type="number"
                step="0.000001"
                min="0.000001"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="input-farm pl-10"
                placeholder="0.00"
                required
              />
              <BitcoinIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              className="input-farm"
              placeholder="10"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isListing}
          className="btn-bitcoin w-full flex items-center justify-center gap-2 mt-2"
        >
          {isListing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Listing...
            </>
          ) : (
            <>
              <BitcoinIcon size={20} className="text-current" />
              List on SatoshiFarm
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ListItemForm;
