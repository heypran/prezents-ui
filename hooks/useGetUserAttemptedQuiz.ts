import { useEffect, useState } from 'react';
import QuizApiService from '../services/quizApi';

export const useGetUserQuizIds = (
  user?: string,
  chainId?: number
): { userAlreadyAttempted: number[] } => {
  const [userAlreadyAttempted, setUserAttemptedQuizIds] = useState<number[]>(
    []
  );

  useEffect(() => {
    if (user == null || chainId == null) {
      return;
    }

    (async () => {
      const userAlreadyAttempted =
        await QuizApiService.getInstance().getUserAttemptedQuizIds(user);

      setUserAttemptedQuizIds(userAlreadyAttempted);
    })();
  }, [user, chainId]);

  return { userAlreadyAttempted };
};
