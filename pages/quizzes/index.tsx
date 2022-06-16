import { FC, useEffect, useState } from 'react';
import QuizCard from '../../components/quiz-card/quiz-card';
import { Button, Col, message, Row, Tooltip, Typography } from 'antd';
import QuizApiService from '../../services/quizApi';
import { IQuiz } from '../../types';
import Head from 'next/head';
import { useRouter } from 'next/router';
import NavBar from '../../components/nav-bar/nav-bar';
import { useWalletContext } from '../../components/WalletContext';
import { useGetUserQuizIds } from '../../hooks/useGetUserAttemptedQuiz';
import QuizFilter from './quiz-filter';
import Header from '../../components/header';
import { Wrapper } from '../../components/wrapper';

interface MainProps {
  quizzes: IQuiz[];
}

const Quizzes: FC<MainProps> = () => {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<IQuiz[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const { account, chainId, provider } = useWalletContext();
  const { userAlreadyAttempted } = useGetUserQuizIds(account, chainId);
  useEffect(() => {
    if (account == null || chainId == null) {
      message.info('Please connect your wallet!');
      router.push('/');
      return;
    }
    QuizApiService.getInstance()
      .getAllQuizzesByCid()
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
    <Wrapper>
      <Header />
      <Row gutter={[8, 8]} style={{ width: '100%' }}>
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
                Sorry, there are no active quizzes.
              </Typography.Text>
            </Typography.Title>
          </Col>
        )}
      </Row>
      {/* <Row style={{ width: '100%', margin: '2rem' }} justify='center'>
        <QuizFilter />
      </Row> */}
      <Row gutter={[8, 8]} style={{ width: '100%' }}>
        {isConnected &&
          quizzes
            .filter((q) => q.isActive)
            .sort((a: IQuiz, b: IQuiz) => b.endTime - a.endTime)
            .map((q) => (
              <Col xs={24} sm={12} md={8} lg={6} xl={4} key={q.id}>
                <QuizCard
                  {...q}
                  connectedAccount={account}
                  chainId={chainId}
                  provider={provider}
                  routeTo='/quiz-attempt'
                  queryParams={{
                    quizCidContractId: `${q.quizCid}-${q.quizId}`,
                  }}
                  ctaText='Attempt'
                  isUserAttemptedQuiz={
                    userAlreadyAttempted &&
                    userAlreadyAttempted.includes(Number(q.quizId))
                  }
                />
              </Col>
            ))}
      </Row>
    </Wrapper>
  );
};

export default Quizzes;
