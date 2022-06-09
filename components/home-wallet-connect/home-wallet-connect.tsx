import { FC, useEffect } from 'react';
import { Button, Col, Row, Typography } from 'antd';
import { useRouter } from 'next/router';
import { useWalletContext } from '../WalletContext';
import { truncateAddress } from '../../utils/wallet';
import { useAppDispatch } from '../../state';
import { setUserAccount } from '../../state/quiz/reducer';

interface WalletConnectComponentProps {}

const WalletConnectComponent: FC<WalletConnectComponentProps> = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { connectWallet, account, chainId, disconnect, provider } =
    useWalletContext();

  useEffect(() => {
    setWallet();
  }, [chainId, account]);

  const setWallet = async () => {
    if (chainId == null || account == null) {
      return;
    }
    await dispatch(
      setUserAccount({ account: truncateAddress(account ?? ' '), chainId })
    );
  };
  return (
    <Col>
      <Row>
        {account && (
          <Typography.Text
            style={{
              textAlign: 'center',
              marginRight: '8px',
              fontSize: '18px',
            }}
            className={'controls-text'}
            code={true}
          >
            {truncateAddress(account)}
          </Typography.Text>
        )}
        <Button type='primary' onClick={account ? disconnect : connectWallet}>
          {account ? `Disconnect` : `Connect`}
        </Button>
      </Row>
    </Col>
  );
};

export default WalletConnectComponent;
