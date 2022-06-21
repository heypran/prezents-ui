import type { AppProps } from 'next/app';
import { wrapper } from '../store/store';
import { Typography } from 'antd';
import WalletContextProvider from '../components/WalletContext';
import { PersistGate } from 'redux-persist/integration/react';
import '../config/firebase-config';
import { Provider } from 'react-redux';
import { persistor, useStore } from '../state';
import { useEffect } from 'react';
require('../styles/global.less');

const App = ({ Component, pageProps }: AppProps) => {
  const store = useStore(pageProps.initialReduxState);
  // useEffect(() => {
  //   if (process.env.NEXT_PUBLIC_ENV == 'prod') {
  //     console.log = () => {};
  //   }
  // }, []);
  return (
    <>
      <Provider store={store}>
        {/* @ts-ignore */}
        <PersistGate loading={null} persistor={persistor}>
          <WalletContextProvider>
            {/* @ts-ignore */}
            <Component {...pageProps}></Component>
          </WalletContextProvider>
        </PersistGate>
      </Provider>
      {/* <Typography.Text
        code={true}
        style={{ position: 'fixed', bottom: 5, right: 5 }}
      >
        <a href=''>https://github.com/heypran</a>
      </Typography.Text> */}
    </>
  );
};
export default App;

// const ProductionErrorBoundary = process.env.NODE_ENV === 'production' ? ErrorBoundary : Fragment
