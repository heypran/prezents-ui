import { providers } from 'ethers';
import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import Web3Modal from 'web3modal';
import { useWalletConnect } from '../hooks/useWalletConnect';
import { useAppDispatch } from '../state';
import { initializeQuizDapp } from '../state/quiz/reducer';

type WalletContextProviderPropsType = {
  children: React.ReactElement;
};

export type WalletContextProviderType = {
  provider: providers.Web3Provider;
  account: string | undefined;
  network: number | undefined;
  chainId: number | undefined;
  connectWallet: () => void;
  disconnect: () => void;
  switchNetwork: (networkId?: number) => void;
  setNetwork: Dispatch<SetStateAction<number>>;
  web3Modal: Web3Modal | undefined;
};

const WalletContext = React.createContext<WalletContextProviderType>(
  {} as WalletContextProviderType
);

function WalletContextProvider(props: WalletContextProviderPropsType) {
  const wallet = useWalletConnect();
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(initializeQuizDapp());
  }, [dispatch]);

  return (
    // @ts-ignore
    <WalletContext.Provider value={{ ...wallet }}>
      {props.children}
    </WalletContext.Provider>
  );
}

export default WalletContextProvider;

export const useWalletContext = (): WalletContextProviderType => {
  const walletContext = React.useContext(WalletContext);
  if (Object.keys(walletContext).length === 0) {
    throw new Error(`Missing WalletContext provider`);
  }
  return walletContext;
};
