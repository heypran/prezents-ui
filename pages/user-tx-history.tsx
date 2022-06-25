import React, { FC, useEffect, useState } from 'react';
import { Avatar, Button, Card, Col, List, Row, Tag, Typography } from 'antd';
import { LinkOutlined, RightSquareFilled } from '@ant-design/icons';
import Header from '../components/header';
import { Wrapper } from '../components/wrapper';
import { useDispatch } from 'react-redux';
import { useAppDispatch } from '../state';
import { useWalletContext } from '../components/WalletContext';
import { fetchUserTxHistory } from '../state/quiz/reducer';
import { useGetUserTxHistory } from '../state/quiz/hooks';
import { getQuizAppContractAddress } from '../hooks/addressHelpers';
import { CHAIN_ID } from '../config/constants';
import QuizAbi from '../abi/QiuzApp.json';
import { UserTxHistoryItemType } from '../state/types';
import { truncateAddress } from '../utils/wallet';
import { ethers } from 'ethers';
import { eventTopics } from '../store/quizzes/helper';

interface MainProps {}
const eventColorMapping = {
  QuizCreated: 'orange',
  QuizEnded: 'red',
  QuizStarted: 'green',
  QuizUpdated: 'yellow',
  RewardRedemption: 'gold',
  QuizAnswerSubmitted: 'yellow',
};
const UserTxHistory: FC<MainProps> = ({}) => {
  const dispatch = useAppDispatch();
  const { account, chainId } = useWalletContext();
  const history = useGetUserTxHistory();
  const iface = new ethers.utils.Interface(QuizAbi.abi);
  const [filteredHistory, setFilteredHistory] = useState<
    UserTxHistoryItemType[]
  >([]);
  useEffect(() => {
    if (account == null) {
      return;
    }
    dispatch(fetchUserTxHistory({ account }));
  }, [account]);

  useEffect(() => {
    if (history == null || chainId == null) {
      return;
    }

    const quizDappContractAddr = getQuizAppContractAddress(chainId);
    const fitlered = history.items.filter((item) => {
      return (
        item.to_address?.toLowerCase() === quizDappContractAddr.toLowerCase()
      );
    });
    setFilteredHistory(fitlered);
  }, [history, chainId]);

  const TxHistoryList = React.useMemo<React.ReactElement>(() => {
    return (
      <List
        dataSource={filteredHistory}
        renderItem={(item) => {
          //iface.getEvent(data.items[2].raw_log_topics[0]),
          // item.items.map((i) => iface.getEvent(i.raw_log_topics[0]));
          let txEvents: string = '';

          item.log_events?.forEach((event) => {
            if (
              event?.raw_log_topics?.[0] &&
              Object.values(eventTopics).includes(event?.raw_log_topics?.[0])
            ) {
              const parsedData = iface.parseLog({
                topics: event.raw_log_topics,
                data: '0x',
              });

              txEvents = parsedData.name;
            }
          });
          console.log('eventColorMapping[txEvents]', txEvents);
          // const parsedData = iface.parseLog({
          //   topics: item.log_events?.[0].raw_log_topics,
          //   data: '0x',
          // });

          return (
            <List.Item
              key={item.tx_hash}
              style={{
                padding: '16px',
              }}
            >
              <List.Item.Meta
                avatar={<LinkOutlined />}
                title={
                  <Typography.Title level={5}>
                    {truncateAddress(item.tx_hash)}
                  </Typography.Title>
                }
                description={
                  <Tag
                    color={eventColorMapping[txEvents]}
                    key={txEvents}
                    style={{ fontSize: '14px' }}
                  >
                    {txEvents.toUpperCase()}
                  </Tag>
                }
              />

              <Typography.Title level={5}>
                From: {item.from_address}
              </Typography.Title>
              <Button type='link' icon={<RightSquareFilled />}>
                View
              </Button>
            </List.Item>
          );
        }}
      />
    );
  }, [filteredHistory]);
  return (
    <>
      <Header
        title='Prezents | User Tx History'
        meta='prezents, learn to earn dapp web3'
      />
      <Wrapper>
        <Row justify='center' align='top'>
          <Col span={24}>
            <Typography.Title
              level={2}
              style={{ textAlign: 'center' }}
              className={'controls-text'}
            >
              <Typography.Text code={true}>Transaction History</Typography.Text>
            </Typography.Title>
            <Row justify='center'>
              <Col span={24}>{TxHistoryList}</Col>
            </Row>
          </Col>
        </Row>
      </Wrapper>
    </>
  );
};

export default UserTxHistory;
