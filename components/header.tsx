import Head from 'next/head';
import React from 'react';

type HeaderProps = {
  title?: string;
  meta?: string;
};

const defaultTitle = ' Prezents | Your go to learn to earn dapp';
const defaultMeta = 'Prezents | Your go to learn to earn dapp';

export default function Header(props: HeaderProps) {
  return (
    <Head>
      <title>{props?.title ?? defaultTitle}</title>
      <meta
        property='og:title'
        content={props.meta ?? defaultMeta}
        key='title'
      />
    </Head>
  );
}
