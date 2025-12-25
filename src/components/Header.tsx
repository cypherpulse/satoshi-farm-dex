import BitcoinIcon from './BitcoinIcon';
import { Sprout, Wallet } from 'lucide-react';
import { shortenAddress } from '@/lib/stacks';

interface HeaderProps {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

const Header = ({ isConnected, address, isConnecting, onConnect, onDisconnect }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <BitcoinIcon size={40} className="text-primary" />
            <Sprout className="absolute -bottom-1 -right-1 w-4 h-4 text-farm-green" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gradient-bitcoin">
              SatoshiFarm
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Harvest Sats on Bitcoin L2
            </p>
          </div>
        </div>

        {/* Network Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-stx-purple/20 border border-stx-purple/30 rounded-full">
          <div className="w-2 h-2 bg-stx-purple rounded-full animate-pulse" />
          <span className="text-sm text-stx-purple font-medium">Stacks Testnet</span>
        </div>

        {/* Wallet Button */}
        {isConnected && address ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg border border-border">
              <div className="w-2 h-2 bg-farm-green rounded-full" />
              <span className="text-sm font-mono text-foreground">
                {shortenAddress(address)}
              </span>
            </div>
            <button
              onClick={onDisconnect}
              className="btn-bitcoin-outline text-sm px-4 py-2"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="btn-bitcoin flex items-center gap-2"
          >
            <Wallet className="w-5 h-5" />
            <span className="hidden sm:inline">
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </span>
            <span className="sm:hidden">Connect</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
