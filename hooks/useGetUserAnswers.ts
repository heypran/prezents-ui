import { useEffect, useState } from 'react';
import QuizApiService from '../services/quizApi';

export const useGetUserAnswers = (
  user: string,
  quizContractId: string,
  chainId: number
): { userAlreadyAttempted: number[] } => {
  const [userAlreadyAttempted, setUserAlreadyAttempted] = useState<number[]>(
    []
  );

  useEffect(() => {
    if (user == null || quizContractId == null || chainId == null) {
      return;
    }

    (async () => {
      const userAlreadyAttempted =
        await QuizApiService.getInstance().getSubmittedAnswer(
          user,
          quizContractId
        );
      setUserAlreadyAttempted(userAlreadyAttempted);
    })();
  }, [user, quizContractId, chainId]);

  return { userAlreadyAttempted };
};
