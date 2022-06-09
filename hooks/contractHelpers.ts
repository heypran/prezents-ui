import { ethers } from 'ethers';

import QuizAbi from '../abi/QiuzApp.json';
import { networkConfig } from '../config/network';
import { toHex } from '../utils/wallet';
import { QuizApp } from '../abi/types/QuizApp';
import { getQuizAppContractAddress } from './addressHelpers';

export const getRpcUrlByChainId = (chainId: number): string => {
  const networkRpc = networkConfig[toHex(chainId).toString()].rpcUrls[0];
  return networkRpc;
};

export const getRpcProviderByChainId = (chainId: number) => {
  return new ethers.providers.JsonRpcProvider(getRpcUrlByChainId(chainId));
};

const getContract = (abi: any, address: string, chainId: number) => {
  const signerOrProvider = getRpcProviderByChainId(chainId);
  return new ethers.Contract(address, abi, signerOrProvider);
};

export const getQuizAppContract = (chainId: number) => {
  try {
    const contractAddr = getQuizAppContractAddress(chainId);
    return getContract(QuizAbi.abi, contractAddr, chainId) as QuizApp;
  } catch (e) {
    console.log(
      `Error getting contract for the chainId ${chainId}. Returning default..`
    );
  }
  const contractAddr = getQuizAppContractAddress(chainId);
  return getContract(QuizAbi.abi, contractAddr, chainId);
};
