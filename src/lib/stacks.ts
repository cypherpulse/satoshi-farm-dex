import { Cl, ClarityValue } from '@stacks/transactions';

export const CONTRACT_ADDRESS = 'STGDS0Y17973EN5TCHNHGJJ9B31XWQ5YXBQ0KQ2Y';
export const CONTRACT_NAME = 'satoshi-farm';
export const FULL_CONTRACT = `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;

// WalletConnect Project ID - Get yours at https://cloud.reown.com
export const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

export interface MarketItem {
  id: number;
  name: string;
  description: string;
  price: bigint;
  quantity: bigint;
  seller: string;
  active: boolean;
}

export function microStxToStx(microStx: bigint): string {
  return (Number(microStx) / 1_000_000).toFixed(6);
}

export function stxToMicroStx(stx: number): bigint {
  return BigInt(Math.floor(stx * 1_000_000));
}

export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function createListItemArgs(
  name: string,
  description: string,
  price: bigint,
  quantity: bigint
): ClarityValue[] {
  return [
    Cl.stringAscii(name),
    Cl.stringAscii(description),
    Cl.uint(price),
    Cl.uint(quantity),
  ];
}

export function createBuyItemArgs(itemId: number, quantity: bigint): ClarityValue[] {
  return [Cl.uint(itemId), Cl.uint(quantity)];
}

export function createGetItemArgs(itemId: number): ClarityValue[] {
  return [Cl.uint(itemId)];
}

export function createGetSellerSatsArgs(seller: string): ClarityValue[] {
  return [Cl.principal(seller)];
}

// Parse response from get-item read-only call
export function parseItemResponse(response: any, itemId: number): MarketItem | null {
  if (!response || response.type === 'none') return null;
  
  const value = response.value || response;
  
  return {
    id: itemId,
    name: value.name?.value || value.name || '',
    description: value.description?.value || value.description || '',
    price: BigInt(value.price?.value || value.price || 0),
    quantity: BigInt(value.quantity?.value || value.quantity || 0),
    seller: value.seller?.value || value.seller || '',
    active: value.active?.value ?? value.active ?? true,
  };
}
