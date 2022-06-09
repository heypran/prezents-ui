import QuizApiService from '../../services/quizApi';
import { IQuestion, IQuestionFrom, IQuiz } from '../../types';
import QuestionCard from '../../components/question-card/question-card';
import { Alert, Button, Col, message, Row, Spin, Typography } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { connect } from 'react-redux';
import { QuizzesState } from '../../store/quizzes/reducer';
import { nextServerAPI } from '../../config/constants';
import Head from 'next/head';
import NavBar from '../../components/nav-bar/nav-bar';
import { getQuizAppContract } from '../../hooks/contractHelpers';
import { useWalletContext } from '../../components/WalletContext';

interface MainProps {
  quizzes: QuizzesState;
  quizId: string;
  quiz: IQuiz;
  quizContractId: string;
}

const Quiz: FC<MainProps> = ({ quiz, quizId, quizzes, quizContractId }) => {
  const router = useRouter();
  const [quizDetailsByUser, setQuizDetailsByUser] = useState<
    undefined | IQuestion[]
  >(undefined);
  const [quizDetails, setQuizDetails] = useState<undefined | IQuiz>(undefined);
  const [loading, setLoading] = useState<boolean>();
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const { provider } = useWalletContext();
  if (router.isFallback) {
    return <Spin spinning={true} />;
  }

  /** on-mount (get quiz details by userId)*/
  useEffect(() => {
    if (!quizzes?.name) {
      message.error('Please connect the wallet first!', 3);
      router.push('/quizzes');
    }
    (async () => {
      const quizDetails =
        await QuizApiService.getInstance().getContractQuizById(quizContractId);

      const response = await QuizApiService.getInstance().getQuizByCid(
        quizId as string
      );

      if (response == null) {
        message.error('Error getting quiz details for current user: ');
      } else {
        setQuizDetailsByUser(response.questions);
        setQuizDetails(quizDetails);
        setUserAnswers(response.questions.map((a) => 0));
      }
    })();
  }, []);

  const selectAnswer = (quitionIndex: number, answer: number) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[quitionIndex] = answer;
    setUserAnswers(updatedAnswers);
  };
  if (!quizzes?.name) {
    return (
      <Typography.Title
        level={2}
        style={{ textAlign: 'center' }}
        className={'controls-text'}
      >
        Loader
      </Typography.Title>
    );
  }

  const submitAnswers = () => {
    if (quizzes?.surname == null || quizDetails == null) {
      message.error('Please connect the wallet first!', 3);
      router.push('/quizzes');
      return;
    }
    setLoading(true);
    const chainId = quizzes.surname;
    const contract = getQuizAppContract(chainId);
    console.log(`quiz.quizId,`, quizDetails.quizId, userAnswers);
    try {
      const tx = contract
        .connect(provider.getSigner())
        .submitAnswers(quizDetails.quizId, [...userAnswers, 0, 0]);
      if (tx?.hash) {
        message.success(`Transaction submitted with tx hash ${tx?.hash}`, 5);
      }
    } catch (e) {
      console.log('Error: ', e);
      message.error(`Error in submitting Transaction! Please try again!`, 5);
    }
    setLoading(false);
  };
  return (
    <>
      <Head>
        <title>quiz - {quizId}</title>
        <meta property='og:title' content='quiz' key='title' />
      </Head>
      <Row gutter={[8, 8]} style={{ width: '100%', padding: '2rem' }}>
        <NavBar />
        <Col span={24}>
          <Typography.Title
            level={2}
            style={{ textAlign: 'center' }}
            className={'controls-text'}
          >
            <Typography.Text code={true}>
              {quizDetails?.title} &nbsp;
              {!!quizzes.answers[quizId] &&
                `[score: ${
                  quizzes.answers[quizId]?.filter((el) => el.correct).length
                }]`}
            </Typography.Text>
          </Typography.Title>
        </Col>

        <Alert
          style={{ width: '100%' }}
          message={
            <span
              style={{ fontStyle: 'italic', fontWeight: 'bold', fontSize: 14 }}
            >
              Note!
            </span>
          }
          description={
            <div style={{ fontSize: 13 }}>
              <span>
                * Each question has only a <strong>single</strong> correct
                answer
              </span>
              <br />
              <span>
                * You <strong>can not edit</strong> the submitted answer
              </span>
            </div>
          }
          type={'info'}
          showIcon={true}
        />

        {quizDetailsByUser?.map((q, index) => {
          return (
            <Col span={24} key={`quesion-${index}`}>
              <QuestionCard
                {...q}
                selectAnswer={selectAnswer}
                questionIndex={index}
                userAlreadyAttempted={[]}
              />
            </Col>
          );
        })}
        <Row justify='end' style={{ width: '100%' }}>
          <Button
            htmlType={'submit'}
            disabled={userAnswers.some((ans) => ans === 0)}
            onClick={submitAnswers}
            loading={loading}
          >
            Submit Answers
          </Button>
        </Row>
      </Row>
    </>
  );
};

export const getStaticPaths = async () => {
  const paths = [].map((_) => ({
    params: {},
  }));

  return {
    paths: paths,
    fallback: 'blocking',
  };
};

export const getStaticProps = async ({
  params,
}: {
  params: { quizId: string };
}) => {
  const [quizId, quizContractId] = params.quizId.split('-');
  const quiz = await QuizApiService.getInstance().getQuizByCid(quizId);

  return {
    props: {
      quizId,
      quizContractId,
    },
  };
};

const mapDispatchToProps = (dispatch) => ({});

const mapStateToProps = (state) => ({
  quizzes: state.quizzesReducer,
});

export default connect(mapStateToProps, mapDispatchToProps)(Quiz);
