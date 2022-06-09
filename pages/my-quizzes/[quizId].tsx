import QuizApiService from '../../services/quizApi';
import { IQuestion, IQuestionFrom, IQuestionReq, IQuiz } from '../../types';
import QuestionCard from '../../components/question-card/question-card';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  message,
  Row,
  Select,
  Space,
  Spin,
  Typography,
} from 'antd';
import { DeleteOutlined, SendOutlined } from '@ant-design/icons';
import React, { FC, Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { connect } from 'react-redux';
import { QuizzesState } from '../../store/quizzes/reducer';
import { nextServerAPI } from '../../config/constants';
import Head from 'next/head';
import NavBar from '../../components/nav-bar/nav-bar';
import { useWalletContext } from '../../components/WalletContext';
import { getQuizAppContract } from '../../hooks/contractHelpers';
import { ethers } from 'ethers';
import { shuffleArray } from '../../utils';
import QuizManagement from '../../components/my-quizzes/quiz-management';

interface MainProps {
  quizzes: QuizzesState;
  quizId: string;
  quiz: IQuiz;
  quizContractId: string;
}

const EditQuiz: FC<MainProps> = ({ quizId, quizzes, quizContractId }) => {
  const [form] = Form.useForm();
  const router = useRouter();

  const [quizDetailsByUser, setQuizDetailsByUser] = useState<
    undefined | IQuestionFrom[]
  >(undefined);
  const [quizDetails, setQuizDetails] = useState<undefined | IQuiz>(undefined);
  const [questionsNo, setQuestionsNo] = useState(2);
  const { provider, chainId } = useWalletContext();
  const [loading, setLoading] = useState<boolean>(false);

  if (router.isFallback) {
    return <Spin spinning={true} />;
  }

  /** on-mount (get quiz details by userId)*/
  useEffect(() => {
    if (!quizzes?.name) {
      message.error('Please connect the wallet first!', 3);
      router.push('/my-quizzes');
    }
    (async () => {
      if (chainId == null) {
        return;
      }
      // const contract = getQuizAppContract(chainId);
      const quizDetails =
        await QuizApiService.getInstance().getContractQuizById(quizContractId);

      const response = await QuizApiService.getInstance().getQuizByCid(
        quizId as string
      );

      if (response == null) {
        message.error('Error getting quiz details for current user: ');
      } else {
        const formatQuestions: any = response.questions.map((question) => {
          const answer = question.answers;
          const formatted = {};
          question.answers.forEach((ans, i) => {
            formatted[`answer${i + 1}`] = ans;
          });
          return { ...question, ...formatted };
        });
        setQuizDetails(quizDetails);
        setQuizDetailsByUser(formatQuestions);
      }
    })();
  }, []);

  const onSubmit = async (values) => {
    setLoading(true);
    if (quizzes.surname == null || quizzes.name == null) {
      message.error('Cannot locate wallet address.', 3);
      setLoading(false);
      return;
    }

    const chainId: number = quizzes.surname;
    const quizAppContract = getQuizAppContract(chainId);
    const rewards = ethers.utils.parseEther('1');

    const questions: IQuestionReq[] = [];
    for (const el of values.questions) {
      let answers = [el.answer1, el.answer2, el.answer3, el.answer4].filter(
        (i) => i
      );

      // check for duplicates
      if (new Set(answers).size !== answers.length) {
        setLoading(false);
        return message.error(
          `You have duplicates answers for question: ${el.question}`
        );
      }

      // check for correct answer in other answers
      if (answers.includes(el.correct_answer)) {
        setLoading(false);
        return message.error(
          `No need to include the correct answer in additional options for question: ${el.question}`
        );
      }

      answers = shuffleArray(answers);
      questions.push({
        answers,
        question: el.question,
        correct_answer: el.correct_answer,
      });
    }
    const payload = {
      data: {
        questions,
        title: values.title,
      },
    };

    // const response = await fetch(`${nextServerAPI}/create-quiz`, {
    //   method: 'POST',
    //   body: JSON.stringify(payload),
    // }).then((res) => res.json());
    const responseCid = await QuizApiService.getInstance().createQuiz(payload);

    if (responseCid == null) {
      setLoading(false);
      return message.error('Cannot create quiz, web3 storage error!', 3);
    }

    try {
      const tx = await quizAppContract
        .connect(provider.getSigner())
        .updateQuizDetails(quizContractId, responseCid, values.title, rewards);
      if (tx?.hash) {
        message.success(`Transaction subbmitted with hash ${tx.hash}`, 3);
      }
    } catch (e) {
      setLoading(false);
      message.error('Error submitting transaction!', 3);
    }
    // form.resetFields();
    return setLoading(false);
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
          <Alert
            message={
              <span
                style={{
                  fontStyle: 'italic',
                  fontWeight: 'bold',
                  fontSize: 18,
                }}
              >
                Note!
              </span>
            }
            description={
              <div style={{ fontSize: 16 }}>
                <span>* To start the quiz, provide quiz END TIME.</span>
                <br />
                <span>
                  * Once the quiz is started, you cannot edit the quiz details.
                </span>
                <br />
                <span>
                  * Once the END TIME is passed, option to submit answers will
                  be provided.
                </span>
                <br />
                <span>
                  * Once you submit the quiz answers, no further submissions
                  will be rewarded.
                </span>
              </div>
            }
            type={'warning'}
            showIcon={true}
          />
        </Col>

        <Col span={24}>
          <Row align='middle'>
            {quizDetails && quizDetailsByUser && (
              <QuizManagement
                quizQuestions={quizDetailsByUser}
                quizDetails={quizDetails}
                quizContractId={quizContractId}
              />
            )}
          </Row>
        </Col>
        <Col>
          {quizDetailsByUser && (
            <Card style={{ maxWidth: '650px' }}>
              <Form
                form={form}
                onFinish={onSubmit}
                labelAlign={'left'}
                initialValues={{
                  questions: quizDetailsByUser,
                }}
                colon={false}
              >
                {quizDetails?.title && (
                  <Form.Item
                    label={'Title'}
                    name={'title'}
                    initialValue={quizDetails.title}
                    rules={[{ required: true }]}
                  >
                    <Input placeholder={'e.g.: My awesome quiz'} />
                  </Form.Item>
                )}
                <Alert
                  message={
                    <span
                      style={{
                        fontStyle: 'italic',
                        fontWeight: 'bold',
                        fontSize: 14,
                      }}
                    >
                      Note!
                    </span>
                  }
                  description={
                    <div style={{ fontSize: 13 }}>
                      <span>
                        * Correct answer will be automatically added to question
                        options
                      </span>
                      <br />
                      <span>
                        * Two additional question answers are required (a, b -
                        required and c,d - optional)
                      </span>
                      <br />
                      <span>
                        * Changing the question no from a greater to a smaller
                        value will delete last questions
                      </span>
                      <br />
                      <span>
                        * The new quiz will appear in the quizzes list in a few
                        seconds after creating it, just click on refresh quizzes
                        button
                      </span>
                    </div>
                  }
                  type={'info'}
                  showIcon={true}
                />
                <Form.List name='questions'>
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Fragment key={key}>
                          <Divider orientation={'left'} plain={true}>
                            <span
                              style={{
                                fontSize: '14px',
                                fontWeight: 'normal',
                                fontStyle: 'italic',
                                opacity: 0.7,
                              }}
                            >
                              question {name + 1}
                            </span>
                          </Divider>
                          <Row gutter={[8, 8]}>
                            <Col span={22}>
                              <Form.Item
                                {...restField}
                                name={[name, 'question']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Missing question ',
                                  },
                                ]}
                                wrapperCol={{ span: 24 }}
                                style={{ marginBottom: 0 }}
                              >
                                <Input.TextArea
                                  rows={1}
                                  placeholder={'Question text'}
                                  maxLength={300}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={2}>
                              <Button
                                block={true}
                                icon={<DeleteOutlined />}
                                onClick={() => remove(name)}
                                danger={true}
                                disabled={
                                  fields.length === 1 || quizDetails?.isActive
                                }
                              />
                            </Col>
                            <Col span={24}>
                              <Form.Item
                                {...restField}
                                name={[name, 'correct_answer']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Missing correct answer',
                                  },
                                ]}
                                wrapperCol={{ span: 24 }}
                                style={{ marginBottom: 0 }}
                              >
                                <Input placeholder={'Correct answer'} />
                              </Form.Item>
                            </Col>
                            <Col lg={12} xs={24}>
                              <Form.Item
                                {...restField}
                                name={[name, 'answer1']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Missing option ( a )',
                                  },
                                ]}
                                wrapperCol={{ span: 24 }}
                                style={{ marginBottom: 0 }}
                              >
                                <Input placeholder={'Option ( a )'} />
                              </Form.Item>
                            </Col>
                            <Col lg={12} xs={24}>
                              <Form.Item
                                {...restField}
                                name={[name, 'answer2']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Missing option ( b )',
                                  },
                                ]}
                                wrapperCol={{ span: 24 }}
                                style={{ marginBottom: 0 }}
                              >
                                <Input placeholder={'Option ( b )'} />
                              </Form.Item>
                            </Col>
                            <Col lg={12} xs={24}>
                              <Form.Item
                                {...restField}
                                name={[name, 'answer3']}
                                wrapperCol={{ span: 24 }}
                                style={{ marginBottom: 0 }}
                              >
                                <Input placeholder={'Option ( c )'} />
                              </Form.Item>
                            </Col>
                            <Col lg={12} xs={24}>
                              <Form.Item
                                {...restField}
                                name={[name, 'answer4']}
                                wrapperCol={{ span: 24 }}
                                style={{ marginBottom: 0 }}
                              >
                                <Input placeholder={'Option ( d )'} />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Fragment>
                      ))}
                      {quizDetailsByUser &&
                        quizDetailsByUser.length > fields.length && (
                          <Form.Item
                            wrapperCol={{ span: 24 }}
                            style={{ marginTop: 24 }}
                          >
                            <Button
                              type='dashed'
                              onClick={() => add()}
                              block={true}
                              disabled={quizDetails?.isActive}
                            >
                              Add question
                            </Button>
                          </Form.Item>
                        )}

                      {quizDetailsByUser.length === fields.length && (
                        <Alert
                          style={{ margin: '24px 0' }}
                          message={
                            <span
                              style={{
                                fontStyle: 'italic',
                                fontWeight: 'bold',
                                fontSize: 14,
                              }}
                            >
                              Reached questions limit!
                            </span>
                          }
                          type={'warning'}
                          description={
                            <div style={{ fontSize: 13 }}>
                              <span>{`You've defined the maximum number of questions as ${questionsNo}`}</span>
                            </div>
                          }
                          showIcon={true}
                        />
                      )}
                    </>
                  )}
                </Form.List>

                <Form.Item>
                  <Row gutter={8} justify={'space-between'}>
                    <Button onClick={() => router.push('/my-quizzes')}>
                      See all of your quizzes
                    </Button>
                    <Space direction={'horizontal'}>
                      <Button
                        block={true}
                        type={'primary'}
                        danger={true}
                        onClick={() => form.resetFields()}
                        disabled={quizDetails?.isActive}
                      >
                        Discard
                      </Button>
                      <Button
                        block={true}
                        type={'primary'}
                        htmlType={'submit'}
                        loading={loading}
                        disabled={quizDetails?.isActive}
                      >
                        Create
                      </Button>
                    </Space>
                  </Row>
                </Form.Item>
              </Form>
            </Card>
          )}
        </Col>
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

export default connect(mapStateToProps, mapDispatchToProps)(EditQuiz);
