import React, { useEffect, useState } from 'react';
import { networkConfig } from '../config/network';
import { toHex } from '../utils/wallet';

export const useGetBlockExplorer = (chainId?: number): { explorer: string } => {
  const [explorer, setExplorer] = useState<string>('');

  useEffect(() => {
    if (chainId == null) {
      return;
    }
    setExplorer(networkConfig[toHex(chainId)].blockExplorerUrls?.[0].url);
  }, [chainId]);

  return { explorer };
};
