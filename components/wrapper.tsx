import { Divider, Row } from 'antd';
import React from 'react';
import Footer from './footer';
import NavBar from './nav-bar/nav-bar';

type PageWrapperProps = {
  children: React.ReactNode;
};

export function Wrapper(props: PageWrapperProps) {
  const { children } = props;

  return (
    <div style={{ width: '100%', minHeight: '100vh' }}>
      {/* <Header /> */}
      <Row
        style={{
          marginTop: 24,
          marginInlineEnd: '2rem',
          marginInlineStart: '2rem',
        }}
      >
        <NavBar />
        {/* <WalletConnectComponent /> */}
        <Divider />
      </Row>

      <div
        style={{
          paddingTop: 0,
          padding: '2rem',
          minHeight: '80vh',
        }}
      >
        {children}
      </div>

      <Footer />
    </div>
  );
}
