import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Radio,
  message,
  Alert,
  Space,
} from 'antd';
import { FC, useState } from 'react';
import { IQuestion, ISubmitQuestionBody } from '../../types';
import { connect } from 'react-redux';
import { QuizzesState } from '../../store/quizzes/reducer';
import { nextServerAPI } from '../../config/constants';
import { useRouter } from 'next/router';
import { bindActionCreators } from 'redux';

require('./question-card.less');

interface MainProps extends IQuestion {
  selectAnswer: (questionIndex: number, answer: number) => void;
  questionIndex: number;
  userAlreadyAttempted: number[];
}

interface ISubmittedDetailsState {
  sent: boolean;
  correct?: boolean;
  correct_answer?: string;
  id?: number;
  submitted_answer?: string;
}

const QuestionCard: FC<MainProps> = (props) => {
  const {
    id,
    question,
    answers,
    questionIndex,
    selectAnswer,
    userAlreadyAttempted,
  } = props;

  const [form] = Form.useForm();

  const onFinish = async (values) => {
    selectAnswer(questionIndex, values.answer);
  };
  const isAttempted = userAlreadyAttempted?.length > 0;
  return (
    <Form
      form={form}
      onFinish={onFinish}
      // initialValues={{
      //   answer: submittedDetails.submitted_answer,
      // }}
    >
      <Card
        className={'question-card'}
        title={
          <Row gutter={[8, 8]} justify={'space-between'}>
            <Col>* {question}</Col>
            <Col></Col>
            <Col></Col>
          </Row>
        }
        style={{ width: '100%' }}
        bordered={false}
      >
        <Form.Item name={'answer'} rules={[{ required: true }]}>
          <Radio.Group
            onChange={(e) => {
              if (e.target.value == null) {
                return;
              }
              selectAnswer(questionIndex, e.target.value);
            }}
            disabled={isAttempted}
            defaultValue={userAlreadyAttempted[questionIndex]}
          >
            <Space direction={'vertical'}>
              {answers.map((a, index) => (
                <Radio value={index + 1} key={`${a}_${index}`}>
                  {a}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </Form.Item>
      </Card>
    </Form>
  );
};

// const mapDispatchToProps = (dispatch) => ({
//   addQuizQuestionAnswer: bindActionCreators(
//     addQuizQuestionAnswerAction,
//     dispatch
//   ),
// });

// const mapStateToProps = (state) => ({
//   quizzes: state.quizzesReducer,
// });

// export default connect(mapStateToProps, mapDispatchToProps)(QuestionCard);

export default QuestionCard;
