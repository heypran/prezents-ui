import { FC, useEffect, useState } from 'react';
import QuizCard from '../../components/quiz-card/quiz-card';
import {
  Button,
  Col,
  Form,
  message,
  Row,
  Select,
  Tooltip,
  Typography,
} from 'antd';
import QuizApiService from '../../services/quizApi';
import { IQuiz } from '../../types';
import Head from 'next/head';
import { useRouter } from 'next/router';
import NavBar from '../../components/nav-bar/nav-bar';
import { useWalletContext } from '../../components/WalletContext';
import { useGetUserQuizIds } from '../../hooks/useGetUserAttemptedQuiz';

interface MainProps {
  onChange?: (values: string[]) => void;
}

const QuizFilter: FC<MainProps> = ({ onChange }: MainProps) => {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<IQuiz[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const options = ['solidity', 'javscript', 'web3', 'NFTs'];

  const handleChange = (value: string[]) => {
    console.log(`selected ${value}`);
    if (onChange) {
      onChange(value);
    }
  };
  return (
    <Form.Item label={'Filter'} name={'quizCid'} rules={[{ required: false }]}>
      <Select
        mode='multiple'
        allowClear
        style={{ width: '500px' }}
        placeholder='Please select'
        defaultValue={['solidity', 'ethereum']}
        onChange={handleChange}
      >
        {options.map((option) => (
          <Select.Option key={option}>{option}</Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default QuizFilter;
