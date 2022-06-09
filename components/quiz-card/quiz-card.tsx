import {
  Button,
  Card,
  Col,
  Divider,
  message,
  Row,
  Spin,
  Statistic,
  Typography,
} from 'antd';

import { FC, useState } from 'react';
import { IQuiz } from '../../types';
import { useRouter } from 'next/router';
import { QuizzesState } from '../../store/quizzes/reducer';
import { connect } from 'react-redux';
import moment from 'moment';
import { truncateAddress } from '../../utils/wallet';
import Link from 'next/link';
import { useGetUserScoreByQuizId } from '../../hooks/useGetUserScoreByQuizId';
import { getQuizAppContract } from '../../hooks/contractHelpers';
import { providers } from 'ethers';
import { getDappCurrencySymbol } from '../../config/dapp-config';
import { useGetUserQuizAnswers } from '../../hooks/useGetUserQuizAnswers';
import { CheckOutlined } from '@ant-design/icons';

import { useAppDispatch } from '../../state';
import { setTxWaiting } from '../../state/quiz/reducer';

require('./quiz-card.less');

interface MainProps extends IQuiz {
  routeTo?: string;
  queryParams?: any;
  connectedAccount: string;
  ctaText?: string;
  isUserAttemptedQuiz?: boolean;
  chainId: number;
  provider: providers.Web3Provider;
}

const QuizCard: FC<MainProps> = ({
  title,
  quizCid,
  quizId,
  rewards,
  attemptedCount,

  endTime,
  isActive,
  creator,
  connectedAccount,
  queryParams,
  ctaText,
  isUserAttemptedQuiz,
  routeTo,
  chainId,
  isEnded,
  provider,
  answers,
}) => {
  const router = useRouter();
  const { Countdown } = Statistic;
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const handleOnClick = () => {
    // if (!quizzes.userId) {
    //   return message.error('Please create a player first!');
    // }
    if (routeTo) {
      router.push(routeTo);
    }
  };
  const isCreator = creator === connectedAccount;

  const { score, rewards: userRewards } = useGetUserScoreByQuizId(
    connectedAccount,
    quizId,
    chainId
  );
  const { userQuizAnswer } = useGetUserQuizAnswers(
    connectedAccount,
    quizId,
    chainId
  );
  const redeemRewards = async () => {
    setLoading(true);

    try {
      const contract = getQuizAppContract(chainId);
      const tx = await contract
        .connect(provider.getSigner())
        .redeemRewards(quizId);
      if (tx?.hash) {
        dispatch(setTxWaiting(true));
        message.success(
          `Redemption transaciton sent with tx hash ${tx.hash}`,
          5
        );
      }
    } catch (e) {
      console.log('Err', e);
      message.error(`Error sending transaciton. Please try again!`, 5);
    }
    setLoading(false);
  };

  const showCountDownTimer =
    endTime != 0 && endTime > Math.round(new Date().getTime() / 1000);
  const showRewardPeriodEnded =
    endTime != 0 && endTime < Math.round(new Date().getTime() / 1000);

  return (
    <Card
      className={'quiz-card'}
      title={`${title}`}
      hoverable={true}
      // onClick={()=>}
      bordered={false}
    >
      <Col>
        <Typography.Title level={5}>
          Participants: {attemptedCount}
        </Typography.Title>
        <Typography.Title level={5}>
          Status: {isActive ? 'Active' : 'InActive'}
        </Typography.Title>
        <Typography.Title level={5} style={{ textAlign: 'left' }}>
          Rewards 🎉 : {rewards}
          <Typography.Text style={{ fontSize: '10px' }}>
            {` ${getDappCurrencySymbol()}`}
          </Typography.Text>
        </Typography.Title>
        {showCountDownTimer && (
          <Countdown
            title='Quiz ends in (hrs)'
            format='HH:mm:ss'
            value={moment.unix(endTime).toString()}
            onFinish={() => {}}
          />
        )}
        {showRewardPeriodEnded && (
          <Typography.Title level={5} style={{ textAlign: 'left' }} disabled>
            Boosted reward period ended
          </Typography.Title>
        )}
        {/* {quizCid && (
          <Typography.Title level={5} style={{ textAlign: 'left' }} disabled>
            QuizId:{quizCid.slice(-7)}
          </Typography.Title>
        )} */}
        {creator && (
          <Typography.Text style={{ textAlign: 'left' }} disabled>
            Created by: {isCreator ? 'You' : truncateAddress(creator)}
          </Typography.Text>
        )}

        <Divider />
        {isUserAttemptedQuiz && isEnded == false && (
          <Typography.Title level={5} style={{ textAlign: 'left' }} disabled>
            Waiting for results... <Spin />
          </Typography.Title>
        )}
        {isUserAttemptedQuiz && isEnded && (
          <>
            {score != null ? (
              <Typography.Title level={5} style={{ textAlign: 'left' }}>
                Your Score: {score}
              </Typography.Title>
            ) : (
              <Spin />
            )}

            {rewards != null ? (
              <Typography.Title level={5} style={{ textAlign: 'left' }}>
                Your Rewards: {userRewards}
                <Typography.Text style={{ fontSize: '10px' }}>
                  {` ${getDappCurrencySymbol()}`}
                </Typography.Text>
              </Typography.Title>
            ) : (
              <Spin />
            )}
          </>
        )}

        {/* Only Show when user has not attempted or it is created by user */}
        {(isCreator === true || isUserAttemptedQuiz === false) && (
          <Link
            href={{
              pathname: isCreator ? '/quiz-management' : routeTo,
              query: queryParams ?? {
                quizCidContractId: `${quizCid}-${quizId}`,
              },
            }}
          >
            <Button type='primary' style={{ width: '100%' }}>
              {isCreator ? 'Manage' : ctaText}
            </Button>
          </Link>
        )}

        <Row justify='space-between'>
          {isUserAttemptedQuiz == true && isEnded && (
            <Col span={11}>
              <Link
                href={{
                  pathname: '/quiz-attempt',
                  query: queryParams ?? {
                    quizCidContractId: `${quizCid}-${quizId}`,
                  },
                }}
              >
                <Button type='primary' style={{ width: '100%' }}>
                  {'View'}
                </Button>
              </Link>
            </Col>
          )}

          {isUserAttemptedQuiz && isEnded && userRewards && (
            <Col span={11}>
              <Button
                type='primary'
                icon={
                  userQuizAnswer &&
                  userQuizAnswer.redeemedRewards > 0 && <CheckOutlined />
                }
                onClick={redeemRewards}
                disabled={userQuizAnswer && userQuizAnswer.redeemedRewards > 0}
                loading={loading}
              >
                Redeem
              </Button>
            </Col>
          )}
        </Row>
      </Col>
    </Card>
  );
};

export default QuizCard;
