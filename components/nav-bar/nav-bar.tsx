import React, { FC, useEffect } from 'react';
import { Button, Col, message, Row, Spin, Tooltip, Typography } from 'antd';

import {
  HomeOutlined,
  EditFilled,
  UndoOutlined,
  DollarCircleFilled,
  IdcardFilled,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import HomeWalletConnect from '../home-wallet-connect/home-wallet-connect';
import { useWalletContext } from '../WalletContext';
import { getQuizAppContract } from '../../hooks/contractHelpers';

import { QuizzesState } from '../../store/quizzes/reducer';
import { setTxWaiting } from '../../state/quiz/reducer';
import { useAppDispatch } from '../../state';
import { useGetTxWaitingConfirmation } from '../../state/quiz/hooks';

interface MainProps {}
const navBarFontSize = '18px';
type NavBarLinkType = {
  link: string;
  name: string;
  tooltip: string;
  icon: any;
};
const navBarLinks = [
  {
    link: '/',
    name: 'Home',
    tooltip: 'Home',
    icon: <HomeOutlined style={{ fontSize: navBarFontSize }} />,
  },
  // {
  //   link: '/my-quizzes',
  //   name: 'My Quizzes',
  //   tooltip: 'Quizzes created by you',
  //   icon: <IdcardFilled style={{ fontSize: navBarFontSize }} />,
  // },
  {
    link: '/quizzes',
    name: 'Earn',
    tooltip: 'Earn to learn',
    icon: <DollarCircleFilled style={{ fontSize: navBarFontSize }} />,
  },
  // {
  //   link: '/create-quiz',
  //   name: 'Create',
  //   tooltip: 'Create new quizzes',
  //   icon: <EditFilled style={{ fontSize: navBarFontSize }} />,
  // },
];
const NavBar: FC<MainProps> = ({}: MainProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isTxWaitingConfirmation = useGetTxWaitingConfirmation();
  const handleReloadQuizzes = () => router.reload();

  const { account, chainId } = useWalletContext();
  console.log('isTxWaitingConfirmation', isTxWaitingConfirmation);
  useEffect(() => {
    if (account == null || chainId == null) {
      return;
    }

    const contract = getQuizAppContract(chainId);

    if (contract == null) {
      return;
    }
    contract.removeAllListeners();
    contract.on('QuizCreated', (quizId, createdBy, cid) => {
      console.log('QuizCreated', quizId, createdBy, isTxWaitingConfirmation);
      if (createdBy === account && isTxWaitingConfirmation) {
        message.success('Quiz created, Transaction Confirmed!', 10);
        dispatch(setTxWaiting(false));
      }
    });
    contract.on('QuizUpdated', (quizId, createdBy, cid) => {
      if (createdBy === account && isTxWaitingConfirmation) {
        message.success('Quiz updated, Transaction Confirmed!', 10);
        dispatch(setTxWaiting(false));
      }
    });
    contract.on('QuizStarted', (quizId, createdBy, cid) => {
      if (createdBy === account && isTxWaitingConfirmation) {
        message.success('Quiz Started, Transaction Confirmed!', 10);
        dispatch(setTxWaiting(false));
      }
    });
    contract.on('QuizEnded', (quizId, createdBy, cid) => {
      if (createdBy === account && isTxWaitingConfirmation) {
        message.success('Quiz ended, Transaction Confirmed!', 10);
        dispatch(setTxWaiting(false));
      }
    });
    contract.on('QuizAnswerSubmitted', (quizId, submittedBy) => {
      if (submittedBy === account && isTxWaitingConfirmation) {
        message.success('Quiz answers submitted, Transaction Confirmed!', 10);
        dispatch(setTxWaiting(false));
      }
    });
    contract.on('RewardRedemption', (user, quizId, rewards) => {
      if (user === account && isTxWaitingConfirmation) {
        message.success('Reward Redemption Transaction Confirmed!', 10);
        dispatch(setTxWaiting(false));
      }
    });
    return () => {
      contract.removeAllListeners();
    };
  }, [isTxWaitingConfirmation, account, chainId]);

  const MemoizedTxLoader = React.memo(() =>
    isTxWaitingConfirmation ? (
      <Typography.Title level={5} style={{ marginRight: '16px' }}>
        <Spin />
        Confirming Tx...
      </Typography.Title>
    ) : (
      <></>
    )
  );
  return (
    <Row justify={'space-between'} style={{ width: '100%' }}>
      <Col>
        <Row gutter={[8, 8]}>
          <Col>
            <Typography.Title level={3} className={'colored-text'}>
              prezents
            </Typography.Title>
          </Col>
          {navBarLinks.map((nav) => {
            return (
              <Col key={nav.name}>
                <Tooltip title={nav.tooltip}>
                  <Button
                    icon={nav.icon}
                    type={'text'}
                    onClick={() => router.push(nav.link)}
                    style={{ fontSize: navBarFontSize }}
                  >
                    {nav.name}
                  </Button>
                </Tooltip>
              </Col>
            );
          })}
          {/* <Col>
            <Tooltip title={'reload'}>
              <Button
                icon={<UndoOutlined style={{ fontSize: navBarFontSize }} />}
                onClick={handleReloadQuizzes}
                type={'text'}
                style={{ fontSize: navBarFontSize }}
              />
            </Tooltip>
          </Col> */}
        </Row>
      </Col>

      <Col>
        <Row align='middle'>
          <Typography.Text style={{ marginRight: '24px' }}>
            testnet
          </Typography.Text>
          <MemoizedTxLoader />
          <HomeWalletConnect />
        </Row>
      </Col>
    </Row>
  );
};

// const mapDispatchToProps = (dispatch) => ({
//   txConfirmedAction: bindActionCreators(txConfirmedAction, dispatch),
// });

// const mapStateToProps = (state) => ({
//   quizzesState: state.quizzesReducer,
// });

// export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
export default NavBar;
