import { toHex } from '../utils/wallet';
import { CHAIN_ID } from './constants';
import { networkConfig } from './network';

export const getDappCurrencySymbol = () => {
  return networkConfig[toHex(CHAIN_ID)]?.nativeCurrency?.symbol;
};
