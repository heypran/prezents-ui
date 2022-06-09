import { FC, useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  message,
  Row,
  Space,
  Statistic,
  TimePicker,
  Typography,
} from 'antd';

import { IQuestionFrom, IQuiz } from '../../types';
import { useWalletContext } from '../WalletContext';
import { getQuizAppContract } from '../../hooks/contractHelpers';
import { mapOptionToNum } from '../../utils';
import moment from 'moment';
import { getDappCurrencySymbol } from '../../config/dapp-config';
import { ethers } from 'ethers';
import { useAppDispatch } from '../../state';
import { setTxWaiting } from '../../state/quiz/reducer';

interface QuizManagementProps {
  quizQuestions: IQuestionFrom[];
  quizDetails: IQuiz;
  quizContractId: string;
}

const QuizManagement: FC<QuizManagementProps> = ({
  quizQuestions,
  quizDetails,
  quizContractId,
}: QuizManagementProps) => {
  const [form] = Form.useForm();
  const [startQuizForm] = Form.useForm();
  const dispatch = useAppDispatch();
  const { RangePicker } = DatePicker;

  const [loading, setLoading] = useState<boolean>(false);
  const { provider, account, chainId } = useWalletContext();
  const { Countdown } = Statistic;
  const allowStartQuiz = quizDetails.endTime == 0; // TODO
  const allowSubmitAnswers =
    quizDetails.endTime < Math.round(new Date().getTime() / 1000);

  const startQuiz = async (values) => {
    setLoading(true);
    if (account == null || chainId == null) {
      message.error('Cannot locate wallet address.', 5);
      setLoading(false);
      return;
    }

    const endTimeUnix = values.endTime.unix();

    // TODO use this instead show delayed
    const [startTime, endTime] = values.rangeTime;
    // console.log(`startTime`, startTime.unix(), endTime.unix());

    const quizAppContract = getQuizAppContract(chainId);

    try {
      const tx = await quizAppContract
        .connect(provider.getSigner())
        .startQuiz(
          quizDetails.quizId,
          endTime.unix(),
          ethers.utils.parseUnits(values.rewardsPool, 'ether').toBigInt(),
          {
            value: ethers.utils
              .parseUnits(values.rewardsPool, 'ether')
              .toBigInt(),
          }
        );
      if (tx?.hash) {
        message.success(`Transaction subbmitted with hash ${tx.hash}`, 5);
        dispatch(setTxWaiting(true));
      }
    } catch (e) {
      console.log('Error: ', e);
      message.error('Error submitting transaction! Please try again!', 5);
    }
    setLoading(false);
  };

  const onSubmit = async (values) => {
    setLoading(true);
    if (account == null || chainId == null) {
      message.error('Cannot locate wallet address.', 5);
      setLoading(false);
      return;
    }

    const answers = values.answers.map((ans) => {
      if (['a', 'b', 'c', 'd'].includes(ans)) {
        return mapOptionToNum(ans);
      }
      if ([1, 2, 3, 4].includes(ans)) {
        return ans;
      }
      return ans;
    });

    // not an allowed option
    if (
      answers.some((allowedOption) => ![1, 2, 3, 4].includes(allowedOption))
    ) {
      message.error('Error: Answer cannot an option more than 4!', 5);
      setLoading(false);
      return;
    }

    const quizAppContract = getQuizAppContract(chainId);
    try {
      const tx = await quizAppContract
        .connect(provider.getSigner())
        .endQuiz(quizDetails.quizId ?? Number(quizContractId), answers);
      if (tx?.hash) {
        message.success(`Transaction subbmitted with hash ${tx.hash}`, 5);
        dispatch(setTxWaiting(true));
      }
    } catch (e) {
      message.error('Error submitting transaction! Please try again!', 5);
    }
    setLoading(false);
  };

  return (
    <Card style={{ width: '100%' }}>
      <Row gutter={[8, 8]} justify={'space-between'}>
        <Col span={6}>
          <Typography.Title
            level={4}
            style={{ textAlign: 'center' }}
            className={'controls-text'}
          >
            <Typography.Text code={true}>
              {quizDetails.isActive ? ' Status: Active' : ' Status: InActive'}
            </Typography.Text>
          </Typography.Title>
          <Form
            form={startQuizForm}
            onFinish={startQuiz}
            labelAlign={'left'}
            initialValues={{}}
            colon={false}
          >
            <Space direction='vertical' size={16}>
              <Form.Item
                name='rewardsPool'
                label='Rewards'
                rules={[
                  {
                    required: true,
                    message: 'Rewards are required',
                  },
                ]}
                wrapperCol={{ span: 24 }}
                style={{ marginBottom: 0 }}
              >
                {/* <Input placeholder={`Quiz end time`} /> */}

                <Input
                  placeholder={`eg. 20 ${getDappCurrencySymbol()}`}
                  maxLength={300}
                  type='number'
                  disabled={allowStartQuiz == false}
                />
              </Form.Item>
              <Form.Item
                name='rangeTime'
                label='Time'
                rules={[
                  {
                    required: false,
                    message: 'Missing time for the quiz.',
                  },
                ]}
                wrapperCol={{ span: 24 }}
                style={{ marginBottom: 0 }}
              >
                {/* <TimePicker.RangePicker /> */}
                {/* @ts-ignore */}
                <RangePicker showTime />
              </Form.Item>
              <Form.Item
                name='endTime'
                label='End Time'
                rules={[
                  {
                    required: true,
                    message: 'Missing end time for the quiz.',
                  },
                ]}
                wrapperCol={{ span: 24 }}
                style={{ marginBottom: 0 }}
              >
                {/* <Input placeholder={`Quiz end time`} /> */}
                <TimePicker
                  status='warning'
                  disabled={allowStartQuiz == false}
                  use12Hours
                  format='h:mm a'
                />
              </Form.Item>
              <Button
                block={true}
                type={'primary'}
                loading={loading}
                htmlType={'submit'}
                disabled={allowStartQuiz == false}
              >
                Start Quiz
              </Button>
            </Space>
          </Form>
          <Divider />
          {quizDetails.endTime != 0 && (
            <Countdown
              title='Quiz ends in (hrs)'
              format='HH:mm:ss'
              value={moment.unix(quizDetails.endTime).toString()}
              onFinish={() => {}}
            />
          )}
        </Col>

        <Col span={12}>
          <Row style={{ width: '100%' }}>
            <Form
              form={form}
              onFinish={onSubmit}
              labelAlign={'left'}
              initialValues={{}}
              colon={false}
            >
              <Space direction='vertical' size={8}>
                {quizQuestions?.map((quiz, index) => (
                  <Form.Item
                    key={`uiz-${index}`}
                    label={`Question ${index + 1}`}
                    name={['answers', index]}
                    rules={[
                      {
                        required: true,
                        message: 'Missing correct answer',
                      },
                    ]}
                    wrapperCol={{ span: 24 }}
                    style={{ marginBottom: 0 }}
                  >
                    <Input
                      placeholder={`Answer (a,b,c,d)`}
                      disabled={allowSubmitAnswers == false}
                    />
                  </Form.Item>
                ))}

                <Button
                  block={true}
                  type={'primary'}
                  htmlType={'submit'}
                  loading={loading}
                  disabled={allowSubmitAnswers == false}
                >
                  Submit Answers
                </Button>
              </Space>
            </Form>
          </Row>
        </Col>
      </Row>
    </Card>
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

// export default connect(mapStateToProps, mapDispatchToProps)(QuizManagement);

export default QuizManagement;
