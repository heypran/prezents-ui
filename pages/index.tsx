import type { NextPage } from 'next';
import Head from 'next/head';
import { Button, Col, Divider, Row, Typography, Image } from 'antd';
import { HomeActionCard } from '../components';
import WalletConnectComponent from '../components/home-wallet-connect/home-wallet-connect';
import { useGetQuizDappStatus } from '../state/quiz/hooks';
import NavBar from '../components/nav-bar/nav-bar';
import Footer from '../components/footer';
import Subscription from '../components/home-action-card/subscription';
import { useWalletContext } from '../components/WalletContext';
import { useEffect } from 'react';
import { useAppDispatch } from '../state';
import { fetchStats } from '../state/quiz/reducer';
import AnimatedNumber from 'react-animated-numbers';

require('../styles/home-page.less');
require('../styles/colored-text.less');
require('../styles/home-stats.less');

const Home: NextPage = () => {
  const state = useGetQuizDappStatus();
  const dispatch = useAppDispatch();

  const { account } = useWalletContext();

  useEffect(() => {
    dispatch(fetchStats());
  }, []);
  console.log('state', state.quizDapp.dappStats);
  return (
    <>
      <Head>
        <title>Prezents | Your go to learn to earn dapp</title>
        <meta
          property='og:title'
          content='Prezents | Your go to learn to earn dapp'
          key='title'
        />
      </Head>
      <Row
        style={{
          marginTop: 24,
          marginInlineEnd: 48,
          marginInlineStart: 48,
        }}
      >
        <NavBar />
        {/* <WalletConnectComponent /> */}
        <Divider />
      </Row>
      <Row
        justify={'center'}
        align={'middle'}
        style={{ height: '360px', backgroundColor: '#333745', padding: '24px' }}
      >
        <Col>
          <Typography.Title
            level={1}
            style={{ textAlign: 'center' }}
            className={'controls-text'}
          >
            Don't just learn. Earn! 🎁
          </Typography.Title>

          {/* <Typography.Title level={3} style={{ textAlign: 'center' }}>
            First open and transparent platform with earn to learn model.
            Learning has never been so rewarding.
          </Typography.Title> */}
          <Typography.Title level={1} className={'colored-text'}>
            prezents
          </Typography.Title>
          <Typography.Title
            level={3}
            style={{
              textAlign: 'center',
              // wordBreak: 'break-all',
              wordWrap: 'break-word',
              width: '600px',
            }}
          >
            helps make crypto education and using crypto platforms, a fun and
            rewarding expereince.
          </Typography.Title>

          {/* <Typography.Title
            level={3}
            style={{
              textAlign: 'center',
              // wordBreak: 'break-all',
              wordWrap: 'break-word',
              width: '600px',
            }}
          >
            Not only that, by attempting to LEARN you have opportunity to EARN
          </Typography.Title> */}
        </Col>
        <Col span={24} style={{ marginTop: '24px' }}>
          <Row justify='center'>
            <Subscription />
          </Row>
        </Col>
      </Row>
      <Row justify={'center'} align={'middle'} style={{ height: '60%' }}>
        <Row gutter={[8, 8]}>
          {/* <Col xs={24} lg={8}>
            {
              <HomeActionCard
                // ⚙️
                name={'Manage 📝 '}
                number={''}
                path={'/my-quizzes'}
              />
            }
          </Col> */}
          <Col xs={24} lg={8}>
            <HomeActionCard name={'Earn 💰'} number={''} path={'/quizzes'} />
          </Col>
          <Col xs={24} lg={8} offset={8}>
            <HomeActionCard
              name={'Create 🖊️'}
              number={''}
              path={'/create-quiz'}
              requireUser={true}
              disabled
            />
          </Col>
        </Row>
      </Row>

      <Row
        justify={'center'}
        align={'middle'}
        style={{
          height: '260px',
          backgroundColor: '#22B69B',
          padding: '16px',
        }}
      >
        <Col>
          {typeof window == 'object' && (
            <AnimatedNumber
              includeComma
              animateToNumber={state.quizDapp.dappStats.totalCreated ?? 0}
              fontStyle={{ fontSize: 40, textAlign: 'center' }}
              configs={[
                { mass: 1, tension: 220, friction: 100 },
                { mass: 1, tension: 180, friction: 130 },
                { mass: 1, tension: 280, friction: 90 },
                { mass: 1, tension: 180, friction: 135 },
                { mass: 1, tension: 260, friction: 100 },
                { mass: 1, tension: 210, friction: 180 },
              ]}
            />
          )}
          <Typography.Text
            style={{
              textAlign: 'center',
              fontSize: '24px',
              // wordBreak: 'break-all',
              wordWrap: 'break-word',
              marginBottom: '24px',
            }}
          >
            quizzes created.
          </Typography.Text>
          {/* <Typography.Title
            level={1}
            style={{
              textAlign: 'center',
              // wordBreak: 'break-all',
              wordWrap: 'break-word',
              marginBottom: '24px',
            }}
          >
            {state.quizDapp.dappStats.totalCreated} &nbsp;
           
          </Typography.Title> */}
          {typeof window == 'object' && (
            <AnimatedNumber
              includeComma
              animateToNumber={state.quizDapp.dappStats?.totalParticipants ?? 0}
              fontStyle={{ fontSize: 40, textAlign: 'center' }}
              configs={[
                { mass: 1, tension: 220, friction: 100 },
                { mass: 1, tension: 180, friction: 130 },
                { mass: 1, tension: 280, friction: 90 },
                { mass: 1, tension: 180, friction: 135 },
                { mass: 1, tension: 260, friction: 100 },
                { mass: 1, tension: 210, friction: 180 },
              ]}
            />
          )}
          <Typography.Text
            style={{
              textAlign: 'center',
              fontSize: '24px',
              // wordBreak: 'break-all',
              wordWrap: 'break-word',
              marginBottom: '24px',
            }}
          >
            submissions.
          </Typography.Text>
          {/* {window != null && (
            <AnimatedNumber
              includeComma
              animateToNumber={
                state.quizDapp.dappStats?.totalRewardsRedeemed ?? 0
              }
              fontStyle={{ fontSize: 40, textAlign: 'center' }}
              configs={[
                { mass: 1, tension: 220, friction: 100 },
                { mass: 1, tension: 180, friction: 130 },
                { mass: 1, tension: 280, friction: 90 },
                { mass: 1, tension: 180, friction: 135 },
                { mass: 1, tension: 260, friction: 100 },
                { mass: 1, tension: 210, friction: 180 },
              ]}
            />
          )}

          <Typography.Text
            style={{
              textAlign: 'center',
              fontSize: '24px',
              // wordBreak: 'break-all',
              wordWrap: 'break-word',
              marginBottom: '24px',
            }}
          >
            scholars.
          </Typography.Text> */}
        </Col>
      </Row>

      <Row
        justify={'center'}
        align={'middle'}
        style={{
          height: '200px',
          backgroundColor: '#2E5E77',
          padding: '16px',
        }}
      >
        <Col>
          <Typography.Title
            level={4}
            style={{
              textAlign: 'center',
              // wordBreak: 'break-all',
              wordWrap: 'break-word',
              marginBottom: '24px',
            }}
          >
            Attempt quizzes on various topics
          </Typography.Title>

          <Row justify={'center'} align={'middle'}>
            {['eth', 'solidity', 'ts', 'js'].map((str) => {
              return (
                <Col key={str} style={{ marginLeft: '16px' }}>
                  <Image
                    src={`/assets/lang/${str}.svg`}
                    height='100px'
                    width='100px'
                    alt='Pythagorean - learn to earn platform'
                    preview={false}
                  />
                </Col>
              );
            })}
          </Row>
        </Col>
      </Row>

      <Row
        justify={'center'}
        align={'middle'}
        style={{
          height: '240px',
          backgroundColor: '#333745',
          padding: '24px',
        }}
      >
        <Col>
          <Typography.Title
            level={4}
            style={{
              textAlign: 'center',
              // wordBreak: 'break-all',
              wordWrap: 'break-word',
              marginBottom: '24px',
            }}
          >
            We are launching Beta soon 🎉 Get notified!
          </Typography.Title>
          <Subscription />
        </Col>
      </Row>
      <Footer />
    </>
  );
};

export default Home;
