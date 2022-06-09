import { FC, useEffect, useState } from 'react';
import QuizCard from '../../components/quiz-card/quiz-card';
import { Button, Col, message, Row, Tooltip, Typography } from 'antd';
import QuizApiService from '../../services/quizApi';
import { IQuiz } from '../../types';
import Head from 'next/head';

import { useRouter } from 'next/router';
import NavBar from '../../components/nav-bar/nav-bar';
import { useWalletContext } from '../../components/WalletContext';

interface MainProps {
  quizzes: IQuiz[];
}

const MyQuizzes: FC<MainProps> = () => {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<IQuiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { account, chainId, provider } = useWalletContext();

  useEffect(() => {
    if (account == null || chainId == null) {
      message.info('Please connect your wallet!');
      router.push('/');
      return;
    }
    QuizApiService.getInstance()
      .getAllQuizzesByUser(account)
      .then((quizzes) => {
        setQuizzes(quizzes);
        setLoading(false);
      })
      .catch((err) => {
        console.log('Error', err);
        setLoading(false);
      });
  }, [account, chainId]);

  const isConnected = account != null && chainId != null && provider != null;
  return (
    <>
      <Head>
        <title>quizzes</title>
        <meta property='og:title' content='quizzes' key='title' />
      </Head>
      <Row gutter={[8, 8]} style={{ width: '100%', padding: '2rem' }}>
        <Col span={24}>
          <Typography.Title
            level={2}
            style={{ textAlign: 'center' }}
            className={'controls-text'}
          >
            <Typography.Text code={true}>
              <NavBar />
            </Typography.Text>
          </Typography.Title>
        </Col>

        {loading && (
          <Col span={24}>
            <Typography.Title
              level={2}
              style={{ textAlign: 'center' }}
              className={'controls-text'}
            >
              <Typography.Text code={true}>Loading...</Typography.Text>
            </Typography.Title>
          </Col>
        )}

        {loading === false && isConnected && quizzes.length === 0 && (
          <Col span={24}>
            <Typography.Title
              level={2}
              style={{ textAlign: 'center' }}
              className={'controls-text'}
            >
              <Typography.Text code={true}>
                You have not attempted or created any quiz.
              </Typography.Text>
            </Typography.Title>
          </Col>
        )}

        {isConnected &&
          quizzes.map((q) => (
            <Col xs={24} sm={12} md={8} lg={6} xl={4} key={q.quizCid}>
              <QuizCard
                {...q}
                routeTo='/quiz-management'
                queryParams={{
                  quizCidContractId: `${q.quizCid}-${q.quizId}`,
                }}
                ctaText='Manage'
                connectedAccount={account}
                chainId={chainId}
                provider={provider}
              />
            </Col>
          ))}
      </Row>
    </>
  );
};

export default MyQuizzes;
