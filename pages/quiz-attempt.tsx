import QuizApiService from '../services/quizApi';
import { IQuestion, IQuiz } from '../types';
import QuestionCard from '../components/question-card/question-card';
import { Alert, Button, Col, message, Row, Spin, Typography } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { connect } from 'react-redux';
import { QuizzesState } from '../store/quizzes/reducer';
import Head from 'next/head';
import NavBar from '../components/nav-bar/nav-bar';
import { getQuizAppContract } from '../hooks/contractHelpers';
import { useWalletContext } from '../components/WalletContext';
import { useAppDispatch } from '../state';
import { setTxWaiting } from '../state/quiz/reducer';

interface MainProps {}

const QuizAttempt: FC<MainProps> = ({}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { quizCidContractId } = router.query;
  const [quizId, quizContractId] =
    quizCidContractId?.toString().split('-') ?? [];
  const [quizDetailsByUser, setQuizDetailsByUser] = useState<
    undefined | IQuestion[]
  >(undefined);
  const [quizDetails, setQuizDetails] = useState<undefined | IQuiz>(undefined);
  const [loading, setLoading] = useState<boolean>();
  const [quizLoading, setQuizLoading] = useState<boolean>(true);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [userAlreadyAttemptedAnswers, setUserAlreadyAttemptedAnswers] =
    useState<number[]>([]);
  const { provider, account, chainId } = useWalletContext();
  if (router.isFallback) {
    return <Spin spinning={true} />;
  }

  /** on-mount (get quiz details by userId)*/
  useEffect(() => {
    if (account == null) {
      message.error('Please connect the wallet first!', 3);
      router.push('/quizzes');
      return;
    }
    (async () => {
      const quizDetails =
        await QuizApiService.getInstance().getContractQuizById(quizContractId);

      const response = await QuizApiService.getInstance().getQuizByCid(
        quizId as string
      );

      const userAlreadyAttempted =
        await QuizApiService.getInstance().getSubmittedAnswer(
          account,
          quizContractId
        );

      if (response == null) {
        message.error('Error getting quiz details for current user: ');
        setQuizLoading(false);
      } else {
        if (userAlreadyAttempted.filter((n) => n != 0).length > 0) {
          setUserAlreadyAttemptedAnswers(userAlreadyAttempted);
        }
        setQuizDetailsByUser(response.questions);
        setQuizDetails(quizDetails);
        setUserAnswers(response.questions.map((a) => 0));
        setQuizLoading(false);
      }
    })();
  }, []);

  const selectAnswer = (quitionIndex: number, answer: number) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[quitionIndex] = answer;
    setUserAnswers(updatedAnswers);
  };
  if (account == null) {
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

  const submitAnswers = async () => {
    if (account == null || chainId == null || quizDetails == null) {
      message.error('Please connect the wallet first!', 3);
      // router.push('/quizzes');
      return;
    }
    setLoading(true);

    const contract = getQuizAppContract(chainId);
    const dateNowUnix = Math.round(new Date().getTime() / 1000);
    let tx;
    if (quizDetails.endTime < dateNowUnix) {
      tx = await contract
        .connect(provider.getSigner())
        .submitAnswersPostQuizEnd(quizDetails.quizId, [...userAnswers]);
    } else {
      tx = await contract
        .connect(provider.getSigner())
        .submitAnswers(quizDetails.quizId, [...userAnswers]);
    }
    try {
      if (tx?.hash) {
        await dispatch(setTxWaiting(true));
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
              {/* {!!quizzes.answers[quizId] &&
                `[score: ${
                  quizzes.answers[quizId]?.filter((el) => el.correct).length
                }]`} */}
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

        {quizLoading && (
          <Col span={24}>
            <Typography.Title
              level={2}
              style={{ textAlign: 'center' }}
              className={'controls-text'}
            >
              Hold on Geek!, loading...
            </Typography.Title>
          </Col>
        )}

        {quizDetailsByUser && quizDetailsByUser?.length > 0 && (
          <>
            {quizDetailsByUser?.map((q, index) => {
              return (
                <Col span={24} key={`quesion-${index}`}>
                  <QuestionCard
                    {...q}
                    selectAnswer={selectAnswer}
                    userAlreadyAttempted={userAlreadyAttemptedAnswers}
                    questionIndex={index}
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
          </>
        )}
      </Row>
    </>
  );
};

// const mapDispatchToProps = (dispatch) => ({
//   txWaitingConfirmationAction: bindActionCreators(
//     txWaitingConfirmationAction,
//     dispatch
//   ),
// });

// const mapStateToProps = (state) => ({
//   quizzes: state.quizzesReducer,
// });

// export default connect(mapStateToProps, mapDispatchToProps)(QuizAttempt);

export default QuizAttempt;
