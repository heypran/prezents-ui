import { FC, useEffect } from 'react';
import {
  Button,
  Col,
  Dropdown,
  Menu,
  MenuProps,
  message,
  Row,
  Typography,
} from 'antd';
import { HistoryOutlined, LogoutOutlined } from '@ant-design/icons';
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
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    switch (e.key) {
      case '1':
        disconnect();
        break;
      case '2':
        router.push('/user-tx-history');
        break;
      default:
    }
  };
  const menu = (
    <Menu
      onClick={handleMenuClick}
      items={[
        {
          label: 'Disconnect',
          key: '1',
          icon: <LogoutOutlined />,
        },
        {
          label: 'History',
          key: '2',
          icon: <HistoryOutlined />,
        },
      ]}
    />
  );
  return (
    <Col>
      <Row>
        {/* {account && (
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
        )} */}
        {/* <Button type='primary' onClick={account ? disconnect : connectWallet}>
          {account ? `Disconnect` : `Connect`}
        </Button> */}
        <Dropdown.Button
          type='primary'
          onClick={account ? () => {} : connectWallet}
          overlay={account ? menu : <></>}
        >
          {account ? truncateAddress(account) : `Connect`}
        </Dropdown.Button>
      </Row>
    </Col>
  );
};

export default WalletConnectComponent;
