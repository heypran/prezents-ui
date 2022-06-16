import React, { FC, useEffect } from 'react';
import { Button, Col, Divider, Row, Tooltip, Typography } from 'antd';

import {
  HomeOutlined,
  EditFilled,
  UndoOutlined,
  DollarCircleFilled,
  IdcardFilled,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { appName, githubLink } from '../config/constants';
import { GithubIcon } from './icons/github';

interface MainProps {}
const navBarFontSize = '16px';
type NavBarLinkType = {
  link: string;
  name: string;
  tooltip: string;
  icon: any;
};
const footerLink = [
  {
    link: '/',
    name: 'Home',
    tooltip: 'Home',
    icon: <HomeOutlined style={{ fontSize: navBarFontSize }} />,
  },
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

  {
    link: '/content-policy',
    name: 'Content Policy',
    tooltip: 'User content policy',
    icon: <EditFilled style={{ fontSize: navBarFontSize }} />,
  },
];
const Footer: FC<MainProps> = ({}: MainProps) => {
  const router = useRouter();

  return (
    <Row
      justify={'space-between'}
      style={{ width: '100%', padding: '40px 0', backgroundColor: '#222' }}
    >
      <Divider />
      <Row
        gutter={[8, 8]}
        style={{ marginBottom: '24px', width: '100%' }}
        justify='center'
        align='middle'
      >
        {footerLink.map((nav) => {
          return (
            <Col>
              <Tooltip title={nav.tooltip}>
                <Button
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
      </Row>

      <Row
        justify='center'
        align='middle'
        style={{ margin: '0 48px', marginTop: '24px', width: '100%' }}
      >
        <Typography.Title
          level={5}
          style={{ textAlign: 'center' }}
          className={'controls-text'}
        >
          2022 | {appName}
        </Typography.Title>

        {/* <Button
          type={'text'}
          icon={<GithubIcon />}
          href={githubLink}
          style={{ marginLeft: '16px' }}
        /> */}
      </Row>
    </Row>
  );
};

export default Footer;
