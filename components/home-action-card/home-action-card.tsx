import { FC } from 'react';
import { message, Typography } from 'antd';
import { useRouter } from 'next/router';
import { QuizzesState } from '../../store/quizzes/reducer';
import { useGetUserAccount } from '../../state/quiz/hooks';

require('./home-action-card.less');

interface MainProps {
  number: string;
  name: string;
  text?: string;
  path: string;
  requireUser?: boolean;
  disabled?: boolean;
}

const HomeActionCard: FC<MainProps> = (props) => {
  const { path, number, name, text, requireUser, disabled } = props;

  const router = useRouter();
  const user = useGetUserAccount();

  const handleCardClick = () => {
    if (disabled) {
      message.warn(`Coming soon!`, 3);
      return;
    }
    if (requireUser && user == null) {
      return message.error(`Please connect the wallet first!`, 3);
    }
    router.push(path);
  };

  return (
    <div className='card' onClick={handleCardClick}>
      <div className={`box ${disabled ? 'disabledBox' : ''}`}>
        <div className='content'>
          <h2>
            <code>{number}</code>
          </h2>

          <Typography.Title
            level={3}
            style={{ textAlign: 'center' }}
            className={'controls-text'}
          >
            <Typography.Text code={true}>{name}</Typography.Text>
          </Typography.Title>
          {text && <p>{text}</p>}
        </div>
      </div>
    </div>
  );
};

export default HomeActionCard;
