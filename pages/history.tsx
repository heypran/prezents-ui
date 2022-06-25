import React, { FC, Fragment, useEffect, useState } from 'react';
import Head from 'next/head';
import {
  Alert,
  Anchor,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  message,
  Row,
  Space,
  Spin,
  Typography,
} from 'antd';
import { DeleteOutlined, SendOutlined, CopyOutlined } from '@ant-design/icons';
import { CHAIN_ID, QUIZ_LENGTH } from '../config/constants';
import { connect, useDispatch } from 'react-redux';
import { QuizzesState } from '../store/quizzes/reducer';
import { useRouter } from 'next/router';
import { IQuestionFrom, IQuestionReq } from '../types';
import QuizApiService from '../services/quizApi';
import { useWalletContext } from '../components/WalletContext';
import { getQuizAppContract } from '../hooks/contractHelpers';
import { ethers, EventFilter } from 'ethers';
import NavBar from '../components/nav-bar/nav-bar';
import { useGetBlockExplorer } from '../hooks/useGetBlockExplorer';

import { bindActionCreators } from 'redux';
import { setTxWaiting } from '../state/quiz/reducer';
import { useGetUserAccount } from '../state/quiz/hooks';
import Header from '../components/header';
import { Wrapper } from '../components/wrapper';
import { getQuizAppContractAddress } from '../hooks/addressHelpers';
import { eventTopics } from '../store/quizzes/helper';

interface MainProps {
  quizzes: QuizzesState;
  // txWaitingConfirmationAction(args: { isWaitingTxConfirmation: boolean }): void;
}

const History: FC = () => {
  const [form] = Form.useForm();
  const [formCid] = Form.useForm();
  const router = useRouter();
  const dispatch = useDispatch();
  const [questionsNo, setQuestionsNo] = useState(QUIZ_LENGTH);
  const [quizDetailsByUser, setQuizDetailsByUser] = useState<
    undefined | IQuestionFrom[]
  >(undefined);
  const { provider, chainId, account } = useWalletContext();
  const [loading, setLoading] = useState<boolean>(false);
  const { explorer } = useGetBlockExplorer(chainId);
  const [web3StorageResp, setWeb3StorageResp] = useState<string | undefined>();
  const quizContract = getQuizAppContract(CHAIN_ID);
  const quizContractAddr = getQuizAppContractAddress(CHAIN_ID);
  useEffect(() => {
    if (account == null) {
      message.error('Please connect the wallet first!', 3);
      // router.push('/');
      return;
    }
    getEvents();
  }, [account]);

  const getEvents = async () => {
    if (account == null) {
      return;
    }
    setLoading(true);
    // const filter: EventFilter = {
    //   address: quizContractAddr,
    //   topics: [
    //     eventTopics.quizCreated,
    //     null,
    //     ethers.utils.hexZeroPad(account, 32),
    //   ],
    // };
    const filter = await quizContract.filters.QuizCreated(
      null,
      account
      // ethers.utils.hexZeroPad(account, 32)
    );
    console.log('filter', filter);
    let events = await quizContract.queryFilter(filter, 26220000);

    console.log('events', events);
    setLoading(false);
  };

  return (
    <Wrapper>
      <Header
        title='Prezents | Learn To Earn Dapp | History'
        meta='Prezents | Learn To Earn Dapp | History'
      />

      <Row justify='center' align='top'>
        <Col span={24}>
          {/* <Typography.Title
            level={2}
            style={{ textAlign: 'center' }}
            className={'controls-text'}
          >
            <Typography.Text code={true}>
              Create a quiz of {QUIZ_LENGTH}
              &nbsp;questions 🤔
            </Typography.Text>
          </Typography.Title> */}
          <Row justify='center'>
            <Card style={{ maxWidth: '650px' }}>{loading && <Spin />}</Card>
          </Row>
        </Col>
      </Row>
    </Wrapper>
  );
};

export default History;
