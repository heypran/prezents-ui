import React, { FC } from 'react';
import { Card, Col, List, Row, Typography } from 'antd';

import Header from '../components/header';
import { Wrapper } from '../components/wrapper';

interface MainProps {}

const rules = [
  'Create authentic content where you have a personal interest, and do not cheat or engage in content manipulation (including spamming, vote manipulation) or otherwise interfere with or disrupt the platform.',
  'Respect the privacy of others. Instigating harassment, for example by revealing someone’s personal or confidential information, is not allowed. Never post or threaten to post intimate or sexually-explicit media of someone without their consent.',
  'Do not create content or encourage the posting of sexual or suggestive content involving minors.',
  'You don’t have to use your real name to use Prezents, but don’t impersonate an individual or an entity in a misleading or deceptive manner.',
  'Ensure people have predictable experiences on Prezents by properly labeling content such quizzes, blogs etc. User are not allowed to create particularly content that is graphic, sexually-explicit, or offensive.',
  'Keep it legal, and avoid posting illegal content or soliciting or facilitating illegal or prohibited transactions.',
  'Don’t break the site or do anything that interferes with normal use of Prezents.',
];
const enfrocements = [
  'Disapproving your content, removing it completely or making it inactive',
  'Temporary or permanent suspension of accounts',
  'Removal of privileges from, or adding restrictions to, accounts',
  'Removal of content and reward prizes',
  'Banning the user',
];

const ContentPolicy: FC<MainProps> = ({}) => {
  return (
    <>
      <Header
        title='Prezents | Content Policy'
        meta='prezents, content policy'
      />
      <Wrapper>
        <Row justify='center' align='top'>
          <Col span={24}>
            <Typography.Title
              level={2}
              style={{ textAlign: 'center' }}
              className={'controls-text'}
            >
              <Typography.Text code={true}>Content Policy</Typography.Text>
            </Typography.Title>
            <Row justify='center'>
              <Card style={{}}>
                <Typography.Title level={5}>
                  Prezents is utilized by a vast network of educators, creators,
                  and web3 communities, the Prezents users.
                </Typography.Title>
                <Typography.Title level={5}>
                  Users may be allowed to create content, post, comment, vote,
                  discuss, learn, debate, support, and connect with people who
                  share your interests. Everyone on Prezents should have an
                  expectation of content they are consuming, so please respect
                  the quality and type of content that Prezents allows on the
                  platform. Below governing rules are the platform-wide rules
                  that apply to everyone on Prezents. Everyone is expected to
                  follow these rules.
                </Typography.Title>
                <Typography.Title level={5}>
                  Prezents is only what we make of it together, and can only
                  exist if we operate by a shared set of rules. We ask that you
                  abide by not just the letter of these rules, but the spirit as
                  well.
                </Typography.Title>
                <Typography.Title level={3}>
                  Rules
                  <List>
                    {rules.map((rule) => (
                      <List.Item>{rule}</List.Item>
                    ))}
                  </List>
                </Typography.Title>
                <Typography.Title level={3}>
                  Enforcement
                  <List>
                    {enfrocements.map((en) => (
                      <List.Item>{en}</List.Item>
                    ))}
                  </List>
                </Typography.Title>
              </Card>
            </Row>
          </Col>
        </Row>
      </Wrapper>
    </>
  );
};

export default ContentPolicy;
