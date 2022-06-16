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
  Typography,
} from 'antd';
import { DeleteOutlined, SendOutlined, CopyOutlined } from '@ant-design/icons';
import { QUIZ_LENGTH } from '../config/constants';
import { connect, useDispatch } from 'react-redux';
import { QuizzesState } from '../store/quizzes/reducer';
import { useRouter } from 'next/router';
import { IQuestionFrom, IQuestionReq } from '../types';
import QuizApiService from '../services/quizApi';
import { useWalletContext } from '../components/WalletContext';
import { getQuizAppContract } from '../hooks/contractHelpers';
import { ethers } from 'ethers';
import NavBar from '../components/nav-bar/nav-bar';
import { useGetBlockExplorer } from '../hooks/useGetBlockExplorer';

import { bindActionCreators } from 'redux';
import { setTxWaiting } from '../state/quiz/reducer';
import { useGetUserAccount } from '../state/quiz/hooks';
import Header from '../components/header';
import { Wrapper } from '../components/wrapper';

interface MainProps {
  quizzes: QuizzesState;
  // txWaitingConfirmationAction(args: { isWaitingTxConfirmation: boolean }): void;
}

const CreateQuiz: FC<MainProps> = ({}) => {
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

  useEffect(() => {
    if (account == null) {
      message.error('Please connect the wallet first!', 3);
      router.push('/');
    }
  }, []);

  const onCreateFromCid = async (values) => {
    if (values.quizCid == null) {
      message.error('Cannot locate cid.', 3);

      return;
    }

    const response = await QuizApiService.getInstance().getQuizByCid(
      values.quizCid
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

      form.setFieldsValue({ questions: formatQuestions });
      setWeb3StorageResp(values.quizCid);
    }
    return setLoading(false);
  };
  const onSubmit = async (values, saveAnswerDuringCreation?: false) => {
    setLoading(true);
    if (account == null || chainId == null) {
      message.error('Cannot locate wallet address.', 3);
      setLoading(false);
      return;
    }

    const quizAppContract = getQuizAppContract(chainId);
    const rewards = ethers.utils.parseEther('1');
    const questions: IQuestionReq[] = [];

    for (const el of values.questions) {
      let answers: string[] = [];

      answers = [el.answer1, el.answer2, el.answer3, el.answer4].filter(
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
      // answers.push(el.correct_answer);
      // answers = shuffleArray(answers); // do not shuffle

      let correct_answer = '';
      // only save correct answer if flag is check
      // correct answers are revealed once the quiz ends.
      if (saveAnswerDuringCreation) {
        correct_answer = el.correct_answer;
      }

      questions.push({
        answers,
        question: el.question,
        correct_answer,
      });
    }

    const payload = {
      data: {
        questions,
        title: values.title,
      },
    };

    let responseCid;

    responseCid = await QuizApiService.getInstance().createQuiz(payload);
    if (responseCid == null) {
      setLoading(false);
      return message.error('Cannot create quiz, web3 storage error!', 5);
    }
    // TODO
    // if (web3StorageResp == responseCid ) {
    // }

    try {
      const tx = await quizAppContract
        .connect(provider.getSigner())
        .createQuiz(responseCid, values.title);
      if (tx?.hash) {
        message.success(
          <Typography.Text>
            {' '}
            Transaction subbmitted with hash{' '}
            <Anchor.Link href={explorer} title={tx.hash} />
          </Typography.Text>,
          10
        );
        dispatch(setTxWaiting(true));
      }
    } catch (e) {
      // setLoading(false);
      message.error('Error submitting transaction!', 5);
      console.log('Error: ', e);
    }
    // form.resetFields();
    // in case tx fails dont recreate cid
    setWeb3StorageResp(responseCid);
    return setLoading(false);
  };

  const handleQuestionNoChange = (nr) => {
    setQuestionsNo(nr);
    const formValues = form.getFieldsValue();
    const questions = formValues.questions;

    if (formValues.questions?.length > nr) {
      form.setFieldsValue({
        questions: questions.slice(0, nr),
      });
    }
  };

  return (
    <Wrapper>
      <Header
        title='Prezents | Learn To Earn Dapp | Create Quiz'
        meta='Prezents | Learn To Earn Dapp | Create Quiz'
      />

      <Row justify='center' align='top'>
        <Col span={24}>
          <Typography.Title
            level={2}
            style={{ textAlign: 'center' }}
            className={'controls-text'}
          >
            <Typography.Text code={true}>
              Create a quiz of {QUIZ_LENGTH}
              &nbsp;questions 🤔
            </Typography.Text>
          </Typography.Title>
          <Row justify='center'>
            <Card style={{ maxWidth: '650px' }}>
              <Form
                form={formCid}
                onFinish={onCreateFromCid}
                initialValues={{}}
                style={{ width: '100%' }}
              >
                <Row gutter={[8, 8]} justify='space-between'>
                  <Form.Item
                    label={'Load from CID'}
                    name={'quizCid'}
                    rules={[{ required: false }]}
                    style={{ width: '90%' }}
                  >
                    <Input
                      placeholder={
                        'bafybeifx2nqcnwbuhpsbxx2kojbxtivriptxwerpq2m4lzyzjnxiic5myu'
                      }
                    />
                  </Form.Item>
                  <Button
                    icon={<SendOutlined />}
                    htmlType={'submit'}
                    type='primary'
                  />
                </Row>
              </Form>

              <Form
                form={form}
                onFinish={onSubmit}
                labelAlign={'left'}
                initialValues={{ questions: quizDetailsByUser }}
                colon={false}
              >
                <Form.Item
                  label={'Title'}
                  name={'title'}
                  rules={[{ required: true }]}
                >
                  <Input placeholder={'e.g. web3 quiz'} />
                </Form.Item>
                {web3StorageResp && (
                  <Row justify='space-between'>
                    <Col span={21}>
                      <Form.Item
                        label={'Quiz Cid'}
                        help={
                          <p>
                            *Quiz content ID is auto generated and can be used
                            to restore quiz.
                          </p>
                        }
                      >
                        <Input
                          placeholder={'e.g. web3 quiz'}
                          value={web3StorageResp}
                          disabled={true}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <Button
                        block={true}
                        icon={<CopyOutlined />}
                        onClick={() => {
                          navigator.clipboard.writeText(web3StorageResp);
                        }}
                      />
                    </Col>
                  </Row>
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
                      <br />
                      <span>
                        * The new quiz will appear in MY QUIZZES list in a few
                        seconds after creating it, from there you can manage it
                        quiz and make it live.
                      </span>
                      <br />
                      <span>
                        * Once the a quiz is live you are not allowed to change
                        any question/options.
                      </span>
                      <br />
                      <span>
                        * Once the quiz ends, you will be able to submit answers
                        from MY QUIZZES section.
                      </span>
                      <br />
                      <span>
                        * All QUIZZES are immutable and stored on IPFS.
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
                                disabled={fields.length === 1}
                              />
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
                      {questionsNo && questionsNo > fields.length && (
                        <Form.Item
                          wrapperCol={{ span: 24 }}
                          style={{ marginTop: 24 }}
                        >
                          <Button
                            type='dashed'
                            onClick={() => add()}
                            block={true}
                          >
                            Add question
                          </Button>
                        </Form.Item>
                      )}

                      {questionsNo === fields.length && (
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
                    <Button onClick={() => router.push('/quizzes')}>
                      See all quizzes
                    </Button>

                    <Space direction={'horizontal'}>
                      <Button
                        block={true}
                        type={'primary'}
                        danger={true}
                        onClick={() => form.resetFields()}
                      >
                        Discard
                      </Button>
                      <Button
                        block={true}
                        type={'primary'}
                        htmlType={'submit'}
                        loading={loading}
                      >
                        Create
                      </Button>
                    </Space>
                  </Row>
                </Form.Item>
              </Form>
            </Card>
          </Row>
        </Col>
      </Row>
    </Wrapper>
  );
};

export default CreateQuiz;

// For testing
// bafybeigwrczyc44fzquvbbnm5jsnmthjsieebdcf6zwlivpnpurmasflci
// bafybeicbv3pjrmkx7vy27puybjitqibzo6r5hrlc2exp6jh4kf4ijhpaqe
// bafybeic6pg7exkydaz4rfpdpheofd3gxdhlpzcrsmidhd7zex4hyuqyv6a
// https://mycolor.space/?hex=%23333745&sub=1
